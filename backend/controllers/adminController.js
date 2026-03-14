const User = require('../models/User');
const Bill = require('../models/Bill');
const Transaction = require('../models/Transaction');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'citizen' });
    const totalBills = await Bill.countDocuments();
    const totalPaidBills = await Bill.countDocuments({ status: 'paid' });
    const totalPendingBills = await Bill.countDocuments({ status: 'pending' });
    
    const totalPayments = await Transaction.countDocuments({ paymentStatus: 'success' });
    
    const revenueAgg = await Transaction.aggregate([
      { $match: { paymentStatus: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Bill type breakdown
    const billTypeStats = await Bill.aggregate([
      { $group: { 
        _id: '$billType', 
        count: { $sum: 1 }, 
        totalAmount: { $sum: '$totalAmount' } 
      }},
    ]);

    // Recent transactions
    const recentPayments = await Transaction.find({ paymentStatus: 'success' })
      .populate('user', 'name email')
      .populate('bill', 'billType totalAmount')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalBills,
      totalPaidBills,
      totalPendingBills,
      totalPayments,
      totalRevenue,
      billTypeStats,
      recentPayments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -otp -otpExpires').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Transaction.find({})
      .populate('user', 'name email phone')
      .populate('bill', 'billType totalAmount')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getStats, getAllUsers, getAllPayments };
