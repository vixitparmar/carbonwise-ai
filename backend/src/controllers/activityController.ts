import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ActivityRepository, UserRepository, GoalRepository } from '../services/dbService';
import { calculateCarbon } from '../utils/carbonCalculator';
import { z } from 'zod';

const logActivitySchema = z.object({
  type: z.enum([
    'travel',
    'food',
    'electricity',
    'shopping',
    'waste',
    'water',
    'flight',
    'public_transport',
    'cycling',
    'walking'
  ]),
  value: z.number().min(0.0001),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  details: z.record(z.any()).optional()
});

function getYesterdayString(todayStr: string): string {
  const d = new Date(todayStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export const activityController = {
  async logActivity(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = logActivitySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation error', details: parsed.error.format() });
      }

      const { type, value, date, details = {} } = parsed.data;
      const userId = req.userId!;

      // Calculate carbon emissions
      const carbonEmissions = calculateCarbon({ type, value, details });

      // Save activity
      const activity = await ActivityRepository.create({
        userId,
        date,
        type,
        value,
        carbonEmissions,
        details
      });

      // Gamification: Fetch and Update User Streak & Coins
      const user = await UserRepository.findById(userId);
      if (user) {
        let newStreak = user.streak || 0;
        let coinsEarned = 0;

        // Base reward for logging
        if (type === 'cycling' || type === 'walking') {
          coinsEarned += 20; // Incentive for green transit
        } else {
          coinsEarned += 5; // Standard logging reward
        }

        const yesterdayStr = getYesterdayString(date);

        if (!user.lastLoggedDate) {
          // First log ever
          newStreak = 1;
        } else if (user.lastLoggedDate === yesterdayStr) {
          // Consecutive day
          newStreak += 1;
          // Streak bonus
          if (newStreak % 5 === 0) {
            coinsEarned += 50; // Every 5 days bonus
          } else {
            coinsEarned += 10;
          }
        } else if (user.lastLoggedDate === date) {
          // Already logged today, streak remains same
        } else {
          // Streak broken
          newStreak = 1;
        }

        // Update user metrics
        await UserRepository.updateById(userId, {
          streak: newStreak,
          lastLoggedDate: date,
          greenCoins: (user.greenCoins || 0) + coinsEarned
        });

        // Award Badges if goals met
        const updatedBadges = [...(user.badges || [])];
        if (newStreak >= 3 && !updatedBadges.includes('streak_3')) {
          updatedBadges.push('streak_3');
        }
        if (newStreak >= 7 && !updatedBadges.includes('streak_7')) {
          updatedBadges.push('streak_7');
        }
        if ((user.greenCoins || 0) + coinsEarned >= 500 && !updatedBadges.includes('coins_500')) {
          updatedBadges.push('coins_500');
        }

        if (updatedBadges.length !== (user.badges || []).length) {
          await UserRepository.updateById(userId, { badges: updatedBadges });
        }
      }

      // Update Active Goals for this user
      const userGoals = await GoalRepository.findByUserId(userId);
      const activeGoals = userGoals.filter((g) => g.status === 'active');
      for (const goal of activeGoals) {
        // Check if date falls in goal range
        if (date >= goal.startDate && date <= goal.endDate) {
          // If category matches, or it's an overall carbon target
          if (goal.category === 'overall' || goal.category === type) {
            const newEmissions = (goal.currentEmissions || 0) + carbonEmissions;
            const updates: any = { currentEmissions: newEmissions };

            // For carbon footprint goals, we want to keep emissions UNDER targetEmissions.
            // If the goal is a "reduction" goal, we check at the end. But for now, we just update current.
            await GoalRepository.updateByIdAndUserId(goal._id, userId, updates);
          }
        }
      }

      return res.status(201).json({
        message: 'Activity logged successfully',
        activity
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error logging activity.', message: error.message });
    }
  },

  async getActivities(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const activities = await ActivityRepository.findByUserId(userId);
      return res.json(activities);
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error retrieving activities.', message: error.message });
    }
  },

  async deleteActivity(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deleted = await ActivityRepository.deleteByIdAndUserId(id, userId);
      if (!deleted) {
        return res.status(404).json({ error: 'Activity not found or unauthorized.' });
      }

      return res.json({ message: 'Activity deleted successfully.' });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error deleting activity.', message: error.message });
    }
  },

  async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const activities = await ActivityRepository.findByUserId(userId);
      const user = await UserRepository.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Compute aggregates
      const todayStr = new Date().toISOString().split('T')[0];

      // Weekly dates
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

      // Monthly dates
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];

      let todayCarbon = 0;
      let weeklyCarbon = 0;
      let monthlyCarbon = 0;

      const categoryBreakdown: Record<string, number> = {
        travel: 0,
        food: 0,
        electricity: 0,
        shopping: 0,
        waste: 0,
        water: 0,
        flight: 0,
        public_transport: 0,
        cycling: 0,
        walking: 0
      };

      for (const act of activities) {
        const carbon = act.carbonEmissions || 0;
        if (act.date === todayStr) {
          todayCarbon += carbon;
        }
        if (act.date >= oneWeekAgoStr) {
          weeklyCarbon += carbon;
        }
        if (act.date >= oneMonthAgoStr) {
          monthlyCarbon += carbon;
        }
        if (categoryBreakdown[act.type] !== undefined) {
          categoryBreakdown[act.type] += carbon;
        }
      }

      // Calculate Carbon Score (Simple index: 100 - (monthlyCarbon / monthlyGoal) * 50)
      // Cap at 100, min 0. Good is monthlyCarbon < goal.
      const monthlyGoal = user.carbonGoal || 500;
      const usageRatio = monthlyGoal > 0 ? monthlyCarbon / monthlyGoal : 1;
      let carbonScore = Math.round(100 - usageRatio * 40);
      if (carbonScore > 100) carbonScore = 100;
      if (carbonScore < 10) carbonScore = 10; // floor score at 10 for basic participation

      // Simple prediction: next month's carbon based on average of past 30 days
      const predictedMonthly = Math.round(monthlyCarbon * 1.05); // slightly growing trend simulation

      return res.json({
        metrics: {
          todayCarbon: parseFloat(todayCarbon.toFixed(2)),
          weeklyCarbon: parseFloat(weeklyCarbon.toFixed(2)),
          monthlyCarbon: parseFloat(monthlyCarbon.toFixed(2)),
          carbonGoal: monthlyGoal,
          carbonScore,
          prediction: parseFloat(predictedMonthly.toFixed(2))
        },
        breakdown: categoryBreakdown,
        streak: user.streak || 0,
        greenCoins: user.greenCoins || 0,
        badgesCount: (user.badges || []).length
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error retrieving dashboard statistics.', message: error.message });
    }
  }
};
