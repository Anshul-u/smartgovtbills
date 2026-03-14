import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transactionId') || searchParams.get('txn');
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [error, setError] = useState('');

  const checkStatus = async () => {
    if (!transactionId) {
      setStatus('failed');
      setError('No transaction ID found');
      return;
    }

    try {
      const { data } = await axios.get(`/payments/status/${transactionId}`);
      if (data.status === 'success') {
        setStatus('success');
      } else {
        setStatus('failed');
        setError(data.message || 'Payment was not successful');
      }
    } catch (err) {
      console.error('Status check error:', err);
      // If it fails, we wait and retry once or show error
      setError('Unable to verify payment status automatically.');
      setStatus('failed');
    }
  };

  useEffect(() => {
    checkStatus();
  }, [transactionId]);

  if (status === 'verifying') {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-surface-900">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Verifying Payment...</h2>
        <p className="text-gray-500 text-sm mt-2">Connecting with the bank servers</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-surface-900 grid-pattern -z-10" />
      
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-12 text-center max-w-md w-full">
        {status === 'success' ? (
          <>
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-8 shadow-2xl"
              style={{ boxShadow: '0 0 40px rgba(74, 222, 128, 0.3)' }}
            >
              <CheckCircle size={48} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-3">Payment Successful!</h1>
            <p className="text-gray-400 mb-8">Your bill has been paid and the receipt has been sent to your email.</p>
          </>
        ) : (
          <>
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mx-auto mb-8 shadow-2xl"
              style={{ boxShadow: '0 0 40px rgba(248, 113, 113, 0.3)' }}
            >
              <XCircle size={48} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-3">Payment Unsuccessful</h1>
            <p className="text-gray-400 mb-8">{error || 'Something went wrong while processing your payment.'}</p>
          </>
        )}

        {transactionId && (
          <div className="bg-surface-600/50 rounded-xl p-4 border border-white/5 mb-8 text-center">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Transaction ID</div>
            <div className="text-sm font-mono text-primary-400">{transactionId}</div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {status === 'failed' && (
            <button onClick={checkStatus} className="btn-secondary w-full flex justify-center items-center gap-2 text-sm mb-2">
              <RefreshCw size={18} /> Retry Verification
            </button>
          )}
          <Link to="/dashboard" className="btn-primary w-full flex justify-center items-center gap-2 text-sm">
            Go to Dashboard <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;
