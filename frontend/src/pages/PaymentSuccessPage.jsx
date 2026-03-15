import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Loader2, 
  RefreshCw, 
  Download, 
  MapPin, 
  Calendar, 
  Tag, 
  CreditCard,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [error, setError] = useState('');
  const [receiptData, setReceiptData] = useState(null);

  const checkStatus = async () => {
    const txnId = searchParams.get('txn');
    
    if (!txnId) {
      setStatus('failed');
      setError('No payment reference found after redirect');
      return;
    }

    try {
      console.log('[Status] Verifying Transaction:', txnId);
      // We check history or a specific status endpoint for this transactionId
      const { data } = await axios.get(`/payments/history`);
      const transaction = data.find(t => t._id === txnId);

      if (transaction && transaction.paymentStatus === 'success') {
        setStatus('success');
      } else {
        // Retry once after a delay if it's not immediately success
        setTimeout(async () => {
          const retryRes = await axios.get(`/payments/history`);
          const retryTxn = retryRes.data.find(t => t._id === txnId);
          if (retryTxn && retryTxn.paymentStatus === 'success') {
            setStatus('success');
          } else {
            setStatus('failed');
            setError('Payment verification pending. Please check your history in a few minutes.');
          }
        }, 3000);
      }
    } catch (err) {
      console.error('Status check error:', err);
      setError('Connection timeout. Please check your billing dashboard in a few moments.');
      setStatus('failed');
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-900 overflow-hidden relative">
        <div className="absolute inset-0 bg-surface-900 grid-pattern -z-10" />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-full border-4 border-primary-500/20 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-t-accent-500 animate-[spin_3s_linear_infinite]" />
        </motion.div>
        <h2 className="text-2xl font-black text-white mt-8 tracking-tight">Verifying Transaction</h2>
        <p className="text-gray-500 text-sm mt-3 animate-pulse">Establishing secure connection with gateway...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden bg-surface-900">
      <div className="absolute inset-0 bg-surface-900 grid-pattern -z-10" />
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-600/10 rounded-full blur-[120px] -z-10 animate-float" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent-500/10 rounded-full blur-[120px] -z-10 animate-float" style={{ animationDelay: '2s' }} />

      <AnimatePresence>
        {status === 'success' ? (
          <motion.div 
            key="success"
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
            className="w-full max-w-lg z-10"
          >
            {/* Header Section */}
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(34,197,94,0.4)] success-glow"
              >
                <CheckCircle size={48} className="text-white" />
              </motion.div>
              <motion.h1 variants={itemVariants} className="text-4xl font-black text-white mb-2 tracking-tight">
                Payment Success!
              </motion.h1>
              <motion.p variants={itemVariants} className="text-gray-400 font-medium">
                Your payment has been processed successfully.
              </motion.p>
            </div>

            {/* Receipt Summary Card */}
            <motion.div variants={itemVariants} className="glass-panel overflow-hidden border-white/5 shadow-2xl">
              <div className="p-1 bg-gradient-to-r from-green-500/50 to-emerald-500/50" />
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Amount Paid</span>
                      <h2 className="text-3xl font-black text-white mt-1">₹ {searchParams.get('amount') || '500.00'}<span className="text-sm font-medium text-gray-500 ml-1">INR</span></h2>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date</span>
                      <p className="text-sm font-bold text-white mt-1">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-600 flex items-center justify-center">
                        <Tag size={18} className="text-primary-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Service</p>
                        <p className="text-xs font-bold text-white">Electricity Bill</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-600 flex items-center justify-center">
                        <CreditCard size={18} className="text-accent-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Method</p>
                        <p className="text-xs font-bold text-white">Razorpay</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Transaction ID</span>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-900 border border-white/5">
                      <code className="text-xs font-mono text-primary-400 truncate mr-4">
                        {searchParams.get('payment_id') || 'MOJO_TXN_X82J91'}
                      </code>
                      <button className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-tighter">Copy</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bottom Actions */}
            <motion.div variants={itemVariants} className="mt-8 flex flex-col gap-4">
              <Link to="/dashboard" className="btn-primary w-full flex items-center justify-center gap-2 group">
                Back to Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn-secondary w-full flex items-center justify-center gap-2">
                <Download size={18} /> Download Receipt
              </button>
            </motion.div>

            <motion.p variants={itemVariants} className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-8">
              Secured by SmartGov Global Payments
            </motion.p>
          </motion.div>
        ) : (
          <motion.div 
            key="failed"
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full max-w-md text-center"
          >
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-8 shadow-2xl"
            >
              <XCircle size={48} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Transaction Failed</h1>
            <p className="text-gray-400 mb-8 max-w-xs mx-auto">{error || 'Something went wrong while processing your payment.'}</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={checkStatus} 
                className="btn-primary w-full flex justify-center items-center gap-2"
              >
                <RefreshCw size={18} /> Retry Verification
              </button>
              <Link to="/dashboard" className="btn-secondary w-full flex justify-center items-center gap-2">
                Go back & try again <History size={18} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentSuccessPage;
