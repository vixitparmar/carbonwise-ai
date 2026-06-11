import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Sparkles, Scan, Award, HelpCircle, ArrowRight, CheckCircle2, Activity } from 'lucide-react';

const heroContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
} as const;

const heroItemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 14
    }
  }
} as const;

const cardContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
} as const;

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
} as const;

export const Landing: React.FC = () => {
  const [calculatorInput, setCalculatorInput] = useState({ miles: 10, kwh: 12 });
  const [estCarbon, setEstCarbon] = useState<number | null>(null);

  const calculateEstimate = () => {
    // 0.2 kg CO2 per km (~0.32 kg CO2 per mile)
    // 0.45 kg CO2 per kWh
    const milesCarbon = calculatorInput.miles * 0.322;
    const kwhCarbon = calculatorInput.kwh * 0.45;
    setEstCarbon(parseFloat((milesCarbon + kwhCarbon).toFixed(2)));
  };

  return (
    <div className="bg-white text-slate-900 min-h-screen flex flex-col font-sans antialiased selection:bg-blue-100">
      {/* Header */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              CarbonWise <span className="text-blue-600 font-bold">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition">
              Log In
            </Link>
            <Link to="/register" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28 px-6 bg-gradient-to-b from-slate-50/50 to-white overflow-hidden">
        <motion.div 
          variants={heroContainerVariants}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto text-center"
        >
          <motion.div 
            variants={heroItemVariants}
            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs text-blue-600 font-medium mb-6"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen AI Carbon Footprint Dashboard</span>
          </motion.div>
          <motion.h1 
            variants={heroItemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6"
          >
            Track, predict, and reduce your carbon footprint with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">AI</span>
          </motion.h1>
          <motion.p 
            variants={heroItemVariants}
            className="text-lg sm:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-10"
          >
            CarbonWise AI analyzes your travel, diet, and utility consumption using Gemini AI to generate daily goals, predictive savings, and smart recommendations. Complete challenges and earn Green Coins.
          </motion.p>

          <motion.div 
            variants={heroItemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link to="/register" className="inline-flex items-center gap-2 text-md font-semibold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3.5 rounded-xl shadow-md transition w-full justify-center">
                Create Free Account
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <a href="#demo" className="inline-flex items-center gap-2 text-md font-medium text-slate-600 hover:text-slate-900 px-6 py-3.5 rounded-xl hover:bg-slate-50 border border-slate-200 transition w-full justify-center">
                Try Instant Calculator
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Platform Features</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            A complete suite of smart utilities built to support carbon neutrality and environmental awareness.
          </p>
        </div>

        <motion.div 
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Card 1 */}
          <motion.div 
            variants={cardItemVariants}
            whileHover={{ y: -4 }}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition cursor-pointer"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-5">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 mb-2">Daily Carbon Tracker</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Log transport, eating habits, energy consumption, and recycling inputs. View real-time CO2 emissions instantly.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={cardItemVariants}
            whileHover={{ y: -4 }}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition cursor-pointer"
          >
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-5">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 mb-2">AI Sustainability Coach</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Get personalized optimization summaries detailing your biggest pollution categories and custom target forecasts.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={cardItemVariants}
            whileHover={{ y: -4 }}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition cursor-pointer"
          >
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-5">
              <Scan className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 mb-2">Bill & Receipt OCR</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Upload utility invoices or grocery receipts. Gemini extracts consumption figures and automatically saves logs.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            variants={cardItemVariants}
            whileHover={{ y: -4 }}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition cursor-pointer"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-5">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 mb-2">Gamified Coins</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Earn Green Coins for maintaining log streaks, completing eco-challenges, and matching low-emissions quotas.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="py-20 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Compute Your Footprint</h2>
              <p className="text-slate-500 mt-4 leading-relaxed">
                Try a quick preview of your daily carbon emissions. Input your approximate daily vehicle mileage and electricity usage.
              </p>
              <div className="space-y-4 mt-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-600">Completely private & instant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-600">Calculated using verified EPA metrics</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Quick Calculator
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="daily-miles" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Daily Driving (Miles)</label>
                  <input
                    id="daily-miles"
                    type="number"
                    value={calculatorInput.miles}
                    onChange={(e) => setCalculatorInput({ ...calculatorInput, miles: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="daily-kwh" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Daily Power Use (kWh)</label>
                  <input
                    id="daily-kwh"
                    type="number"
                    value={calculatorInput.kwh}
                    onChange={(e) => setCalculatorInput({ ...calculatorInput, kwh: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={calculateEstimate}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 text-sm transition cursor-pointer"
                >
                  Calculate Impact
                </motion.button>

                <AnimatePresence>
                  {estCarbon !== null && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-center overflow-hidden"
                    >
                      <p className="text-xs text-blue-500 uppercase font-semibold tracking-wider">Estimated Carbon Footprint</p>
                      <p className="text-3xl font-extrabold text-blue-600 mt-1">{estCarbon} kg <span className="text-lg font-normal text-slate-500">CO₂ / day</span></p>
                      <p className="text-xs text-slate-400 mt-2">
                        An average individual emits ~54 kg CO2 per day. Sign up to build your mitigation path!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-semibold text-md text-slate-900 flex items-center gap-2.5">
              <HelpCircle className="h-4.5 w-4.5 text-blue-600" />
              How are my carbon emissions calculated?
            </h3>
            <p className="text-sm text-slate-500 mt-2 pl-7 leading-relaxed">
              We apply standard carbon emission values published by EPA and IPCC, converting transportation metrics, meal choices, energy usages, and recycling practices into kilograms of carbon dioxide equivalent (CO2e).
            </p>
          </div>

          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-semibold text-md text-slate-900 flex items-center gap-2.5">
              <HelpCircle className="h-4.5 w-4.5 text-blue-600" />
              What are Green Coins and how are they used?
            </h3>
            <p className="text-sm text-slate-500 mt-2 pl-7 leading-relaxed">
              Green Coins are gamified reward tokens given out for keeping consecutive logging streaks, succeeding in weekly and monthly targets, scanning invoices, and selecting low-carbon modes (like walking or cycling).
            </p>
          </div>

          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-semibold text-md text-slate-900 flex items-center gap-2.5">
              <HelpCircle className="h-4.5 w-4.5 text-blue-600" />
              Do I need a Gemini API Key to use the application?
            </h3>
            <p className="text-sm text-slate-500 mt-2 pl-7 leading-relaxed">
              No! The application operates automatically in a fallback mode. If a key is not active, a highly realistic templates manager compiles chatbot answers, scanner inputs, and report cards.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6 text-center bg-slate-900 text-white mt-auto border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Start your sustainability path today</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 text-sm sm:text-md">
            Join thousands of users tracking carbon inputs, scoring habits, and redeeming badges. Clean UI, secure JWT accounts, and AI suggestions.
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block"
          >
            <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition">
              Register CarbonWise Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CarbonWise AI. Built for sustainability.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Landing;
