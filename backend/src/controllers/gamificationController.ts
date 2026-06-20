import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ChallengeRepository, UserRepository, useMongo } from '../services/dbService';
import { UserModel } from '../models/User';
import { fileDb } from '../services/fileDb';

const BADGES_LIST = [
  { id: 'streak_3', name: '3-Day Eco Warrior', description: 'Log activities for 3 consecutive days.', icon: 'Zap' },
  { id: 'streak_7', name: 'Weekly Carbon Master', description: 'Log activities for 7 consecutive days.', icon: 'Award' },
  { id: 'coins_500', name: 'Green Capitalist', description: 'Amass a total of 500 Green Coins.', icon: 'Coins' },
  { id: 'low_carbon_weekly', name: 'Low Emission Champion', description: 'Maintain weekly emissions below 100 kg CO2.', icon: 'CheckCircle' },
  { id: 'ocr_expert', name: 'Smart Scanner', description: 'Scan your first electricity bill or shopping receipt.', icon: 'Scan' }
];

export const gamificationController = {
  async getChallenges(req: AuthenticatedRequest, res: Response) {
    try {
      const challenges = await ChallengeRepository.listAll();
      return res.json(challenges);
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error fetching challenges.', message: error.message });
    }
  },

  async claimChallenge(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { challengeId } = req.body;

      const challenges = await ChallengeRepository.listAll();
      const challenge = challenges.find((c: any) => c._id === challengeId || c.id === challengeId);

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found.' });
      }

      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Check if user already claimed this challenge by storing claimed challenges in a list.
      // Let's check user badges or create a simple list in details.
      const updatedBadges = [...(user.badges || [])];
      const claimBadgeId = `challenge_${challengeId}`;

      if (updatedBadges.includes(claimBadgeId)) {
        return res.status(400).json({ error: 'Challenge already completed and claimed.' });
      }

      // Mark as claimed and credit coins
      updatedBadges.push(claimBadgeId);
      const newCoins = (user.greenCoins || 0) + challenge.coinsReward;

      await UserRepository.updateById(userId, {
        badges: updatedBadges,
        greenCoins: newCoins
      });

      return res.json({
        message: `Successfully completed challenge! Earned ${challenge.coinsReward} Green Coins.`,
        greenCoins: newCoins,
        badges: updatedBadges
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error claiming challenge.', message: error.message });
    }
  },

  async getLeaderboard(req: AuthenticatedRequest, res: Response) {
    try {
      let usersList: any[] = [];
      if (useMongo) {
        usersList = await UserModel.find({}, 'name greenCoins streak badges')
          .sort({ greenCoins: -1 })
          .limit(20)
          .lean();
      } else {
        const data = await fileDb.read();
        usersList = (data.users || [])
          .map((u: any) => ({
            _id: u._id,
            name: u.name,
            greenCoins: u.greenCoins || 0,
            streak: u.streak || 0,
            badges: u.badges || []
          }))
          .sort((a: any, b: any) => b.greenCoins - a.greenCoins)
          .slice(0, 20);
      }

      // Rank them
      const leaderboard = usersList.map((u, index) => ({
        rank: index + 1,
        id: u._id,
        name: u.name,
        greenCoins: u.greenCoins,
        streak: u.streak,
        badgesCount: (u.badges || []).length
      }));

      return res.json(leaderboard);
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error retrieving leaderboard.', message: error.message });
    }
  },

  async getBadgesInfo(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const earnedIds = user.badges || [];
      const detailedBadges = BADGES_LIST.map((badge) => ({
        ...badge,
        earned: earnedIds.includes(badge.id)
      }));

      return res.json(detailedBadges);
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error retrieving badges.', message: error.message });
    }
  }
};
