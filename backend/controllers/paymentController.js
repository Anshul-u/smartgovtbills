const axios = require('axios');
const crypto = require('crypto');
const uniqid = require('uniqid');
const Bill = require('../models/Bill');
const Transaction = require('../models/Transaction');
const { sendPaymentReceipt } = require('../services/emailService');

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
const PHONEPE_API_URL = process.env.PHONEPE_API_URL;
const PHONEPE_STATUS_URL = process.env.PHONEPE_STATUS_URL;

/**
 * @desc    Initiate PhonePe Payment (Redirect Flow)
 * @route   POST /api/payments/initiate
 */
const initiatePhonePePayment = async (req, res) => {
  try {
    const { billId } = req.body;
    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ message: 'Bill is already paid' });
    }

    const merchantTransactionId = uniqid('MTID');
    
    // Create pending transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      bill: bill._id,
      amount: bill.totalAmount,
      paymentMethod: 'phonepe',
      paymentStatus: 'pending',
      phonePeTransactionId: merchantTransactionId,
      phonePeMerchantId: MERCHANT_ID,
    });

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.user._id.toString(),
      amount: Math.round(bill.totalAmount * 100), // in paise
      redirectUrl: `${process.env.FRONTEND_URL}/payment-success?transactionId=${transaction._id}`,
      redirectMode: 'REDIRECT',
      callbackUrl: `${process.env.BACKEND_URL}/api/payments/webhook`,
      mobileNumber: req.user.phone ? req.user.phone.replace('+91', '') : '9999999999',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const fullURL = base64Payload + "/pg/v1/pay" + SALT_KEY;
    const checksum = crypto.createHash('sha256').update(fullURL).digest('hex') + "###" + SALT_INDEX;

    console.log('[PhonePe] Initiating payment for:', merchantTransactionId);

    const response = await axios.post(PHONEPE_API_URL, 
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'accept': 'application/json'
        }
      }
    );

    if (response.data.success) {
      const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
      res.json({
        success: true,
        redirectUrl,
        transactionId: transaction._id
      });
    } else {
      throw new Error(response.data.message || 'PhonePe initiation failed');
    }

  } catch (error) {
    console.error('[PhonePe] Init Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Payment initiation failed', 
      error: error.response?.data?.message || error.message 
    });
  }
};

/**
 * @desc    Check PhonePe Payment Status
 * @route   GET /api/payments/status/:transactionId
 */
const checkPhonePeStatus = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId).populate('bill');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const merchantTransactionId = transaction.phonePeTransactionId;
    const finalURL = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY;
    const checksum = crypto.createHash('sha256').update(finalURL).digest('hex') + "###" + SALT_INDEX;

    const options = {
      method: 'GET',
      url: `${PHONEPE_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': MERCHANT_ID
      }
    };

    const response = await axios.request(options);
    console.log('[PhonePe] Status Check for:', merchantTransactionId, response.data.code);

    if (response.data.success && response.data.code === 'PAYMENT_SUCCESS') {
      transaction.paymentStatus = 'success';
      transaction.phonePeState = 'COMPLETED';
      await transaction.save();

      // Update bill
      const bill = await Bill.findById(transaction.bill);
      if (bill) {
        bill.status = 'paid';
        await bill.save();
        
        // Send receipt
        sendPaymentReceipt(req.user.email, {
          billType: bill.billType,
          amount: transaction.amount,
          transactionId: transaction._id,
        });
      }

      res.json({ success: true, status: 'success' });
    } else {
      transaction.paymentStatus = 'failed';
      await transaction.save();
      res.json({ success: false, status: 'failed', message: response.data.message });
    }

  } catch (error) {
    console.error('[PhonePe] Status Check Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Status verification failed' });
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
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('bill')
      .populate('user', 'name email phone');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const receipt = {
      receiptNo: `RCP-${transaction._id.toString().slice(-8).toUpperCase()}`,
      date: transaction.createdAt,
      payerName: transaction.user?.name || 'Citizen',
      payerEmail: transaction.user?.email || '',
      billType: transaction.bill?.billType || 'N/A',
      amount: transaction.amount,
      paymentId: transaction.phonePeTransactionId,
      status: transaction.paymentStatus,
    };

    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Receipt generation failed' });
  }
};

module.exports = {
  initiatePhonePePayment,
  checkPhonePeStatus,
  getPaymentHistory,
  generateReceipt,
};
