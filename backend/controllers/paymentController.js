const axios = require('axios');
const crypto = require('crypto');
const uniqid = require('uniqid');
const Bill = require('../models/Bill');
const Transaction = require('../models/Transaction');
const { sendPaymentReceipt } = require('../services/emailService');
const razorpay = require('../services/razorpayService');

/**
 * @desc    Create Razorpay Order
 */
const createOrder = async (req, res) => {
  try {
    const { billId } = req.body;
    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ message: 'Bill is already paid' });
    }

    const order = await razorpay.createOrder(bill.totalAmount, billId);

    // Create pending transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      bill: bill._id,
      amount: bill.totalAmount,
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      razorpayOrderId: order.id,
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      transactionId: transaction._id
    });

  } catch (error) {
    console.error('[Razorpay Controller] Order creation failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server failed to initiate Razorpay order', 
      error: error.message,
      details: error.stack
    });
  }
};

/**
 * @desc    Verify Razorpay Payment
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify signature
    const isValid = razorpay.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Find transaction by razorpayOrderId
    const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id }).populate('bill');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.paymentStatus === 'success') {
      return res.json({ success: true, status: 'success' });
    }

    // Update transaction
    transaction.paymentStatus = 'success';
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    await transaction.save();

    // Update bill
    const bill = await Bill.findById(transaction.bill);
    if (bill) {
      bill.status = 'paid';
      await bill.save();
      
      sendPaymentReceipt(req.user.email, {
        billType: bill.billType,
        amount: transaction.amount,
        transactionId: transaction._id,
      });
    }

    res.json({ success: true, status: 'success' });

  } catch (error) {
    console.error('[Razorpay] Verification Error:', error.message);
    res.status(500).json({ message: 'Verification failed' });
  }
};

/**
 * @desc    Get user's payment history
 */
const getPaymentHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('bill')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Generate receipt details
 */
const generateReceipt = async (req, res) => {
  try {
    const { transactionId } = req.params;
    let transaction;

    // Try finding by transaction ID first
    transaction = await Transaction.findById(transactionId)
      .populate('bill')
      .populate('user', 'name email phone');

    // If not found, try finding the successful transaction for this bill ID
    if (!transaction) {
      transaction = await Transaction.findOne({ 
        bill: transactionId, 
        paymentStatus: 'success' 
      })
      .populate('bill')
      .populate('user', 'name email phone');
    }

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction or Paid Bill not found' });
    }

    const receipt = {
      status: 'success', // For frontend confirmation
      receiptNo: `RCP-${transaction._id.toString().slice(-8).toUpperCase()}`,
      date: transaction.createdAt,
      payerName: transaction.user?.name || 'Citizen',
      payerEmail: transaction.user?.email || '',
      billType: transaction.bill?.billType || 'N/A',
      amount: transaction.amount,
      paymentId: transaction.razorpayPaymentId || 'N/A',
      paymentStatus: transaction.paymentStatus,
    };

    res.json(receipt);
  } catch (error) {
    console.error('[Receipt] Generation error:', error);
    res.status(500).json({ message: 'Receipt generation failed' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  generateReceipt,
};
