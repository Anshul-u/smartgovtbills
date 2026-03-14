const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { getStats, getAllUsers, getAllPayments } = require('../controllers/adminController');

router.get('/stats', protect, admin, getStats);
router.get('/users', protect, admin, getAllUsers);
router.get('/payments', protect, admin, getAllPayments);

module.exports = router;
