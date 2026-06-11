import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';
import { ChatRepository, ActivityRepository, UserRepository } from '../services/dbService';

export const aiController = {
  async chat(req: AuthenticatedRequest, res: Response) {
    try {
      const { message } = req.body;
      const userId = req.userId!;

      if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message content is required.' });
      }

      // Fetch chat history from DB
      const history = await ChatRepository.findByUserId(userId);

      // Call AI Service
      const reply = await aiService.generateChatResponse(
        message,
        history.map((h: any) => ({ role: h.role, content: h.content }))
      );

      // Save user message and AI response to DB
      await ChatRepository.create({ userId, role: 'user', content: message });
      const savedReply = await ChatRepository.create({ userId, role: 'assistant', content: reply });

      return res.json({ reply: savedReply.content, createdAt: savedReply.createdAt });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error in chatbot request.', message: error.message });
    }
  },

  async getChatHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const history = await ChatRepository.findByUserId(userId);
      return res.json(history);
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error retrieving chat history.', message: error.message });
    }
  },

  async clearChatHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      await ChatRepository.clearHistoryByUserId(userId);
      return res.json({ message: 'Chat history cleared successfully.' });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error clearing chat history.', message: error.message });
    }
  },

  async getCoachingReport(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // We need to compile user statistics
      const activities = await ActivityRepository.findByUserId(userId);
      
      const todayStr = new Date().toISOString().split('T')[0];
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];

      let monthlyCarbon = 0;
      let todayCarbon = 0;
      let weeklyCarbon = 0;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

      const breakdown: Record<string, number> = {
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
        if (act.date === todayStr) todayCarbon += carbon;
        if (act.date >= oneWeekAgoStr) weeklyCarbon += carbon;
        if (act.date >= oneMonthAgoStr) {
          monthlyCarbon += carbon;
        }
        if (breakdown[act.type] !== undefined) {
          breakdown[act.type] += carbon;
        }
      }

      const carbonGoal = user.carbonGoal || 500;
      const usageRatio = carbonGoal > 0 ? monthlyCarbon / carbonGoal : 1;
      let carbonScore = Math.round(100 - usageRatio * 40);
      if (carbonScore > 100) carbonScore = 100;
      if (carbonScore < 10) carbonScore = 10;

      const userStats = {
        name: user.name,
        metrics: {
          todayCarbon,
          weeklyCarbon,
          monthlyCarbon,
          carbonGoal,
          carbonScore
        },
        breakdown
      };

      // Call AI Service to build report
      const report = await aiService.generateCoachingReport(userStats);

      return res.json(report);
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error generating report.', message: error.message });
    }
  },

  async scanBill(req: AuthenticatedRequest, res: Response) {
    try {
      const file = req.file;
      const userId = req.userId!;

      if (!file) {
        return res.status(400).json({ error: 'Please upload an image or document file.' });
      }

      // Analyze bill using AI service
      const scanResult = await aiService.scanUtilityBill(file.buffer, file.mimetype);

      // Auto-log this as a residential electricity activity!
      const loggedActivity = await ActivityRepository.create({
        userId,
        date: scanResult.date || new Date().toISOString().split('T')[0],
        type: scanResult.units === 'Liters' ? 'water' : 'electricity',
        value: scanResult.consumption,
        carbonEmissions: scanResult.carbonEmissions,
        details: {
          source: 'grid',
          provider: scanResult.provider,
          scanned: true
        }
      });

      // Award Smart Scanner badge and green coins if not already awarded
      const user = await UserRepository.findById(userId);
      if (user) {
        const badges = [...(user.badges || [])];
        let coins = user.greenCoins || 0;
        let profileUpdated = false;

        if (!badges.includes('ocr_expert')) {
          badges.push('ocr_expert');
          coins += 100; // Bonus coins for first scan!
          profileUpdated = true;
        } else {
          coins += 25; // Standard scan coins reward
          profileUpdated = true;
        }

        if (profileUpdated) {
          await UserRepository.updateById(userId, { badges, greenCoins: coins });
        }
      }

      return res.status(201).json({
        message: 'Bill scanned and carbon activity logged successfully!',
        scanResult,
        activity: loggedActivity
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error parsing bill document.', message: error.message });
    }
  },

  async scanReceipt(req: AuthenticatedRequest, res: Response) {
    try {
      const file = req.file;
      const userId = req.userId!;

      if (!file) {
        return res.status(400).json({ error: 'Please upload a receipt image.' });
      }

      // Analyze receipt
      const scanResult = await aiService.scanReceipt(file.buffer, file.mimetype);

      // Auto-log shopping activity
      const loggedActivity = await ActivityRepository.create({
        userId,
        date: scanResult.date || new Date().toISOString().split('T')[0],
        type: 'shopping',
        value: scanResult.items.length, // use number of items as the value
        carbonEmissions: scanResult.totalCarbonEmissions,
        details: {
          merchant: scanResult.merchant,
          itemsCount: scanResult.items.length,
          scanned: true
        }
      });

      // Award Smart Scanner badge and green coins
      const user = await UserRepository.findById(userId);
      if (user) {
        const badges = [...(user.badges || [])];
        let coins = user.greenCoins || 0;
        let profileUpdated = false;

        if (!badges.includes('ocr_expert')) {
          badges.push('ocr_expert');
          coins += 100;
          profileUpdated = true;
        } else {
          coins += 25;
          profileUpdated = true;
        }

        if (profileUpdated) {
          await UserRepository.updateById(userId, { badges, greenCoins: coins });
        }
      }

      return res.status(201).json({
        message: 'Receipt scanned and carbon activity logged successfully!',
        scanResult,
        activity: loggedActivity
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error parsing receipt image.', message: error.message });
    }
  }
};
