import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import {
  Leaf,
  Plus,
  Trash2,
  Car,
  Utensils,
  Lightbulb,
  ShoppingBag,
  Trash,
  Droplet,
  Plane,
  TrendingDown,
  Calendar,
  AlertCircle
} from 'lucide-react';
import type { Activity } from '../types';
import { calculateCarbon } from '../utils/carbonCalculator';

type ActivityFormInputs = {
  type: string;
  value: number;
  date: string;
  // Detail keys
  mode?: string;
  diet?: string;
  source?: string;
  distance?: string;
  category?: string;
  recycled?: boolean;
};

const activityTypes = [
  { id: 'travel', name: 'Private Travel', icon: Car, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
  { id: 'public_transport', name: 'Public Transit', icon: TrendingDown, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20' },
  { id: 'flight', name: 'Flights', icon: Plane, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
  { id: 'food', name: 'Diet & Meals', icon: Utensils, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
  { id: 'electricity', name: 'Electricity', icon: Lightbulb, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
  { id: 'shopping', name: 'Shopping & Goods', icon: ShoppingBag, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
  { id: 'waste', name: 'Waste Disposal', icon: Trash, color: 'text-red-500 bg-red-50 dark:bg-red-950/20' },
  { id: 'water', name: 'Water Usage', icon: Droplet, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' },
  { id: 'cycling', name: 'Cycling', icon: Leaf, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20' },
  { id: 'walking', name: 'Walking', icon: Leaf, color: 'text-lime-500 bg-lime-50 dark:bg-lime-950/20' }
];

export const Tracker: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('travel');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Default date: today in YYYY-MM-DD local format
  const todayStr = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, watch, reset, setValue } = useForm<ActivityFormInputs>({
    defaultValues: {
      type: 'travel',
      value: 10,
      date: todayStr,
      mode: 'gasoline_car',
      diet: 'omnivore',
      source: 'grid',
      distance: 'short',
      category: 'general',
      recycled: false
    }
  });

  // Watch inputs for carbon calculator preview
  const watchedValue = watch('value');
  const watchedMode = watch('mode');
  const watchedDiet = watch('diet');
  const watchedSource = watch('source');
  const watchedDistance = watch('distance');
  const watchedCategory = watch('category');
  const watchedRecycled = watch('recycled');

  // Compute live carbon emission preview
  const livePreviewCarbon = calculateCarbon({
    type: selectedType,
    value: parseFloat(watchedValue as any) || 0,
    details: {
      mode: watchedMode,
      diet: watchedDiet,
      source: watchedSource,
      distance: watchedDistance,
      category: watchedCategory,
      recycled: watchedRecycled
    }
  });

  // Query activities list
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['activitiesList'],
    queryFn: async () => {
      const res = await api.get('/activities');
      return res.data;
    }
  });

  // Log activity mutation
  const logActivityMutation = useMutation({
    mutationFn: async (inputs: ActivityFormInputs) => {
      // Structure details
      const details: Record<string, any> = {};
      if (selectedType === 'travel') details.mode = inputs.mode;
      if (selectedType === 'public_transport') details.mode = inputs.mode || 'bus';
      if (selectedType === 'flight') details.distance = inputs.distance;
      if (selectedType === 'food') details.diet = inputs.diet;
      if (selectedType === 'electricity') details.source = inputs.source;
      if (selectedType === 'shopping') details.category = inputs.category;
      if (selectedType === 'waste') details.recycled = inputs.recycled;

      const payload = {
        type: selectedType,
        value: Number(inputs.value),
        date: inputs.date,
        details
      };

      const res = await api.post('/activities', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMessage('Activity logged successfully! Green Coins credited.');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['activitiesList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      reset({
        type: selectedType,
        value: 10,
        date: todayStr,
        mode: 'gasoline_car',
        diet: 'omnivore',
        source: 'grid',
        distance: 'short',
        category: 'general',
        recycled: false
      });
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.error || 'Failed to record activity.');
      setSuccessMessage(null);
    }
  });

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activitiesList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });

  const onSubmit = (data: ActivityFormInputs) => {
    logActivityMutation.mutate(data);
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setValue('type', typeId);
    // Set logical defaults based on type
    if (typeId === 'travel' || typeId === 'public_transport' || typeId === 'cycling' || typeId === 'walking') {
      setValue('value', 10); // default km
    } else if (typeId === 'food') {
      setValue('value', 1); // default meal count
    } else if (typeId === 'electricity') {
      setValue('value', 15); // default kWh
    } else if (typeId === 'water') {
      setValue('value', 150); // default Liters
    } else if (typeId === 'shopping' || typeId === 'waste') {
      setValue('value', 2); // items/kg
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Daily Activity Tracker
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Record your day-to-day sustainability variables to estimate and adjust your environmental impact.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Logger form card */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-base mb-4 text-slate-800 dark:text-slate-200">Record a New Entry</h2>
          
          {successMessage && (
            <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Leaf className="h-4.5 w-4.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Activity Category Grid Selection */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {activityTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <motion.button
                  key={type.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-lg mb-1.5 ${type.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] hidden sm:block truncate max-w-full">{type.name}</span>
                </motion.button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Date of Activity
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    {...register('date', { required: true })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quantity Value Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {selectedType === 'travel' || selectedType === 'public_transport' || selectedType === 'cycling' || selectedType === 'walking'
                    ? 'Distance (Kilometers)'
                    : selectedType === 'food'
                    ? 'Meals Consumed'
                    : selectedType === 'electricity'
                    ? 'Power Consumed (kWh)'
                    : selectedType === 'water'
                    ? 'Water Consumed (Liters)'
                    : selectedType === 'shopping'
                    ? 'Items Purchased'
                    : 'Quantity (Kilograms)'}
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('value', { required: true, min: 0.0001 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* DYNAMIC FIELD SELECTIONS */}
            {selectedType === 'travel' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Vehicle Type / Fuel Type
                </label>
                <select
                  {...register('mode')}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="gasoline_car">Gasoline Car (Avg)</option>
                  <option value="diesel_car">Diesel Car</option>
                  <option value="hybrid_car">Hybrid Vehicle</option>
                  <option value="electric_car">Electric Car (EV)</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>
            )}

            {selectedType === 'public_transport' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Transit Mode
                </label>
                <select
                  {...register('mode')}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="bus">City Bus</option>
                  <option value="metro">Metro / Subway Train</option>
                  <option value="train">Long-distance Railway</option>
                </select>
              </div>
            )}

            {selectedType === 'flight' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Flight Classification
                </label>
                <select
                  {...register('distance')}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="short">Short-haul (under 1,500 km)</option>
                  <option value="long">Long-haul (over 1,500 km)</option>
                </select>
              </div>
            )}

            {selectedType === 'food' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Diet Type
                </label>
                <select
                  {...register('diet')}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="vegan">Vegan Meal (Zero meat, dairy, eggs)</option>
                  <option value="vegetarian">Vegetarian Meal (No meat)</option>
                  <option value="poultry">Poultry meal (Chicken, Turkey)</option>
                  <option value="red_meat">Red Meat (Beef, Pork, Lamb)</option>
                  <option value="omnivore">Average Balanced Meal</option>
                </select>
              </div>
            )}

            {selectedType === 'electricity' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Energy Source
                </label>
                <select
                  {...register('source')}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="grid">Standard Power Grid Average</option>
                  <option value="solar">Renewable Energy (Solar / Wind)</option>
                </select>
              </div>
            )}

            {selectedType === 'shopping' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Goods Category
                </label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="general">General household items</option>
                  <option value="clothing">Apparel & Clothing</option>
                  <option value="electronics">Electronics (Phones, chargers)</option>
                  <option value="appliances">Large Appliances</option>
                  <option value="furniture">Furniture</option>
                </select>
              </div>
            )}

            {selectedType === 'waste' && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="recycled"
                  {...register('recycled')}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="recycled" className="text-sm text-slate-600 dark:text-slate-400">
                  This waste was successfully separated and recycled
                </label>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-900">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Estimated Carbon Impact</span>
                <p className={`text-lg font-bold ${livePreviewCarbon > 0 ? 'text-slate-800 dark:text-slate-200' : 'text-emerald-600'}`}>
                  {livePreviewCarbon.toFixed(2)} kg CO₂e
                </p>
              </div>
              
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={logActivityMutation.isPending}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow transition disabled:opacity-50 cursor-pointer"
              >
                {logActivityMutation.isPending ? 'Logging...' : 'Save Activity'}
              </motion.button>
            </div>
          </form>
        </div>

        {/* Info card & quick history sidebar */}
        <div className="space-y-6">
          {/* Carbon Factor Information Box */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-xs">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertCircle className="h-4.5 w-4.5 text-blue-600" />
              Emission Ratios
            </h3>
            <div className="space-y-2 text-slate-500 dark:text-slate-400 leading-relaxed">
              <p>🌱 <strong>Walking & Cycling</strong> produce exactly 0 carbon emissions and earn +20 Green Coins.</p>
              <p>🚗 <strong>Gasoline cars</strong> emit ~200g of CO₂ per km. In contrast, <strong>EV cars</strong> produce ~50g per km.</p>
              <p>🥩 <strong>Beef/Pork meals</strong> generate 3.2 kg CO₂ per meal, whereas <strong>vegan meals</strong> release only 0.5 kg CO₂.</p>
              <p>⚡ <strong>Recycling</strong> reduces landfill waste methane carbon from 1.25kg down to only 80g per kilogram.</p>
            </div>
          </div>

          {/* Today's carbon score sidebar widget */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wider mb-4">Activities Logged</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-900 max-h-80 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="text-center py-6 text-slate-400 text-xs">Loading...</div>
              ) : activities && activities.length > 0 ? (
                <AnimatePresence initial={false}>
                  {activities.map((act) => (
                    <motion.div
                      key={act._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="py-3 flex items-center justify-between text-xs group border-b border-slate-50 dark:border-slate-900 last:border-b-0"
                    >
                      <div>
                        <p className="font-semibold capitalize text-slate-800 dark:text-slate-300">{act.type.replace('_', ' ')}</p>
                        <p className="text-slate-400 mt-0.5">{new Date(act.date).toLocaleDateString()} • {act.value} units</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${act.carbonEmissions > 0 ? 'text-slate-800 dark:text-slate-200' : 'text-emerald-500'}`}>
                          {act.carbonEmissions.toFixed(1)} kg
                        </span>
                        <button
                          onClick={() => deleteActivityMutation.mutate(act._id)}
                          disabled={deleteActivityMutation.isPending}
                          className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                          title="Delete entry"
                          aria-label="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="text-center py-6 text-slate-400">No logs saved.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Tracker;
