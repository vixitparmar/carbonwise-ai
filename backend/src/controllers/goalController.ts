import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { GoalRepository, UserRepository } from '../services/dbService';
import { z } from 'zod';

const createGoalSchema = z.object({
  type: z.enum(['weekly', 'monthly']),
  category: z.string().default('overall'),
  targetEmissions: z.number().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const goalController = {
  async createGoal(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = createGoalSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation error', details: parsed.error.format() });
      }

      const userId = req.userId!;
      const goal = await GoalRepository.create({
        userId,
        ...parsed.data,
        currentEmissions: 0,
        status: 'active'
      });

      return res.status(201).json({
        message: 'Goal created successfully',
        goal
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error creating goal.', message: error.message });
    }
  },

  async getGoals(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const goals = await GoalRepository.findByUserId(userId);
      const todayStr = new Date().toISOString().split('T')[0];
      const user = await UserRepository.findById(userId);

      let updatedAnyGoal = false;
      let coinsEarned = 0;

      // Automatically evaluate expired active goals
      const updatedGoals = await Promise.all(
        goals.map(async (goal: any) => {
          if (goal.status === 'active' && todayStr > goal.endDate) {
            updatedAnyGoal = true;
            const achieved = goal.currentEmissions <= goal.targetEmissions;
            const newStatus = achieved ? 'achieved' : 'failed';

            let reward = 0;
            if (achieved) {
              reward = goal.type === 'weekly' ? 100 : 300;
              coinsEarned += reward;
            }

            const updated = await GoalRepository.updateByIdAndUserId(goal._id, userId, {
              status: newStatus
            });
            return updated || goal;
          }
          return goal;
        })
      );

      // Credit rewards to user if they achieved goals
      if (updatedAnyGoal && coinsEarned > 0 && user) {
        await UserRepository.updateById(userId, {
          greenCoins: (user.greenCoins || 0) + coinsEarned
        });
      }

      return res.json(updatedGoals);
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error retrieving goals.', message: error.message });
    }
  }
};
