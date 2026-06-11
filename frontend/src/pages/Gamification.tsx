import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Award,
  Coins,
  Zap,
  CheckCircle,
  Sparkles,
  Trophy,
  AlertCircle,
  Check
} from 'lucide-react';
import type { Challenge, BadgeInfo } from '../types';

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

export const Gamification: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, refreshUser } = useAuth();
  
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Challenges
  const { data: challenges, isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: ['challengesList'],
    queryFn: async () => {
      const res = await api.get('/gamification/challenges');
      return res.data;
    }
  });

  // Fetch Leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<any[]>({
    queryKey: ['leaderboardList'],
    queryFn: async () => {
      const res = await api.get('/gamification/leaderboard');
      return res.data;
    }
  });

  // Fetch Badges
  const { data: badges, isLoading: badgesLoading } = useQuery<BadgeInfo[]>({
    queryKey: ['badgesList'],
    queryFn: async () => {
      const res = await api.get('/gamification/badges');
      return res.data;
    }
  });

  // Claim Challenge Mutation
  const claimChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const res = await api.post('/gamification/claim', { challengeId });
      return res.data;
    },
    onSuccess: (data) => {
      setSuccess(data.message || 'Challenge claimed successfully!');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['challengesList'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboardList'] });
      queryClient.invalidateQueries({ queryKey: ['badgesList'] });
      refreshUser();
      setTimeout(() => setSuccess(null), 4000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to claim challenge.');
      setSuccess(null);
      setTimeout(() => setError(null), 4000);
    }
  });

  if (challengesLoading || leaderboardLoading || badgesLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-24 bg-white dark:bg-slate-950 border border-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-white dark:bg-slate-950 border border-slate-200 rounded-xl"></div>
            <div className="h-64 bg-white dark:bg-slate-950 border border-slate-200 rounded-xl"></div>
          </div>
          <div className="h-96 bg-white dark:bg-slate-950 border border-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Eco Gamification Hub
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete daily challenges, unlock premium badges, and review carbon standings on the leaderboard.
        </p>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Gamification Stats Header Card */}
      {user && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Green Coins Balance</span>
              <p className="text-2xl font-bold mt-1.5 text-slate-800 dark:text-slate-100">{user.greenCoins}</p>
            </div>
            <Coins className="h-10 w-10 text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-xl shrink-0" />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Logging Streak</span>
              <p className="text-2xl font-bold mt-1.5 text-slate-800 dark:text-slate-100">{user.streak} Days</p>
            </div>
            <Zap className="h-10 w-10 text-orange-500 bg-orange-50 dark:bg-orange-950/20 p-2 rounded-xl shrink-0" />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Badges Unlocked</span>
              <p className="text-2xl font-bold mt-1.5 text-slate-800 dark:text-slate-100">{(user.badges || []).length}</p>
            </div>
            <Award className="h-10 w-10 text-blue-500 bg-blue-50 dark:bg-blue-950/20 p-2 rounded-xl shrink-0" />
          </motion.div>
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Challenges & Badges) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Challenges List */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
          >
            <h2 className="font-semibold text-base text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              Eco-Challenges
            </h2>

            <div className="space-y-4">
              {challenges?.map((item) => {
                const claimBadgeId = `challenge_${item._id}`;
                const isClaimed = user?.badges?.includes(claimBadgeId);

                return (
                  <motion.div 
                    key={item._id} 
                    whileHover={{ scale: 1.005 }}
                    className="p-4 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          item.difficulty === 'Easy'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                            : item.difficulty === 'Medium'
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                            : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                        }`}>
                          {item.difficulty}
                        </span>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.title}</h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">{item.description}</p>
                    </div>

                    <div className="shrink-0 text-right flex flex-col items-end justify-between h-full gap-2">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-500">
                        <Coins className="h-3.5 w-3.5" />
                        <span>+{item.coinsReward}</span>
                      </div>

                      {isClaimed ? (
                        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" />
                          <span>Claimed</span>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => claimChallengeMutation.mutate(item._id)}
                          disabled={claimChallengeMutation.isPending}
                          className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                        >
                          Claim Reward
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Badges Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
          >
            <h2 className="font-semibold text-base text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              Unlocked Achievements
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges?.map((b) => (
                <motion.div
                  key={b.id}
                  whileHover={b.earned ? { y: -1 } : {}}
                  className={`p-4 rounded-xl border flex items-center gap-4 transition ${
                    b.earned
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-900 opacity-60'
                  }`}
                >
                  <div className={`p-3 rounded-xl shrink-0 ${
                    b.earned ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <Award className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${b.earned ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>{b.name}</h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{b.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Right Column (Leaderboard) */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm h-fit"
        >
          <h2 className="font-semibold text-base text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            CarbonWise Leaderboard
          </h2>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            {leaderboard?.map((leader) => {
              const isCurrentUser = leader.id === user?.id;
              return (
                <motion.div
                  key={leader.id}
                  whileHover={{ x: 1 }}
                  className={`flex items-center justify-between text-xs py-2 px-3 rounded-lg transition-colors ${
                    isCurrentUser ? 'bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-905'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      leader.rank === 1
                        ? 'bg-amber-100 text-amber-700'
                        : leader.rank === 2
                        ? 'bg-slate-100 text-slate-700'
                        : leader.rank === 3
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-slate-50 text-slate-400'
                    }`}>
                      {leader.rank}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-350 text-[11px]">{leader.name} {isCurrentUser && '(You)'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{leader.badgesCount} badges • {leader.streak}d streak</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-500">
                    <Coins className="h-3.5 w-3.5" />
                    <span>{leader.greenCoins}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
export default Gamification;
