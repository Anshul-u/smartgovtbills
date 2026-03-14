import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CreditCard, TrendingUp, FileText, Zap, Droplets, Home, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/admin/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const billTypeIcons = { electricity: Zap, water: Droplets, property: Home };
  const billTypeColors = { electricity: 'from-amber-500 to-orange-600', water: 'from-accent-400 to-accent-600', property: 'from-primary-500 to-primary-700' };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-surface-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-3xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Platform analytics and management</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { icon: Users, label: 'Total Citizens', value: stats?.totalUsers || 0, gradient: 'from-primary-500 to-primary-700' },
            { icon: IndianRupee, label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, gradient: 'from-green-400 to-green-600' },
            { icon: CreditCard, label: 'Transactions', value: stats?.totalPayments || 0, gradient: 'from-accent-400 to-accent-600' },
            { icon: FileText, label: 'Total Bills', value: stats?.totalBills || 0, gradient: 'from-amber-400 to-orange-500' },
          ].map(({ icon: Icon, label, value, gradient }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-panel p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                <Icon size={22} className="text-white" />
              </div>
              <div className="text-2xl font-black text-white mb-1">{value}</div>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bill Type Distribution */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6">
            <h2 className="text-lg font-bold text-white mb-6">Bill Type Distribution</h2>
            <div className="space-y-4">
              {(stats?.billTypeStats || []).map((bt) => {
                const Icon = billTypeIcons[bt._id] || FileText;
                const gradient = billTypeColors[bt._id] || 'from-gray-400 to-gray-600';
                const maxCount = Math.max(...(stats?.billTypeStats || []).map(s => s.count), 1);
                return (
                  <div key={bt._id} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-white capitalize">{bt._id}</span>
                        <span className="text-xs text-gray-500">{bt.count} bills</span>
                      </div>
                      <div className="w-full h-2 bg-surface-600 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${(bt.count / maxCount) * 100}%` }} transition={{ duration: 1, delay: 0.6 }}
                          className={`h-full rounded-full bg-gradient-to-r ${gradient}`} 
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-400 w-24 text-right">₹{bt.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
              {(!stats?.billTypeStats || stats.billTypeStats.length === 0) && (
                <p className="text-center text-gray-500 py-8">No bill data available yet</p>
              )}
            </div>
          </motion.div>

          {/* Recent Payments */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-6">
            <h2 className="text-lg font-bold text-white mb-6">Recent Payments</h2>
            <div className="space-y-3">
              {(stats?.recentPayments || []).slice(0, 6).map((payment) => (
                <div key={payment._id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-600/30 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{payment.user?.name || 'Citizen'}</div>
                    <div className="text-xs text-gray-500 capitalize">{payment.bill?.billType || 'Bill'} Payment</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-400">₹{payment.amount.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-gray-600">{new Date(payment.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              ))}
              {(!stats?.recentPayments || stats.recentPayments.length === 0) && (
                <p className="text-center text-gray-500 py-8">No payments recorded yet</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Paid / Pending Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="grid grid-cols-2 gap-6 mt-6">
          <div className="glass-panel-light p-6 text-center">
            <div className="text-3xl font-black text-green-400">{stats?.totalPaidBills || 0}</div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Bills Paid</div>
          </div>
          <div className="glass-panel-light p-6 text-center">
            <div className="text-3xl font-black text-amber-400">{stats?.totalPendingBills || 0}</div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Bills Pending</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;
