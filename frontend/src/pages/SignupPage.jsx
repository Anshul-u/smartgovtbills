import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, User, Phone, MapPin, ArrowRight, ArrowLeft, Eye, EyeOff, Check, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const SignupPage = () => {
  const [step, setStep] = useState(1); // 1: Details, 2: OTP, 3: Success
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [isSeniorCitizen, setIsSeniorCitizen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setIsLoading(false);
      return;
    }

    const fullPhone = `+91${phone}`;

    try {
      const { data } = await axios.post('/auth/send-otp', { phone: fullPhone, email });
      if (data.otp) setServerOtp(data.otp);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const fullPhone = `+91${phone}`;

    try {
      // In dev mode, auto-verify with the returned OTP
      const otpToVerify = otp || serverOtp;
      
      // Register user
      await register({ name, email, phone: fullPhone, password, address, isSeniorCitizen });
      setStep(3);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-[5%] left-[10%] w-[400px] h-[400px] bg-primary-600/15 rounded-full blur-[120px] -z-10" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[5%] right-[5%] w-[350px] h-[350px] bg-accent-400/10 rounded-full blur-[100px] -z-10" 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full glass-panel p-10"
      >
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s 
                  ? 'bg-gradient-to-br from-primary-500 to-accent-400 text-white shadow-lg' 
                  : 'bg-surface-600 text-gray-500 border border-white/10'
              }`}>
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-surface-500'} transition-colors`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Registration Details */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight mb-2">Create Citizen ID</h2>
                <p className="text-gray-500 text-sm">Establish your digital civic identity</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-semibold text-center">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSendOtp}>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-dark pl-11" placeholder="John Doe" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark pl-11" placeholder="citizen@email.com" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 z-10" />
                    <div className="input-dark pl-11 flex items-center gap-2 group focus-within:border-primary-500">
                      <span className="text-gray-400 font-bold select-none border-r border-white/10 pr-2">+91</span>
                      <input 
                        type="tel" 
                        required 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                        className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600" 
                        placeholder="98765 43210" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="input-dark pl-11 pr-11" placeholder="••••••••" minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Address (Optional)</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-dark pl-11" placeholder="123 Civic Ward St" />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer bg-surface-600/50 hover:bg-surface-600 p-4 rounded-xl border border-white/5 transition-colors">
                  <input type="checkbox" checked={isSeniorCitizen} onChange={(e) => setIsSeniorCitizen(e.target.checked)} className="w-4 h-4 accent-primary-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-300">Senior Citizen</p>
                    <p className="text-xs text-gray-500">Eligible for 10% discount</p>
                  </div>
                </label>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="btn-primary w-full flex justify-center items-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50 mt-2">
                  {isLoading ? 'Sending OTP...' : 'Continue'} {!isLoading && <ArrowRight size={18} />}
                </motion.button>
              </form>

              <div className="text-center pt-6 mt-4 border-t border-white/5">
                <p className="text-sm text-gray-500">
                  Already registered?{' '}
                  <Link to="/login" className="font-bold text-primary-400 hover:text-primary-300">Sign in</Link>
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-400 rounded-2xl flex items-center justify-center mx-auto mb-4 neon-glow-purple">
                  <Mail size={28} className="text-white" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight mb-2">Verify Email</h2>
                <p className="text-gray-500 text-sm">Enter the OTP sent to {email}</p>
                {serverOtp && (
                  <p className="text-primary-400 text-xs mt-2 font-mono bg-primary-500/10 px-3 py-1 rounded-full inline-block">
                    Dev OTP: {serverOtp}
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-semibold text-center">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleVerifyAndRegister}>
                <div className="flex justify-center gap-3">
                  <input
                    type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="input-dark text-center text-2xl tracking-[0.5em] font-mono w-56"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setStep(1); setError(''); }} className="btn-secondary flex-1 flex justify-center items-center gap-2 text-sm">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="btn-primary flex-1 flex justify-center items-center gap-2 text-sm disabled:opacity-50">
                    {isLoading ? 'Verifying...' : 'Verify & Register'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center py-8">
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Check size={40} className="text-white" />
                </motion.div>
                <h2 className="text-2xl font-black text-white mb-2">Welcome to SmartGov!</h2>
                <p className="text-gray-400 text-sm">Your Citizen ID has been created. Redirecting to dashboard...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SignupPage;
