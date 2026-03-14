import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-surface-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-400">SmartGov Bills Platform</span>
          </div>
          <p className="text-sm text-gray-600 text-center">
            © {new Date().getFullYear()} SmartGov Digital Services. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <span className="hover:text-primary-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-primary-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-primary-400 cursor-pointer transition-colors">Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
