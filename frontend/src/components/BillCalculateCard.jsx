import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BillCalculateCard = ({ onBillCreated }) => {
  const { user } = useContext(AuthContext);
  const [billType, setBillType] = useState('electricity');
  const [consumerNumber, setConsumerNumber] = useState('');
  const [units, setUnits] = useState('');
  const [liters, setLiters] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [stateCode, setStateCode] = useState('URBAN');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        billType,
        consumerNumber,
        month,
        year,
      };

      if (billType === 'electricity') payload.units = units;
      else if (billType === 'water') payload.liters = liters;
      else if (billType === 'property') {
        payload.propertyValue = propertyValue;
        payload.stateCode = stateCode;
      }

      await axios.post('/bills/calculate', payload);
      setSuccess('Statement calculated successfully.');
      if (onBillCreated) onBillCreated();

      setTimeout(() => setSuccess(''), 5000);
      setConsumerNumber('');
      setUnits('');
      setLiters('');
      setPropertyValue('');

    } catch (err) {
      setError(err.response?.data?.message || 'Error calculating bill');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel overflow-hidden relative"
    >
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary-400 via-accent-500 to-primary-600"></div>
      
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl text-primary-600 shadow-inner border border-white">
            <Calculator size={24} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">New Assessment</h3>
            <p className="text-sm text-gray-500 font-medium tracking-wide">Generate an instant bill statement</p>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="mb-4">
              <div className="flex items-start gap-2 text-red-700 text-sm bg-red-50 p-3 rounded-xl border border-red-100 shadow-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="mb-4">
              <div className="flex items-start gap-2 text-primary-800 text-sm bg-primary-50 p-3 rounded-xl border border-primary-200 shadow-sm">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <span className="font-semibold">{success}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {user?.isSeniorCitizen && (
          <div className="mb-5 text-xs font-semibold text-amber-800 bg-gradient-to-r from-amber-50 to-amber-100/50 p-3 rounded-xl border border-amber-200/60 shadow-inner flex gap-2 items-center">
            <span className="text-xl">🌟</span>
            <span>Senior Citizen Status Active: 10% discount applies automatically to your base tariff!</span>
          </div>
        )}

        <form onSubmit={handleCalculate} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">Service Type</label>
            <div className="relative">
              <select 
                value={billType} 
                onChange={(e) => setBillType(e.target.value)}
                className="w-full appearance-none bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all shadow-sm cursor-pointer"
              >
                <option value="electricity">⚡ Electricity Base</option>
                <option value="water">💧 Water & Sewage</option>
                <option value="property">🏘️ Property Tax</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">Consumer Account</label>
            <input 
              type="text" 
              required 
              value={consumerNumber} 
              onChange={(e) => setConsumerNumber(e.target.value)} 
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all shadow-sm" 
              placeholder="e.g. 1029384756"
            />
          </div>

          <AnimatePresence mode="popLayout">
            {billType === 'electricity' && (
              <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Meter Reading (Units)</label>
                <input type="number" required min="0" value={units} onChange={(e) => setUnits(e.target.value)} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm" placeholder="0" />
              </motion.div>
            )}

            {billType === 'water' && (
              <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Volume (Liters)</label>
                <input type="number" required min="0" value={liters} onChange={(e) => setLiters(e.target.value)} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm" placeholder="0" />
              </motion.div>
            )}

            {billType === 'property' && (
              <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Assessed Valuation (₹)</label>
                  <input type="number" required min="0" value={propertyValue} onChange={(e) => setPropertyValue(e.target.value)} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm" placeholder="5000000" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Zoning Designation</label>
                  <div className="relative">
                    <select value={stateCode} onChange={(e) => setStateCode(e.target.value)} className="w-full appearance-none bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm cursor-pointer">
                      <option value="URBAN">🏢 Urban Sector</option>
                      <option value="RURAL">🌾 Rural Sector</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Month</label>
              <input type="number" required min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Year</label>
              <input type="number" required min="2000" value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm" />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={loading} 
            className="w-full mt-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-black hover:to-gray-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Generate Official Statement'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default BillCalculateCard;
