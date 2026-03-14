import { Link } from 'react-router-dom';
import { Zap, Droplets, Home, ShieldCheck, ArrowRight, Activity, MessageSquare, CreditCard, Users, TrendingUp, Lock } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description, gradient, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay }}
    className="glass-panel p-8 relative overflow-hidden card-hover group"
  >
    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity duration-500`} />
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${gradient} shadow-lg`}>
      <Icon size={26} className="text-white" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-white tracking-tight">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
  </motion.div>
);

const StatCard = ({ value, label, icon: Icon }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="glass-panel-light p-6 text-center"
  >
    <Icon size={24} className="text-primary-400 mx-auto mb-3" />
    <div className="text-2xl font-black text-white mb-1">{value}</div>
    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</div>
  </motion.div>
);

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-surface-900 grid-pattern -z-10" />
        
        {/* Neon Gradient Blobs */}
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, 60, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] right-[5%] w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] -z-10" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] left-[0%] w-[400px] h-[400px] bg-accent-400/15 rounded-full blur-[100px] -z-10" 
        />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-primary-600/10 to-accent-400/10 rounded-full blur-[150px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary-500/30 bg-primary-600/10 text-primary-300 font-bold text-xs uppercase tracking-widest mb-8"
          >
            <ShieldCheck size={16} /> Digital Government Services
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-8 leading-[1.05]"
          >
            Intelligent Civic<br />
            <span className="gradient-text">
              Payment Hub.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-6 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Your centralized portal for Property Tax, Electricity, and Water bill payments. 
            AI-powered calculations and 24/7 digital assistance.
          </motion.p>

          {/* Floating feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {['Smart Calculations', 'Secure Payments', 'AI Assistant', 'Digital Receipts'].map((item, i) => (
              <span key={i} className="text-xs font-semibold text-gray-500 border border-white/10 px-4 py-2 rounded-full">
                {item}
              </span>
            ))}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/signup" className="btn-primary inline-flex items-center justify-center gap-3 text-sm uppercase tracking-wider group">
              Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn-secondary inline-flex items-center justify-center text-sm uppercase tracking-wider">
              Citizen Login
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-surface-800/50 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="text-xs font-bold text-primary-400 uppercase tracking-widest border border-primary-500/30 px-4 py-2 rounded-full">Features</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-6 mb-4">Powerful Features Built<br/>For Smarter Civic Payments</h2>
            <p className="text-lg text-gray-500 max-w-2xl font-medium">Auto-calculating ledgers connected directly to state municipalities.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Home} 
              title="Property Tax" 
              description="Instantly calculated using your assessed valuation and urban/rural zoning codes. Digital receipts valid for proof of residence."
              gradient="from-primary-500 to-primary-700"
              delay={0.1}
            />
            <FeatureCard 
              icon={Zap} 
              title="Electricity Board" 
              description="State-tiered slab calculations handle base usage and excess consumption multipliers automatically."
              gradient="from-amber-500 to-orange-600"
              delay={0.2}
            />
            <FeatureCard 
              icon={Droplets} 
              title="Water & Sewage" 
              description="Pay your monthly local municipal water supply bills with flat-rate logic and excess volumetric charges."
              gradient="from-accent-400 to-accent-600"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-surface-900 grid-pattern -z-10" />
        <motion.div 
          style={{ y: yBg }}
          className="absolute -top-[20%] -right-[10%] w-[70%] h-[120%] bg-gradient-to-bl from-primary-600/15 via-transparent to-transparent -z-10 rounded-full blur-3xl"
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-8 shadow-2xl neon-glow-purple">
                <MessageSquare size={32} className="text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-[1.1] text-white">
                Your 24/7<br/>
                <span className="gradient-text">Civic AI</span> Agent.
              </h2>
              <p className="text-lg text-gray-400 mb-10 leading-relaxed font-medium">
                Lost in tax slabs? The SmartGov AI chatbot is trained exclusively on local utility regulations and stands ready to assist you.
              </p>
              <ul className="space-y-5">
                {[
                  'Real-time slab calculations',
                  'Step-by-step payment guidance',
                  'Senior citizen exemption rules',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-gray-300 font-semibold">
                    <Activity className="text-primary-400 p-1.5 bg-primary-500/15 rounded-lg flex-shrink-0" size={28}/>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-accent-400 rounded-[2rem] blur-3xl opacity-15 animate-pulse-glow" />
              <div className="glass-panel p-7 relative">
                <div className="flex gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 neon-glow-purple">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                  <div className="bg-surface-600 border border-white/5 p-4 rounded-2xl rounded-tl-none text-gray-300 text-sm font-medium leading-relaxed">
                    Hello! I'm the SmartGov AI. Do you need assistance resolving your pending property tax draft?
                  </div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-3 mb-6 flex-row-reverse"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-400 flex-shrink-0 border border-white/10" />
                  <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 rounded-2xl rounded-tr-none text-white text-sm font-medium shadow-xl">
                    How is the new urban property rate calculated?
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.4 }}
                  className="flex gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 neon-glow-purple">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                  <div className="bg-surface-600 border border-white/5 p-4 rounded-2xl rounded-tl-none text-gray-300 text-sm font-medium leading-relaxed">
                    For urban zoning, the state charges a 5% baseline rate against your total assessed property valuation. Shall I open the calculator?
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-surface-800/50 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            >
              <h2 className="text-4xl font-black text-white mb-6">Trusted by Over 1 Million Citizens.</h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                SmartGov Bills is the official initiative to digitize municipal payments. We've processed over ₹500 Crores in civic dues securely.
              </p>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard value="99.9%" label="Uptime" icon={TrendingUp} />
              <StatCard value="24/7" label="AI Support" icon={MessageSquare} />
              <StatCard value="-10%" label="Senior Discount" icon={Users} />
              <StatCard value="256-bit" label="Encryption" icon={Lock} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-surface-900 grid-pattern -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-gray-500 font-medium">Everything you need to know about SmartGov.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "Is this platform officially recognized by the government?", a: "Yes, SmartGov Bills is the official centralized portal integrated directly with municipal ledgers across the state." },
              { q: "How does the senior citizen discount work?", a: "Citizens above 60 who verify their status during registration receive a flat 10% reduction on the base tariff of all utility bills." },
              { q: "Are digital receipts valid for address proof?", a: "Absolutely. Receipts downloaded from your dashboard contain official transaction IDs and are legally valid documents." },
              { q: "What if my payment fails but money is deducted?", a: "Our system auto-reconciles pending transactions. The amount will be refunded to your source account within 3-5 business days." },
            ].map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-panel-light p-6 card-hover"
              >
                <h3 className="text-base font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/50 to-accent-700/30 -z-10" />
        <div className="absolute inset-0 grid-pattern -z-10 opacity-50" />
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight"
          >
            Ready to Go Digital?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            Join millions of citizens who've switched to smart, transparent, and instant civic payments.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            <Link to="/signup" className="btn-primary inline-flex items-center gap-2 text-sm uppercase tracking-wider group">
              Create Citizen ID <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
