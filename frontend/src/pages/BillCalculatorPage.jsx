import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Zap, Droplets, Home, Calculator, ArrowRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const tabs = [
  { id: 'electricity', label: 'Electricity', icon: Zap, gradient: 'from-amber-500 to-orange-600' },
  { id: 'water', label: 'Water', icon: Droplets, gradient: 'from-accent-400 to-accent-600' },
  { id: 'property', label: 'Property Tax', icon: Home, gradient: 'from-primary-500 to-primary-700' },
];

const BillCalculatorPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('electricity');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Form fields
  const [units, setUnits] = useState('');
  const [liters, setLiters] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [stateCode, setStateCode] = useState('URBAN');
  const [consumerNumber, setConsumerNumber] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setResult(null);

    try {
      const payload = {
        billType: activeTab,
        consumerNumber: consumerNumber || `CN-${Date.now()}`,
        month,
        year,
        ...(activeTab === 'electricity' && { units }),
        ...(activeTab === 'water' && { liters }),
        ...(activeTab === 'property' && { propertyValue, stateCode }),
      };

      const { data } = await axios.post('/bills/calculate', payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Calculation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const activeConfig = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">Bill Calculator</h1>
          <p className="text-gray-500 font-medium">Calculate your government utility bills instantly</p>
        </motion.div>

        {/* Tab Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-center gap-3 mb-10">
          {tabs.map(({ id, label, icon: Icon, gradient }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setResult(null); setError(''); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                activeTab === id
                  ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                  : 'bg-surface-700 text-gray-400 hover:text-white hover:bg-surface-600 border border-white/5'
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calculator Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Calculator size={22} className="text-primary-400" />
              {activeConfig.label} Calculator
            </h2>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCalculate} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Consumer / Account No.</label>
                <input type="text" value={consumerNumber} onChange={(e) => setConsumerNumber(e.target.value)} className="input-dark" placeholder="e.g. CN-12345678" />
              </div>

              {activeTab === 'electricity' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Units Consumed (kWh)</label>
                  <input type="number" required value={units} onChange={(e) => setUnits(e.target.value)} className="input-dark" placeholder="e.g. 250" min="0" />
                  <p className="text-xs text-gray-600 mt-1">Slabs: 0-100 → ₹3/u | 101-300 → ₹5/u | 301+ → ₹8/u</p>
                </div>
              )}

              {activeTab === 'water' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Water Usage (Liters)</label>
                  <input type="number" required value={liters} onChange={(e) => setLiters(e.target.value)} className="input-dark" placeholder="e.g. 15000" min="0" />
                  <p className="text-xs text-gray-600 mt-1">Base: ₹200/month | Excess above 10,000L → ₹0.05/L</p>
                </div>
              )}

              {activeTab === 'property' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Assessed Property Value (₹)</label>
                    <input type="number" required value={propertyValue} onChange={(e) => setPropertyValue(e.target.value)} className="input-dark" placeholder="e.g. 5000000" min="0" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Zone Type</label>
                    <div className="flex gap-3">
                      {['URBAN', 'RURAL'].map(zone => (
                        <button key={zone} type="button" onClick={() => setStateCode(zone)}
                          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                            stateCode === zone ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' : 'bg-surface-600 text-gray-400 border border-white/5'
                          }`}
                        >
                          {zone} ({zone === 'URBAN' ? '5%' : '2%'})
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Month</label>
                  <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="input-dark">
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i+1} value={i+1}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Year</label>
                  <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-dark">
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
              >
                {isLoading ? 'Calculating...' : 'Calculate Bill'} {!isLoading && <ArrowRight size={18} />}
              </motion.button>
            </form>
          </motion.div>

          {/* Result Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-8 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <FileText size={22} className="text-accent-400" />
              Bill Breakdown
            </h2>

            {!result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeConfig.gradient} flex items-center justify-center mb-4 opacity-30`}>
                  <activeConfig.icon size={28} className="text-white" />
                </div>
                <p className="text-gray-500 text-sm">Enter details and click Calculate to see your bill breakdown</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 flex-1">
                <div className="bg-surface-600/50 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{result.billType} Bill</div>
                  <div className="text-3xl font-black text-white">₹{result.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Base Amount</span>
                    <span className="text-white font-semibold">₹{result.baseAmount.toFixed(2)}</span>
                  </div>
                  {result.discountAmount > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-green-400 text-sm">Senior Citizen Discount (10%)</span>
                      <span className="text-green-400 font-semibold">-₹{result.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Service Tax (5%)</span>
                    <span className="text-white font-semibold">₹{result.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-primary-600/10 rounded-xl px-4">
                    <span className="text-primary-300 font-bold">Total Payable</span>
                    <span className="text-white font-black text-xl">₹{result.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 space-y-1 mt-4">
                  <div>Due Date: {new Date(result.dueDate).toLocaleDateString('en-IN')}</div>
                  <div>Bill ID: {result._id}</div>
                </div>

                <button onClick={() => navigate('/dashboard')} className="btn-primary w-full flex justify-center items-center gap-2 text-sm uppercase tracking-wider mt-4">
                  Go to Dashboard to Pay <ArrowRight size={18} />
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BillCalculatorPage;
