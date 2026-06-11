import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useCountUp } from '../hooks/useCountUp';
import {
  Leaf,
  TrendingUp,
  Award,
  Zap,
  Coins,
  Activity,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type { DashboardStats, Goal } from '../types';

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
  hidden: { opacity: 0, y: 10 },
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

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Fetch Stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/activities/stats');
      return res.data;
    },
    refetchInterval: 10000 // refetch stats every 10s for real-time update
  });

  // Fetch Goals
  const { data: goals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ['dashboardGoals'],
    queryFn: async () => {
      const res = await api.get('/goals');
      return res.data;
    }
  });

  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<any[]>({
    queryKey: ['recentActivities'],
    queryFn: async () => {
      const res = await api.get('/activities');
      return res.data.slice(0, 5); // top 5
    }
  });

  // Count up numbers for premium look
  const todayCarbonAnimated = useCountUp(stats?.metrics.todayCarbon || 0, 400, 1);
  const weeklyCarbonAnimated = useCountUp(stats?.metrics.weeklyCarbon || 0, 400, 1);
  const monthlyCarbonAnimated = useCountUp(stats?.metrics.monthlyCarbon || 0, 400, 1);
  const predictionAnimated = useCountUp(stats?.metrics.prediction || 0, 400, 1);
  const carbonScoreAnimated = useCountUp(stats?.metrics.carbonScore || 0, 450, 0);
  const greenCoinsAnimated = useCountUp(stats?.greenCoins || 0, 450, 0);
  const streakAnimated = useCountUp(stats?.streak || 0, 350, 0);

  if (statsLoading || goalsLoading || activitiesLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
          </div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5"></div>
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6"></div>
          <div className="h-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6"></div>
        </div>
      </div>
    );
  }

  if (statsError || !stats) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl">
        <h3 className="font-semibold text-red-600 dark:text-red-400">Error Loading Dashboard</h3>
        <p className="text-sm text-slate-500 mt-2">Could not retrieve carbon statistics. Please ensure the backend is running.</p>
      </div>
    );
  }

  // Format Recharts breakdown data
  const pieData = Object.entries(stats.breakdown)
    .map(([key, value]) => ({
      name: key.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: parseFloat(value.toFixed(1))
    }))
    .filter((d) => d.value > 0);

  const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

  // Calculate goal percentage
  const activeGoal = goals?.find(g => g.status === 'active');
  const goalPercent = activeGoal 
    ? Math.min(100, Math.round((activeGoal.currentEmissions / activeGoal.targetEmissions) * 100))
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Hello, {user?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's your sustainability digest. Your current carbon score is{' '}
            <span className="font-semibold text-emerald-600 dark:text-emerald-500">{carbonScoreAnimated}/100</span>.
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            to="/tracker"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus className="h-4.5 w-4.5" />
            Log Daily Activity
          </Link>
        </motion.div>
      </div>

      {/* Quick Metrics Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Metric 1 */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Carbon</span>
            <Leaf className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{todayCarbonAnimated}</span>
            <span className="text-xs text-slate-400">kg CO₂</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Tracked emissions since midnight</div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Weekly Total</span>
            <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{weeklyCarbonAnimated}</span>
            <span className="text-xs text-slate-400">kg CO₂</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Past 7 days running total</div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Forecast</span>
            <Sparkles className="h-4.5 w-4.5 text-orange-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{predictionAnimated}</span>
            <span className="text-xs text-slate-400">kg CO₂</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Predicted monthly carbon footprint</div>
        </motion.div>

        {/* Metric 4 */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Carbon Goal</span>
            <Activity className="h-4.5 w-4.5 text-red-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{monthlyCarbonAnimated}</span>
            <span className="text-xs text-slate-400">/ {stats.metrics.carbonGoal} kg</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Target limit budget remaining</div>
        </motion.div>
      </motion.div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Carbon Breakdown Pie Chart */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-1">Carbon Breakdown</h3>
            <p className="text-xs text-slate-500">Highest emission categories (Past 30d)</p>
          </div>

          <div className="h-48 my-4 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} kg CO₂`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <Leaf className="h-8 w-8 text-slate-200 dark:text-slate-800" />
                <span>No activities tracked yet.<br />Add logs in the Tracker tab.</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span>{entry.name}</span>
                </div>
                <span className="font-semibold">{entry.value} kg</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Progress Widget */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-1">Active Carbon Goal</h3>
            <p className="text-xs text-slate-500">Track how well you stay within budget</p>
          </div>

          {activeGoal ? (
            <div className="space-y-6 my-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-md font-semibold text-slate-800 dark:text-slate-200">
                    {activeGoal.type === 'weekly' ? 'Weekly' : 'Monthly'} Reduction Plan ({activeGoal.category})
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Ends on {new Date(activeGoal.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {activeGoal.currentEmissions.toFixed(1)} / {activeGoal.targetEmissions} kg
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">CO₂ Emitted</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goalPercent}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full ${
                      goalPercent! > 100
                        ? 'bg-red-500'
                        : goalPercent! > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  ></motion.div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-semibold">
                  <span>{goalPercent}% Emitted</span>
                  <span>{Math.max(0, activeGoal.targetEmissions - activeGoal.currentEmissions).toFixed(1)} kg Remaining</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-4">
              <p className="text-sm text-slate-500 font-medium">No active emission target goal.</p>
              <p className="text-xs text-slate-400 mt-1">Set a monthly limit to challenge yourself.</p>
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-500 font-semibold hover:underline mt-4"
              >
                Set Carbon Goal
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Quick AI Coach Tip */}
          <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg flex gap-3 text-xs">
            <Sparkles className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800 dark:text-blue-400">Coach Suggestion</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Switching one beef meal to poultry or vegetables saves ~2.4 kg CO2. That single choice covers 5% of your weekly budget!
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Recent Activity Feed & Gamification Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4 mb-4">
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400">Recent Activities</h3>
              <p className="text-xs text-slate-500">Your logged environmental records</p>
            </div>
            <Link to="/tracker" className="text-xs text-blue-600 dark:text-blue-500 font-semibold hover:underline flex items-center gap-1">
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.map((act) => (
                <div key={act._id} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-bold text-slate-500 capitalize text-xs">
                      {act.type.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium capitalize text-slate-800 dark:text-slate-200">
                        {act.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(act.date).toLocaleDateString()} • {act.value} {act.type === 'electricity' ? 'kWh' : act.type === 'water' ? 'Liters' : act.type === 'waste' ? 'kg' : 'units'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${act.carbonEmissions > 0 ? 'text-slate-800 dark:text-slate-200' : 'text-emerald-600'}`}>
                      {act.carbonEmissions > 0 ? `+${act.carbonEmissions.toFixed(1)} kg` : '0 kg'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">CO₂ Impact</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No logs recorded. Select "Log Daily Activity" to start tracking.
              </div>
            )}
          </div>
        </div>

        {/* Gamification Streak & Coins */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-1">Eco Gamification</h3>
            <p className="text-xs text-slate-500">Keep up the streak, earn coins</p>
          </div>

          <div className="grid grid-cols-2 gap-4 my-6 text-center">
            <motion.div whileHover={{ y: -2 }} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="h-10 w-10 mx-auto bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-lg flex items-center justify-center mb-2">
                <Coins className="h-5.5 w-5.5" />
              </div>
              <span className="text-xs text-slate-400 font-semibold">Coins</span>
              <p className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-200">{greenCoinsAnimated}</p>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="h-10 w-10 mx-auto bg-orange-50 dark:bg-orange-950/30 text-orange-500 rounded-lg flex items-center justify-center mb-2">
                <Zap className="h-5.5 w-5.5" />
              </div>
              <span className="text-xs text-slate-400 font-semibold">Streak</span>
              <p className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-200">{streakAnimated} Days</p>
            </motion.div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-900">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Link
                to="/gamification"
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 text-xs font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
              >
                <Award className="h-4 w-4" />
                Go to Eco Challenges
              </Link>
            </motion.div>
          </div>
        </div>

      </div>

    </div>
  );
};
export default Dashboard;
