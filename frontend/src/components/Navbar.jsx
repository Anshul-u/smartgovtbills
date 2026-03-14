import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, Shield, LogOut, LayoutDashboard, Calculator, UserCog } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

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
              <div className="flex items-center gap-4">
                <div className="text-right hidden lg:block">
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role === 'admin' ? 'Administrator' : 'Citizen'}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center text-white font-bold text-sm border-2 border-primary-400/30">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
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
                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-400/10">
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
