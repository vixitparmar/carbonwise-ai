import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import {
  TrendingUp,
  BarChart3,
  Filter,
  Leaf,
  Car,
  Utensils,
  Lightbulb,
  ShoppingBag,
  Trash2,
  Droplet
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import type { Activity, DashboardStats } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
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
      stiffness: 110,
      damping: 15
    }
  }
} as const;

export const Analytics: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch stats for breakdown
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['analyticsStats'],
    queryFn: async () => {
      const res = await api.get('/activities/stats');
      return res.data;
    }
  });

  // Fetch all activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['analyticsActivities'],
    queryFn: async () => {
      const res = await api.get('/activities');
      return res.data;
    }
  });

  if (statsLoading || activitiesLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-xl"></div>
          <div className="h-80 bg-white rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Filter activities
  const filteredActivities = activities?.filter((act) => {
    if (filterType === 'all') return true;
    return act.type === filterType;
  });

  // Format Daily Trend Data for past 7 days
  const dailyEmissions: Record<string, number> = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyEmissions[dateStr] = 0;
  }

  activities?.forEach((act) => {
    if (dailyEmissions[act.date] !== undefined) {
      dailyEmissions[act.date] += act.carbonEmissions;
    }
  });

  const trendData = Object.entries(dailyEmissions).map(([date, value]) => {
    const dateObj = new Date(date);
    return {
      date: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      emissions: parseFloat(value.toFixed(1))
    };
  });

  // Format Category Comparison Data
  const barData = stats
    ? Object.entries(stats.breakdown)
        .map(([key, value]) => ({
          category: key.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          emissions: parseFloat(value.toFixed(1))
        }))
        .filter((d) => d.emissions > 0)
    : [];

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'travel':
      case 'public_transport':
      case 'flight':
        return Car;
      case 'food':
        return Utensils;
      case 'electricity':
        return Lightbulb;
      case 'shopping':
        return ShoppingBag;
      case 'waste':
        return Trash2;
      case 'water':
        return Droplet;
      default:
        return Leaf;
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Carbon Analytics & Forecasts
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Detailed visual breakdowns of emission histories and trend predictions.
        </p>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Daily Emissions Trend */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
        >
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
              Weekly Carbon Trend
            </h3>
            <p className="text-xs text-slate-500">Total daily emissions (kg CO2e) in the last 7 days</p>
          </div>

          <div className="h-72 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Emissions']} />
                <Area type="monotone" dataKey="emissions" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorEmissions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Breakdown Bar Chart */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
        >
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <BarChart3 className="h-4.5 w-4.5 text-emerald-500" />
              Impact by Category
            </h3>
            <p className="text-xs text-slate-500">Cumulative monthly impact (kg CO2) split by activity type</p>
          </div>

          <div className="h-72 mt-6">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="category" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Impact']} />
                  <Bar dataKey="emissions" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                <Leaf className="h-8 w-8 text-slate-200" />
                <span>No carbon history compiled yet.</span>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Activity Logbook Table */}
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
      >
        
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-5 mb-5">
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400">Environmental Logbook</h3>
            <p className="text-xs text-slate-500 mt-0.5">Filter and review your tracked items database</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Activities</option>
              <option value="travel">Travel</option>
              <option value="public_transport">Public Transit</option>
              <option value="flight">Flights</option>
              <option value="food">Diet</option>
              <option value="electricity">Electricity</option>
              <option value="shopping">Shopping</option>
              <option value="waste">Waste</option>
              <option value="water">Water</option>
              <option value="cycling">Cycling</option>
              <option value="walking">Walking</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {filteredActivities && filteredActivities.length > 0 ? (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-900 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Quantity Input</th>
                  <th className="py-3 px-4 text-right">CO₂ Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                <AnimatePresence mode="popLayout">
                  {filteredActivities.map((act) => {
                    const Icon = getCategoryIcon(act.type);
                    return (
                      <motion.tr 
                        key={act._id} 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35"
                      >
                        <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(act.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 capitalize">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-slate-400" />
                            <span>{act.type.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {act.value} {act.type === 'electricity' ? 'kWh' : act.type === 'water' ? 'Liters' : act.type === 'waste' ? 'kg' : 'units'}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${act.carbonEmissions > 0 ? 'text-slate-800 dark:text-slate-200' : 'text-emerald-500'}`}>
                          {act.carbonEmissions.toFixed(2)} kg
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No matching activity logs found.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
export default Analytics;
