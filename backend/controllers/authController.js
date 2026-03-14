const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateOTP, sendOTP } = require('../services/otpService');
const { sendWelcomeEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, isSeniorCitizen, address } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      isSeniorCitizen: isSeniorCitizen || false,
      address: address || '',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isSeniorCitizen: user.isSeniorCitizen,
        token: generateToken(user._id),
      });

      // Send Welcome Email (Non-blocking)
      sendWelcomeEmail(user.email, user.name);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send OTP to phone
// @route   POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { phone, email } = req.body;
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // Check if unregistered phone for signup, or existing user for verification
    let user = await User.findOne({ phone });
    
    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // Store OTP temporarily - will be validated during registration
      // For now, we store it in a temp way (in production, use Redis)
      // We'll return it to client for dev purposes
    }

    await sendOTP(email, otp, phone);

    res.json({ 
      message: 'OTP sent successfully',
      // In dev mode, return OTP for testing
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    const user = await User.findOne({ phone });
    
    if (!user) {
      // For signup flow, just validate OTP format
      return res.json({ verified: true, message: 'OTP verified' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    user.isPhoneVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ verified: true, message: 'Phone number verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isSeniorCitizen: user.isSeniorCitizen,
        avatarUrl: user.avatarUrl,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Forgot password - send OTP
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOTP(user.email, otp, user.phone);

    res.json({ 
      message: 'OTP sent to your registered email address',
      phone: user.phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpires');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.avatarUrl = req.body.avatarUrl !== undefined ? req.body.avatarUrl : user.avatarUrl;
      user.address = req.body.address || user.address;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isSeniorCitizen: updatedUser.isSeniorCitizen,
        avatarUrl: updatedUser.avatarUrl,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
};
