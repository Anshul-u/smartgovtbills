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
  const [showConfetti, setShowConfetti] = useState(false);

  const checkStatus = async () => {
    const txnId = searchParams.get('txn_id') || searchParams.get('txn');
    
    if (!txnId) {
      console.warn('[Status] No txn_id found in URL');
      setStatus('failed');
      setError('No payment reference found after redirect');
      return;
    }

    try {
      console.log('[Status] Verifying Transaction:', txnId);
      // Fetch specific receipt data
      const { data } = await axios.get(`/payments/receipt/${txnId}`);
      
      if (data && data.status === 'success') {
        setReceiptData(data);
        setStatus('success');
        setShowConfetti(true);
        
        // Auto-print if requested
        if (searchParams.get('print') === 'true') {
          setTimeout(() => handlePrint(), 1500);
        }
      } else {
        setStatus('failed');
        setError('Payment verification pending. Please check your history in a few minutes.');
      }
    } catch (err) {
      console.error('Status check error:', err);
      setError('Connection timeout. Your payment is being processed. Please check your billing dashboard in a few moments.');
      setStatus('failed');
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
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
          animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative"
        >
          <div className="w-40 h-40 rounded-full border-8 border-primary-500/10 flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full border-8 border-t-accent-500 animate-[spin_3s_linear_infinite]" />
        </motion.div>
        <h2 className="text-3xl font-black text-white mt-10 tracking-tight">Securing Transaction</h2>
        <p className="text-gray-500 text-sm mt-4 font-mono uppercase tracking-[0.3em] animate-pulse">Establishing Gateway Handshake...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden bg-surface-900">
      <div className="absolute inset-0 bg-surface-900 grid-pattern -z-10" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary-600/20 blur-[150px] -z-10 rounded-full" />
      
      <AnimatePresence>
        {status === 'success' ? (
          <motion.div 
            key="success"
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
            className="w-full max-w-2xl z-10 print:m-0 print:p-0"
          >
            {/* Success Animation Header */}
            <div className="text-center mb-10 print:hidden">
              <motion.div 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.6, duration: 1 }}
                className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(16,185,129,0.4)]"
              >
                <CheckCircle size={56} className="text-white" />
              </motion.div>
              <motion.div variants={itemVariants}>
                <h1 className="text-5xl font-black text-white mb-3 tracking-tighter leading-none">
                  Payment Confirmed!
                </h1>
                <p className="text-gray-400 text-lg font-medium">
                  Your government dues have been settled successfully.
                </p>
              </motion.div>
            </div>

            {/* Receipt Component */}
            <motion.div 
              variants={itemVariants} 
              className="bg-white text-gray-900 rounded-3xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none"
            >
              <div className="bg-surface-800 p-8 flex justify-between items-center border-b border-black/10 print:bg-white print:border-b-2">
                <div>
                  <h3 className="text-2xl font-black text-white print:text-gray-900">SmartGov Bills</h3>
                  <p className="text-xs text-gray-400 font-mono tracking-widest print:text-gray-500 uppercase">E-Government Services</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-primary-400 bg-primary-500/10 px-2 py-1 rounded print:hidden uppercase">Receipt Copy</span>
                  <p className="text-lg font-bold text-white mt-1 print:text-gray-900">{receiptData?.receiptNo || 'RCP-772918'}</p>
                </div>
              </div>

              <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Billed To</span>
                    <p className="text-sm font-bold">{receiptData?.payerName || 'Citizen User'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{receiptData?.payerEmail || ''}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Payment Date</span>
                    <p className="text-sm font-bold">{new Date(receiptData?.date).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                        <Tag size={16} className="text-primary-600" />
                      </div>
                      <span className="text-sm font-bold capitalize">{receiptData?.billType || 'Service'} Bill Settlement</span>
                    </div>
                    <span className="text-sm font-black">₹{receiptData?.amount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-lg font-black text-gray-900">Total Amount</span>
                    <span className="text-2xl font-black text-primary-600">₹{receiptData?.amount?.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>Transaction Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                      <p className="text-[9px] text-gray-400 mb-1">Gateway ID</p>
                      <p className="text-xs font-mono font-bold truncate">{receiptData?.paymentId || 'PAY-N/A'}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                      <p className="text-[9px] text-gray-400 mb-1">Method</p>
                      <p className="text-xs font-bold font-mono">RAZORPAY_SECURE</p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-6 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium">This is a system-generated document and does not require a signature.</p>
                  <p className="text-[10px] text-primary-500 font-black mt-1 uppercase tracking-tighter">Support: digital-help@smartgov.gov.in</p>
                </div>
              </div>
            </motion.div>

            {/* Bottom Actions */}
            <motion.div variants={itemVariants} className="mt-8 flex gap-4 print:hidden">
              <Link to="/dashboard" className="btn-primary flex-1 flex items-center justify-center gap-2 group py-4">
                <History size={18} /> Dashboard
              </Link>
              <button 
                onClick={handlePrint}
                className="bg-white text-gray-900 hover:bg-gray-100 font-black text-sm px-8 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl"
              >
                <Download size={18} /> Print 
              </button>
            </motion.div>
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
              className="w-28 h-28 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(225,29,72,0.3)]"
            >
              <XCircle size={56} className="text-white" />
            </motion.div>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tighter leading-none">Transaction Alert</h1>
            <p className="text-gray-400 mb-10 text-lg leading-relaxed">{error || 'Handshake with payment gateway failed. Please verify your transaction status in dashboard.'}</p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={checkStatus} 
                className="btn-primary w-full py-4 flex justify-center items-center gap-2"
              >
                <RefreshCw size={20} /> Force Re-verify
              </button>
              <Link to="/dashboard" className="text-gray-500 hover:text-white font-bold text-sm underline underline-offset-8 decoration-primary-500/30">
                Cancel & Return to Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentSuccessPage;
