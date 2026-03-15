require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Basic Route for API test
app.get('/api/health', (req, res) => {
  res.send('SmartGov Bills API is running...');
});

// System Status for Debugging
app.get('/api/system-status', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.2.1',
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID ? 'Configured ✅' : 'Missing ❌',
      secret: process.env.RAZORPAY_KEY_SECRET ? 'Configured ✅' : 'Missing ❌',
    },
    env: process.env.NODE_ENV
  });
});

// GET test endpoint (accessible from browser)
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

// Import Routes with error handling
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✓ Auth routes loaded');
} catch (e) {
  console.error('✗ Auth routes failed:', e.message);
  console.error(e.stack);
}

try {
  const billRoutes = require('./routes/billRoutes');
  app.use('/api/bills', billRoutes);
  console.log('✓ Bill routes loaded');
} catch (e) {
  console.error('✗ Bill routes failed:', e.message);
}

try {
  const paymentRoutes = require('./routes/paymentRoutes');
  app.use('/api/payments', paymentRoutes);
  console.log('✓ Payment routes loaded');
} catch (e) {
  console.error('✗ Payment routes failed:', e.message);
}

try {
  const adminRoutes = require('./routes/adminRoutes');
  app.use('/api/admin', adminRoutes);
  console.log('✓ Admin routes loaded');
} catch (e) {
  console.error('✗ Admin routes failed:', e.message);
}

try {
  const aiRoutes = require('./routes/aiRoutes');
  app.use('/api/ai', aiRoutes);
  console.log('✓ AI routes loaded');
} catch (e) {
  console.error('✗ AI routes failed:', e.message);
}

// --- DEPLOYMENT CONFIGURATION ---
if (process.env.NODE_ENV === 'production') {
  const root = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(root));

  app.get('/', (req, res) => {
  res.sendFile('index.html', { root });
});
} else {
  app.get('/', (req, res) => {
    res.send('API is running in development mode...');
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\nServer running on port ${PORT}`);
  console.log('Test: http://localhost:5000/api/test');
  console.log('OTP:  POST http://localhost:5000/api/auth/send-otp\n');
});
