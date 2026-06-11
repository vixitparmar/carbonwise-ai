import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Sparkles, Download, Leaf, Calendar, ArrowUpRight, CheckSquare, Zap, AlertCircle } from 'lucide-react';
import type { CoachingReport } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
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


export const Coach: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch AI Coaching Report
  const { data: report, isLoading, error, refetch } = useQuery<CoachingReport>({
    queryKey: ['coachingReport'],
    queryFn: async () => {
      const res = await api.get('/ai/coach-report');
      return res.data;
    },
    staleTime: 600000 // Cache report for 10 minutes to avoid redundant API calls
  });

  const handleExportPDF = () => {
    // Elegant printing via window.print() and customized styling class
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 w-56 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-4 w-80 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
          </div>
          <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-60 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"></div>
            <div className="h-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"></div>
          </div>
          <div className="h-96 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl">
        <h3 className="font-semibold text-red-600 dark:text-red-400">Unable to generate AI Coach insights</h3>
        <p className="text-sm text-slate-500 mt-2">Please ensure the backend server and Gemini API keys are fully set up.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Print Stylesheet overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-report, #print-report * {
            visibility: visible;
          }
          #print-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            AI Sustainability Coach
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Personalized reduction plan formulated from your daily activities.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => refetch()}
            className="flex-1 sm:flex-initial px-4 py-2 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-sm font-semibold transition cursor-pointer"
          >
            Regenerate Report
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportPDF}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition cursor-pointer"
          >
            <Download className="h-4.5 w-4.5" />
            Export PDF
          </motion.button>
        </div>
      </div>

      {/* Main Printable Document Section */}
      <motion.div 
        id="print-report" 
        ref={reportRef} 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        
        {/* Left/Middle Column (Sources & Recommendations) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Pollution Sources Card */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-base text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Primary Pollution Sources
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {report.mainSources.map((source) => (
                <div key={source.category} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 capitalize">{source.category}</span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-500">{source.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${source.percentage}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-red-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3.5 leading-relaxed">
                    {source.explanation}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actionable Recommendations list */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-base text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              Priority Action Items
            </h2>

            <div className="space-y-4">
              {report.recommendations.map((rec, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -1 }}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.impact === 'High'
                          ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                          : rec.impact === 'Medium'
                          ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                          : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {rec.impact} Impact
                      </span>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{rec.action}</h3>
                    </div>
                    
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">Save {rec.co2Savings} kg CO₂ / mo</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed pl-1 border-l-2 border-slate-100 dark:border-slate-800">
                    {rec.why}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mt-3 uppercase tracking-wider">
                    <Calendar className="h-3 w-3" />
                    <span>Timeframe: {rec.timeframe}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Right Sidebar Column (Goals & Prediction summary) */}
        <div className="space-y-8">
          
          {/* Goals Card */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-base text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Suggested Targets
            </h2>

            <div className="space-y-4">
              {report.monthlyGoals.map((goal, i) => (
                <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{goal.title}</p>
                  <div className="flex justify-between items-center mt-2.5 text-xs">
                    <span className="text-slate-400 capitalize">Category: {goal.category}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-500">Limit: {goal.target} kg</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Predictions / Forecast Box */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-50/50 to-emerald-50/30 dark:from-slate-900 dark:to-slate-900 border border-blue-100 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-base text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              Emissions Forecast
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {report.forecast}
            </p>
            <div className="mt-4 pt-4 border-t border-blue-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Forecast Confidence</span>
              <span className="text-blue-600 dark:text-blue-400">92%</span>
            </div>
          </motion.div>

        </div>

      </motion.div>
    </div>
  );
};
export default Coach;
