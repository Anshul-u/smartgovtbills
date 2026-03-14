const { OpenAI } = require('openai');

// Initialize only if API key is present
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const generateChatResponse = async (messages) => {
  try {
    if (!openai) {
      return "Hello! I am the SmartGov AI Assistant. (Note: OpenAI API key is missing, so this is a mock response). How can I help you today?";
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for the SmartGov government portal. You help citizens understand property tax, electricity, and water bills, and guide them on how to pay.' },
        ...messages
      ],
      temperature: 0.5,
      max_tokens: 300,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Error:', error.message);
    return "I'm having trouble connecting to my AI brain right now. Please try again later.";
  }
};

module.exports = {
  generateChatResponse,
};
