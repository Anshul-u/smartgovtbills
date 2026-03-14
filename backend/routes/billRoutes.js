const express = require('express');
const router = express.Router();
const { calculateBill, getUserBills, getBillById } = require('../controllers/billController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/calculate', protect, calculateBill);
router.get('/', protect, getUserBills);
router.get('/:id', protect, getBillById);

module.exports = router;
