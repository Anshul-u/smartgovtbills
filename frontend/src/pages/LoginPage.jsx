import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Landmark, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-surface-900 grid-pattern -z-10" />
      <motion.div 
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-primary-600/15 rounded-full blur-[120px] -z-10" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] bg-accent-400/10 rounded-full blur-[100px] -z-10" 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full glass-panel p-10"
      >
        <div className="text-center">
          <motion.div 
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-400 text-white rounded-2xl flex items-center justify-center mb-6 neon-glow-purple"
          >
            <Landmark size={32} />
          </motion.div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Citizen Portal</h2>
          <p className="text-gray-500 font-medium text-sm">Securely access your utility ledger</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold text-center">
            {error}
          </motion.div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-dark pl-11"
                placeholder="citizen@smartgov.gov"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-dark pl-11 pr-11"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Authenticating...' : 'Access Dashboard'}
            {!isLoading && <ArrowRight size={18} />}
          </motion.button>
        </form>

        <div className="text-center pt-6 mt-4 border-t border-white/5">
          <p className="text-sm font-medium text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-primary-400 hover:text-primary-300 transition-colors">
              Register now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
