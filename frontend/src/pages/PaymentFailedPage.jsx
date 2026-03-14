import { Link } from 'react-router-dom';
import { XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentFailedPage = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-surface-900 grid-pattern -z-10" />
      <motion.div 
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[120px] -z-10" 
      />

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-12 text-center max-w-md w-full">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mx-auto mb-8 shadow-2xl"
          style={{ boxShadow: '0 0 40px rgba(248, 113, 113, 0.3)' }}
        >
          <XCircle size={48} className="text-white" />
        </motion.div>

        <h1 className="text-3xl font-black text-white mb-3">Payment Failed</h1>
        <p className="text-gray-400 mb-8">Something went wrong with your payment. No charges have been made to your account.</p>

        <div className="flex flex-col gap-3">
          <Link to="/dashboard" className="btn-primary w-full flex justify-center items-center gap-2 text-sm">
            <RefreshCw size={18} /> Try Again
          </Link>
          <Link to="/dashboard" className="btn-secondary w-full flex justify-center items-center gap-2 text-sm">
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailedPage;
