const ChatHistory = require('../models/ChatHistory');

const SYSTEM_PROMPT = `You are SmartGov AI, an intelligent assistant for the E-Government Bills Calculation & Payment Platform. You help citizens with:

1. **Bill Calculations**: Explaining how electricity, water, and property tax bills are calculated
   - Electricity: Tiered slab system - ₹3/unit (0-100), ₹5/unit (101-300), ₹8/unit (300+)
   - Water: ₹200 base rate + ₹0.05/liter excess above 10,000L
   - Property Tax: 5% for urban, 2% for rural zones based on assessed property value

2. **Payment Guidance**: Helping users navigate the Razorpay payment process
3. **Government Charges**: Explaining 5% service tax applied on all bills
4. **Senior Citizen Discounts**: 10% discount on base tariff for verified senior citizens
5. **Website Navigation**: Guiding users to the right pages (Dashboard, Calculators, Payment)

Keep responses concise, friendly, and helpful. Use bullet points when explaining calculations. If asked about something outside government bills, politely redirect to bill-related topics.`;

// Groq API call (OpenAI-compatible REST API)
async function callGroqAPI(message) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// @desc    Chat with AI
// @route   POST /api/ai/chat
const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    let response = '';

    // Try Groq first (fast, free tier available)
    if (process.env.GROQ_API_KEY) {
      try {
        console.log('Using Groq AI (Llama 3.3 70B)...');
        response = await callGroqAPI(message);
      } catch (aiError) {
        console.error('Groq error:', aiError.message);
      }
    }

    // Try OpenAI as second option
    if (!response && process.env.OPENAI_API_KEY) {
      try {
        console.log('Using OpenAI fallback...');
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: message },
          ],
          max_tokens: 500,
          temperature: 0.7,
        });

        response = completion.choices[0].message.content;
      } catch (aiError) {
        console.error('OpenAI error:', aiError.message);
      }
    }

    // Fallback: Smart rule-based responses
    if (!response) {
      console.log('Using rule-based fallback responses');
      response = getSmartResponse(message);
    }

    // Save chat history if user is authenticated
    if (req.user) {
      await ChatHistory.create({
        userId: req.user._id,
        message,
        response,
      });
    }

    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: 'Chat failed', error: error.message });
  }
};

// @desc    Get chat history
// @route   GET /api/ai/history
const getChatHistory = async (req, res) => {
  try {
    const history = await ChatHistory.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Smart fallback responses
function getSmartResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('electricity') && (msg.includes('calculate') || msg.includes('how'))) {
    return `⚡ **Electricity Bill Calculation**\n\nOur tiered slab system works like this:\n\n• **0 – 100 units**: ₹3 per unit\n• **101 – 300 units**: ₹5 per unit\n• **301+ units**: ₹8 per unit\n\nPlus 5% service tax on the total. Senior citizens get a 10% discount on the base amount.\n\n👉 Head to the **Dashboard → Generate Statement** to calculate your exact bill!`;
  }

  if (msg.includes('water') && (msg.includes('calculate') || msg.includes('how') || msg.includes('bill'))) {
    return `💧 **Water Bill Calculation**\n\n• **Base charge**: ₹200/month (flat rate)\n• **Excess usage**: ₹0.05 per liter above 10,000L\n\nPlus 5% service tax. Senior citizens enjoy a 10% discount.\n\n👉 Use the **Bill Calculator** on your Dashboard to get a detailed breakdown!`;
  }

  if (msg.includes('property') && (msg.includes('tax') || msg.includes('calculate') || msg.includes('how'))) {
    return `🏠 **Property Tax Calculation**\n\n• **Urban zones**: 5% of assessed property value\n• **Rural zones**: 2% of assessed property value\n\nPlus 5% service tax. Senior citizen discount of 10% applied on base amount.\n\n👉 Go to **Dashboard → Generate Statement** and select Property Tax!`;
  }

  if (msg.includes('pay') || msg.includes('payment') || msg.includes('razorpay')) {
    return `💳 **Payment Process**\n\n1. First, calculate your bill on the Dashboard\n2. Click **"Pay Now"** on any pending bill\n3. You'll be taken to our secure Razorpay gateway\n4. Complete payment using UPI, cards, or net banking\n5. Download your digital receipt after payment\n\n👉 Go to your **Dashboard** to view pending bills!`;
  }

  if (msg.includes('senior') || msg.includes('discount') || msg.includes('elderly')) {
    return `👴 **Senior Citizen Benefits**\n\nCitizens aged 60+ who verify their status during registration automatically receive:\n\n• **10% flat discount** on the base tariff of ALL utility bills\n• This applies to electricity, water, and property tax\n\nThe discount is calculated before taxes are applied.`;
  }

  if (msg.includes('receipt') || msg.includes('download')) {
    return `📄 **Digital Receipts**\n\nAfter successful payment:\n\n1. Go to your **Dashboard**\n2. Find the paid bill in your transaction history\n3. Click the **Download** icon to get your receipt\n\nReceipts contain official transaction IDs and are legally valid for KYC/residency verification.`;
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `👋 Hello! I'm **SmartGov AI**, your digital civic assistant.\n\nI can help you with:\n\n• 💡 Calculating electricity, water, or property tax bills\n• 💳 Guiding you through payments\n• 📋 Explaining government charges & discounts\n• 🧭 Navigating the platform\n\nWhat would you like to know?`;
  }

  return `I'm **SmartGov AI**, here to help you with government bill calculations and payments.\n\nYou can ask me about:\n\n• ⚡ Electricity bill calculations\n• 💧 Water bill estimates\n• 🏠 Property tax rates\n• 💳 Payment process\n• 👴 Senior citizen discounts\n• 📄 Downloading receipts\n\nHow can I assist you today?`;
}

module.exports = { chat, getChatHistory };
