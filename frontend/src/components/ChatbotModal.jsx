import { useState, useRef, useEffect, useContext } from 'react';
import { MessageSquare, X, Send, Zap, Droplets, Home, CreditCard, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const quickReplies = [
  { label: 'Electricity Bill', icon: Zap },
  { label: 'Water Bill', icon: Droplets },
  { label: 'Property Tax', icon: Home },
  { label: 'Payment Help', icon: CreditCard },
];

const ChatbotModal = () => {
  const { user, isChatOpen, setIsChatOpen } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "👋 Hello! I'm **SmartGov AI**. I can help you calculate bills, understand charges, and navigate payments. What would you like to know?" },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isChatOpen) inputRef.current?.focus();
  }, [isChatOpen]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const headers = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const { data } = await axios.post('/ai/chat', { message: text }, { headers });
      
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
        setIsTyping(false);
      }, 600);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble responding right now. Please try again later." }]);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (label) => {
    sendMessage(`How do I calculate my ${label}?`);
  };

  // Simple markdown-like bold rendering
  const renderText = (text) => {
    return text.split('**').map((part, i) => 
      i % 2 === 0 ? part : <strong key={i} className="text-primary-300 font-semibold">{part}</strong>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-400 text-white flex items-center justify-center shadow-2xl cursor-pointer z-50 hover:scale-110 transition-transform"
            style={{ boxShadow: '0 0 30px rgba(113, 56, 218, 0.4)' }}
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[380px] max-h-[600px] z-50 flex flex-col"
            style={{
              background: 'rgba(3, 4, 28, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(113, 56, 218, 0.2)',
              borderRadius: '1.5rem',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(113, 56, 218, 0.15)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">SmartGov AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-2 text-gray-500 hover:text-white rounded-xl hover:bg-surface-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[380px]" style={{ scrollbarWidth: 'thin' }}>
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-surface-600 border border-white/5 text-gray-300 rounded-2xl rounded-tl-sm'
                  }`}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{renderText(msg.text)}</div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-surface-600 border border-white/5 p-3 rounded-2xl rounded-tl-sm">
                    <div className="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies (only show when few messages) */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickReplies.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => handleQuickReply(label)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 border border-white/10 px-3 py-1.5 rounded-full hover:border-primary-500/30 hover:text-primary-400 transition-colors"
                  >
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about bills, payments..."
                  className="flex-1 bg-surface-600 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-primary-500/30 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center text-white disabled:opacity-30 transition-opacity flex-shrink-0"
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotModal;
