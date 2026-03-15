import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, Shield, LogOut, LayoutDashboard, Calculator, UserCog, User, Mail, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Close profile modal on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5" style={{ background: 'rgba(3, 4, 28, 0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center shadow-lg neon-glow-purple">
              <Shield size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Smart<span className="gradient-text">Gov</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/', label: 'Home' },
              ...(user ? [
                { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { to: '/calculator', label: 'Calculator', icon: Calculator },
              ] : []),
              ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: UserCog }] : []),
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  isActive(to) 
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2.5 px-6">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-sm py-2.5 px-6">
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4 relative" ref={profileRef}>
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-full hover:bg-white/5 transition-all text-right group cursor-pointer"
                >
                  <div className="hidden lg:block">
                    <div className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">{user.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role === 'admin' ? 'Administrator' : 'Citizen'}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center text-white font-bold text-sm border-2 border-primary-400/30 group-hover:scale-105 transition-transform">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {/* Profile Modal */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-16 right-0 w-72 glass-panel p-6 shadow-2xl z-50 overflow-hidden"
                      style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(113, 56, 218, 0.2)' }}
                    >
                      {/* Decorative Background */}
                      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl p-4" />
                      
                      <div className="relative">
                        <div className="flex flex-col items-center text-center mb-6">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center text-white font-black text-2xl border-4 border-surface-700 shadow-xl mb-3">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <h3 className="text-lg font-bold text-white leading-tight">{user.name}</h3>
                          <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-md border border-primary-500/20 mt-1">
                            {user.role === 'admin' ? 'Administrator' : 'Verified Citizen'}
                          </span>
                        </div>

                        <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg bg-surface-600 flex items-center justify-center text-gray-400 group-hover:text-primary-400 transition-colors">
                              <Mail size={16} />
                            </div>
                            <div className="text-left">
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email Address</p>
                              <p className="text-sm text-gray-300 font-medium truncate w-44">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg bg-surface-600 flex items-center justify-center text-gray-400 group-hover:text-primary-400 transition-colors">
                              <ShieldCheck size={16} />
                            </div>
                            <div className="text-left">
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">System Access</p>
                              <p className="text-sm text-gray-300 font-medium">Full citizen privileges</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={logout}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl border border-red-500/20 transition-all group"
                        >
                          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                          Logout Account
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-surface-800"
          >
            <div className="px-4 py-4 space-y-2">
              {[
                { to: '/', label: 'Home' },
                ...(user ? [
                  { to: '/dashboard', label: 'Dashboard' },
                  { to: '/calculator', label: 'Calculator' },
                ] : []),
                ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                    isActive(to) ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {!user ? (
                <div className="flex gap-3 pt-3">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm py-2.5 px-6 flex-1 text-center">Login</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary text-sm py-2.5 px-6 flex-1 text-center">Sign Up</Link>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <div className="p-4 rounded-2xl bg-surface-700/50 border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-500/10 transition-all">
                    <LogOut size={18} /> Logout Account
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
