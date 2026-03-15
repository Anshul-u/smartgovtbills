import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Download, TrendingUp, UserCircle, Wallet, Camera, Zap, Droplets, Home, Calculator, ArrowRight, Receipt, CheckCircle, History, HelpCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const { user, setUser, setIsChatOpen } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert('File too large (Max 2MB)');
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const { data } = await axios.put('/auth/profile', { avatarUrl: reader.result });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
      } catch (err) {
        console.error('Failed to upload', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchBills = async () => {
    try {
      const { data } = await axios.get('/bills');
      setBills(data);
    } catch (error) {
      console.error('Failed to fetch bills', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSystem = async () => {
      try {
        const { data } = await axios.get('/system-status');
        console.log('[System] Status:', data);
        if (data.razorpay.keyId === 'Missing ❌') {
          console.warn('[System] Razorpay keys are missing on the backend!');
        }
      } catch (err) {
        console.error('[System] Failed to fetch system status', err);
      }
    };
    checkSystem();
    fetchBills(); 
  }, []);

  const [payingBillId, setPayingBillId] = useState(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handlePay = async (billId, bill) => {
    setPayingBillId(billId);
    try {
      console.log(`[Frontend] Initiating Razorpay flow for bill:`, billId);
      if (!bill.totalAmount || bill.totalAmount <= 0) {
        throw new Error('Invalid bill amount. Please re-calculate.');
      }
      
      const { data } = await axios.post('/payments/create-order', { billId });
      console.log('[Frontend] Backend created order:', data.orderId);
      
      if (!data.orderId) {
        throw new Error('Server failed to provide a Razorpay Order ID');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page and try again.');
      }

      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SRQMvZLDR2zpyI';
      console.log(`[Frontend] Using Razorpay Key: ${rzpKey.substring(0, 8)}...`);

      const options = {
        key: rzpKey,
        amount: data.amount,
        currency: data.currency,
        name: 'SmartGov Bills',
        description: `${bill.billType.toUpperCase()} Bill Payment`,
        order_id: data.orderId,
        handler: async (response) => {
          console.log('[Frontend] Payment successful in modal, verifying...');
          try {
            const verifyRes = await axios.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              console.log('[Frontend] Verification success, redirecting...');
              window.location.href = `/payment-success?txn=${data.transactionId}&amount=${bill.totalAmount}`;
            } else {
              throw new Error(verifyRes.data.message || 'Signature verification failed');
            }
          } catch (err) {
            console.error('[Frontend] Verification Error:', err);
            alert(`Payment Success but Verification Failed: ${err.response?.data?.message || err.message}`);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#7c3aed'
        },
        modal: {
          ondismiss: function() {
            setPayingBillId(null);
            console.log('[Frontend] Payment modal closed by user');
          }
        }
      };

      console.log('[Frontend] Opening Razorpay modal...');
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('[Frontend] Modal payment failed:', response.error);
        alert(`Payment Error: ${response.error.description} (Code: ${response.error.code})`);
      });
      rzp.open();
      // No setPayingBillId(null) here, we wait for handler or ondismiss

    } catch (error) {
      console.error('[Frontend] handlePay Error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Payment Initiation Failed: ${errorMessage}`);
      setPayingBillId(null);
    }
  };

  const handleDownloadReceipt = async (billId) => {
    try {
      // Find the transaction for this bill from payment history
      const { data: payments } = await axios.get('/payments/history');
      const transaction = payments.find(p => p.bill?._id === billId && p.paymentStatus === 'success');
      if (transaction) {
        const { data: receipt } = await axios.get(`/payments/receipt/${transaction._id}`);
        // Create printable receipt
        const receiptWindow = window.open('', '_blank');
        receiptWindow.document.write(`
          <html><head><title>SmartGov Receipt</title><style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; }
          h1 { color: #7138da; } .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .label { color: #666; } .value { font-weight: bold; }
          </style></head><body>
          <h1>🏛️ SmartGov Bills - Payment Receipt</h1>
          <div class="row"><span class="label">Receipt No</span><span class="value">${receipt.receiptNo}</span></div>
          <div class="row"><span class="label">Date</span><span class="value">${new Date(receipt.date).toLocaleDateString()}</span></div>
          <div class="row"><span class="label">Payer</span><span class="value">${receipt.payerName}</span></div>
          <div class="row"><span class="label">Bill Type</span><span class="value">${receipt.billType}</span></div>
          <div class="row"><span class="label">Amount</span><span class="value">₹${receipt.amount.toFixed(2)}</span></div>
          <div class="row"><span class="label">Payment ID</span><span class="value">${receipt.paymentId}</span></div>
          <div class="row"><span class="label">Status</span><span class="value" style="color:green">✓ ${receipt.status}</span></div>
          <p style="margin-top:30px;color:#999;font-size:12px">This is a digitally generated receipt from SmartGov Bills Platform.</p>
          </body></html>
        `);
        receiptWindow.document.close();
        receiptWindow.print();
      }
    } catch (err) {
      console.error('Receipt error', err);
    }
  };

  const pendingBills = (bills || []).filter(b => b && b.status === 'pending');
  const paidBills = (bills || []).filter(b => b && b.status === 'paid');
  const totalPendingAmount = pendingBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPaidAmount = paidBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "How do I pay my pending bills?",
      a: "You can pay easily using Razorpay. Just click the 'Pay Dues' button on any pending bill, select your preferred payment method (UPI, Card, or Netbanking), and complete the transaction."
    },
    {
      q: "Is my payment safe and secure?",
      a: "Yes, absolutely. We use Razorpay’s industry-leading encrypted gateway to process all transactions. Your sensitive financial data is never stored on our servers."
    },
    {
      q: "How can I download my payment receipt?",
      a: "Once a payment is successfully completed, the bill moves to the 'Payment History' section. You can click the download icon next to the transaction to view and print your receipt."
    },
    {
      q: "What if my payment fails but money is deducted?",
      a: "Don't worry. If money is deducted but the status hasn't updated, Razorpay's system will usually settle it within 24 hours. If not, a refund is automatically initiated within 5-7 working days."
    },
    {
      q: "Are there any discounts for Senior Citizens?",
      a: "Yes! If you are registered as a Senior Citizen, a 10% discount is automatically applied to all your government utility bills (Electricity, Water, Property Tax) during the calculation phase."
    }
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-900 pt-8 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT SIDEBAR */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-6">
            {/* Profile Card */}
            <motion.div variants={itemVariants} initial="hidden" animate="show" className="glass-panel p-8 text-center">
              <div className="relative inline-block mb-4 group">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full bg-surface-600 border-4 border-surface-500 overflow-hidden flex items-center justify-center text-gray-500 cursor-pointer hover:opacity-90 transition-opacity">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle size={64} strokeWidth={1} />
                  )}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-400 rounded-full border-2 border-surface-700 flex items-center justify-center text-white cursor-pointer">
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-white">Hello, {user?.name || 'Citizen'}</h2>
              <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
              {user?.isSeniorCitizen && (
                <span className="inline-block mt-3 text-xs font-bold text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/20">
                  Senior Citizen · 10% Discount
                </span>
              )}
              <div className="mt-4 pt-4 border-t border-white/5">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">
                  Build: 2026.03.15.14.05 (Razorpay Active)
                </span>
              </div>
            </motion.div>

            {/* Balance Card */}
            <motion.div variants={itemVariants} initial="hidden" animate="show" transition={{delay: 0.1}} className="glass-panel px-8 py-8 text-center">
              <Wallet size={28} className="text-primary-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-white mb-1">₹{totalPendingAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h2>
              <p className="text-sm text-gray-500 mb-6">Outstanding Dues</p>
              <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Pending</div>
                  <div className="text-lg font-bold text-amber-400">{pendingBills.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Paid</div>
                  <div className="text-lg font-bold text-green-400">{paidBills.length}</div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} initial="hidden" animate="show" transition={{delay: 0.2}} className="glass-panel p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/calculator" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-600 transition-colors group">
                  <Calculator size={20} className="text-primary-400" />
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-white">Bill Calculator</span>
                  <ArrowRight size={16} className="text-gray-600 ml-auto group-hover:text-primary-400" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 space-y-6">
            {/* Stats Row */}
            <motion.div variants={itemVariants} initial="hidden" animate="show" transition={{delay: 0.2}} className="grid grid-cols-3 gap-4">
              {[
                { icon: Zap, label: 'Electricity', color: 'from-amber-500 to-orange-600', count: (bills || []).filter(b => b?.billType === 'electricity').length },
                { icon: Droplets, label: 'Water', color: 'from-accent-400 to-accent-600', count: (bills || []).filter(b => b?.billType === 'water').length },
                { icon: Home, label: 'Property', color: 'from-primary-500 to-primary-700', count: (bills || []).filter(b => b?.billType === 'property').length },
              ].map(({ icon: Icon, label, color, count }) => (
                <div key={label} className="glass-panel-light p-5 text-center">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="text-xl font-bold text-white">{count}</div>
                  <div className="text-xs text-gray-500 font-semibold">{label} Bills</div>
                </div>
              ))}
            </motion.div>

            {/* Pending Bills Section */}
            <motion.div variants={itemVariants} initial="hidden" animate="show" transition={{delay: 0.2}} className="glass-panel overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-amber-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Calculator size={20} className="text-amber-400" /> Pending Payments
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Settle your outstanding government dues</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">
                    {(bills || []).filter(b => b?.status === 'pending').length} Action Required
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      [...Array(2)].map((_, i) => (
                        <tr key={i}><td colSpan="5" className="p-4"><div className="skeleton h-12 w-full" /></td></tr>
                      ))
                    ) : (bills || []).filter(b => b?.status === 'pending').length === 0 ? (
                      <tr><td colSpan="5" className="p-12 text-center text-gray-500">
                        <CheckCircle size={40} className="mx-auto mb-3 text-green-500/50" />
                        <p className="font-bold text-gray-400">All caught up!</p>
                        <p className="text-xs mt-1">No pending bills at the moment.</p>
                      </td></tr>
                    ) : (
                      (bills || []).filter(b => b?.status === 'pending').map((bill) => (
                        <tr key={bill._id} className="hover:bg-surface-700/30 transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap w-32">
                            <div className="text-sm font-medium text-gray-300">{new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                            <div className="text-xs text-gray-600">{new Date(bill.createdAt).getFullYear()}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-semibold text-white capitalize">{bill.billType} Bill</div>
                            <div className="text-xs text-gray-500 font-mono">#{bill._id.substring(bill._id.length - 8).toUpperCase()}</div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded uppercase tracking-wider border border-amber-400/20">
                              Pending
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="text-base font-bold text-white">
                              ₹{bill.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button 
                              onClick={() => handlePay(bill._id, bill)}
                              disabled={payingBillId === bill._id}
                              className="btn-primary text-xs py-2 px-6 rounded-lg font-black uppercase tracking-wider"
                            >
                              {payingBillId === bill._id ? 'Establishing...' : 'Pay Dues'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Transaction History Section */}
            <motion.div variants={itemVariants} initial="hidden" animate="show" transition={{delay: 0.3}} className="glass-panel overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-surface-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <History size={20} className="text-primary-400" /> Payment History
                  </h2>
                  <button className="text-xs font-bold text-primary-400 hover:text-white transition-colors">View All Transactions</button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Transaction Date</th>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Service Details</th>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Amount</th>
                      <th className="px-6 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      [...Array(2)].map((_, i) => (
                        <tr key={i}><td colSpan="5" className="p-4"><div className="skeleton h-12 w-full" /></td></tr>
                      ))
                    ) : (bills || []).filter(b => b?.status === 'paid').length === 0 ? (
                      <tr><td colSpan="5" className="p-10 text-center text-gray-600">
                        <History size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No previous transactions found.</p>
                      </td></tr>
                    ) : (
                      (bills || []).filter(b => b?.status === 'paid').map((bill) => (
                        <tr key={bill._id} className="hover:bg-surface-700/20 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-400">{new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-white capitalize">{bill.billType} Payment</div>
                            <div className="text-[10px] text-gray-600 font-mono">TXN-{bill._id.substring(bill._id.length - 8).toUpperCase()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-0.5 rounded uppercase tracking-wider border border-green-400/20">
                              Completed
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-sm font-bold text-gray-300">
                              ₹{bill.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => window.open(`/payment-success?txn_id=${bill._id}&print=true`, '_blank')}
                              className="w-10 h-10 rounded-lg bg-surface-600 flex items-center justify-center text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all group-hover:scale-110"
                              title="Download Receipt"
                            >
                              <Download size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div variants={itemVariants} initial="hidden" animate="show" transition={{delay: 0.4}} className="glass-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">Need Help?</h2>
                  <p className="text-xs text-gray-500 font-medium">Commonly asked questions</p>
                </div>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className={`rounded-2xl border transition-all duration-300 ${activeFaq === index ? 'bg-surface-800 border-primary-500/30' : 'bg-surface-800/40 border-white/5 hover:border-white/10'}`}>
                    <button 
                      onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left"
                    >
                      <span className={`text-sm font-bold transition-colors ${activeFaq === index ? 'text-white' : 'text-gray-400'}`}>{faq.q}</span>
                      <ChevronDown size={18} className={`text-gray-500 transition-transform duration-300 ${activeFaq === index ? 'rotate-180 text-primary-400' : ''}`} />
                    </button>
                    {activeFaq === index && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        className="px-5 pb-5 overflow-hidden"
                      >
                        <p className="text-sm text-gray-400 leading-relaxed font-medium">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-primary-500/5 to-accent-400/5 border border-white/5 text-center">
                <p className="text-xs text-gray-500 italic mb-2">Still have questions?</p>
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="text-xs font-bold text-primary-400 hover:text-white transition-colors uppercase tracking-widest cursor-pointer"
                >
                  Contact Support 24/7
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
