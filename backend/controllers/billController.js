const Bill = require('../models/Bill');

// Electricity: basic tier system
const calculateElectricity = (units) => {
  let amount = 0;
  if (units <= 100) amount = units * 3; // $3/unit
  else if (units <= 300) amount = 100 * 3 + (units - 100) * 5; // $5/unit above 100
  else amount = 100 * 3 + 200 * 5 + (units - 300) * 8; // $8/unit above 300
  return amount;
};

// Water: fixed rate + excess
const calculateWater = (liters) => {
  const baseRate = 200; // Fixed monthly base
  const excess = liters > 10000 ? (liters - 10000) * 0.05 : 0;
  return baseRate + excess;
};

// Property: percentage of property value
const calculateProperty = (propertyValue, stateCode) => {
  const taxRate = stateCode === 'URBAN' ? 0.05 : 0.02; // 5% urban, 2% rural
  return propertyValue * taxRate;
};

// @desc    Calculate and generate a new bill
// @route   POST /api/bills/calculate
// @access  Private
const calculateBill = async (req, res) => {
  try {
    const { billType, consumerNumber, units, liters, propertyValue, stateCode, month, year } = req.body;
    let baseAmount = 0;

    if (billType === 'electricity') baseAmount = calculateElectricity(Number(units));
    else if (billType === 'water') baseAmount = calculateWater(Number(liters));
    else if (billType === 'property') baseAmount = calculateProperty(Number(propertyValue), stateCode);
    else return res.status(400).json({ message: 'Invalid bill type' });

    let discountAmount = 0;
    // 10% Senior Citizen Discount
    if (req.user && req.user.isSeniorCitizen) {
      discountAmount = baseAmount * 0.10;
    }

    const taxAmount = (baseAmount - discountAmount) * 0.05; // 5% standard service tax
    const totalAmount = baseAmount - discountAmount + taxAmount;

    // Save to DB
    const newBill = await Bill.create({
      user: req.user._id,
      billType,
      consumerNumber,
      billingPeriod: { month, year },
      baseAmount,
      discountAmount,
      taxAmount,
      totalAmount,
      status: 'pending',
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Due next month
      calculationDetails: { units, liters, propertyValue, stateCode },
    });

    res.status(201).json(newBill);
  } catch (error) {
    res.status(500).json({ message: 'Calculation failed', error: error.message });
  }
};

// @desc    Get all bills for a user
// @route   GET /api/bills
// @access  Private
const getUserBills = async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get bill by ID
// @route   GET /api/bills/:id
// @access  Private
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    // Check if user owns bill or is admin (assuming admin wrapper handles that logic elsewhere, this simple check prevents cross-user access)
    if (bill.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to view this bill' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  calculateBill,
  getUserBills,
  getBillById,
};
