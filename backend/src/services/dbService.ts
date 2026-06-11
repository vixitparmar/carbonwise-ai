import { useMongo } from '../config/db';
export { useMongo };
import { UserModel } from '../models/User';
import { ActivityModel } from '../models/Activity';
import { GoalModel } from '../models/Goal';
import { ChatMessageModel } from '../models/ChatMessage';
import { fileDb } from './fileDb';
import mongoose from 'mongoose';

// Convert string to ObjectId if using MongoDB, otherwise return string
function toId(id: string) {
  if (useMongo && mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
}

export const UserRepository = {
  async findByEmail(email: string) {
    if (useMongo) {
      return await UserModel.findOne({ email }).lean();
    } else {
      return fileDb.findOne<any>('users', (u) => u.email === email);
    }
  },

  async findById(id: string) {
    if (useMongo) {
      return await UserModel.findById(id).lean();
    } else {
      return fileDb.findOne<any>('users', (u) => u._id === id);
    }
  },

  async create(userData: any) {
    if (useMongo) {
      const user = new UserModel(userData);
      const saved = await user.save();
      return saved.toObject();
    } else {
      return fileDb.insert<any>('users', userData);
    }
  },

  async updateById(id: string, updateData: any) {
    if (useMongo) {
      return await UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
    } else {
      return fileDb.update<any>('users', id, updateData);
    }
  }
};

export const ActivityRepository = {
  async create(activityData: any) {
    const data = {
      ...activityData,
      userId: toId(activityData.userId)
    };
    if (useMongo) {
      const activity = new ActivityModel(data);
      const saved = await activity.save();
      return saved.toObject();
    } else {
      return fileDb.insert<any>('activities', data);
    }
  },

  async findByUserId(userId: string) {
    if (useMongo) {
      return await ActivityModel.find({ userId: toId(userId) }).sort({ date: -1 }).lean();
    } else {
      return fileDb.find<any>('activities', (a) => a.userId === userId).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
  },

  async findByUserIdAndDateRange(userId: string, startDate: string, endDate: string) {
    if (useMongo) {
      return await ActivityModel.find({
        userId: toId(userId),
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 }).lean();
    } else {
      return fileDb.find<any>(
        'activities',
        (a) => a.userId === userId && a.date >= startDate && a.date <= endDate
      ).sort((a, b) => a.date.localeCompare(b.date));
    }
  },

  async deleteByIdAndUserId(id: string, userId: string) {
    if (useMongo) {
      const res = await ActivityModel.deleteOne({ _id: toId(id), userId: toId(userId) });
      return res.deletedCount > 0;
    } else {
      const activity = fileDb.findOne<any>('activities', (a) => a._id === id && a.userId === userId);
      if (activity) {
        return fileDb.delete('activities', id);
      }
      return false;
    }
  }
};

export const GoalRepository = {
  async create(goalData: any) {
    const data = {
      ...goalData,
      userId: toId(goalData.userId)
    };
    if (useMongo) {
      const goal = new GoalModel(data);
      const saved = await goal.save();
      return saved.toObject();
    } else {
      return fileDb.insert<any>('goals', data);
    }
  },

  async findByUserId(userId: string) {
    if (useMongo) {
      return await GoalModel.find({ userId: toId(userId) }).sort({ endDate: -1 }).lean();
    } else {
      return fileDb.find<any>('goals', (g) => g.userId === userId).sort(
        (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      );
    }
  },

  async updateByIdAndUserId(id: string, userId: string, updateData: any) {
    if (useMongo) {
      return await GoalModel.findOneAndUpdate(
        { _id: toId(id), userId: toId(userId) },
        { $set: updateData },
        { new: true }
      ).lean();
    } else {
      const goal = fileDb.findOne<any>('goals', (g) => g._id === id && g.userId === userId);
      if (goal) {
        return fileDb.update<any>('goals', id, updateData);
      }
      return null;
    }
  }
};

export const ChatRepository = {
  async create(messageData: any) {
    const data = {
      ...messageData,
      userId: toId(messageData.userId)
    };
    if (useMongo) {
      const msg = new ChatMessageModel(data);
      const saved = await msg.save();
      return saved.toObject();
    } else {
      return fileDb.insert<any>('chatMessages', data);
    }
  },

  async findByUserId(userId: string, limit = 50) {
    if (useMongo) {
      return await ChatMessageModel.find({ userId: toId(userId) })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .then((msgs) => msgs.reverse());
    } else {
      const msgs = fileDb.find<any>('chatMessages', (m) => m.userId === userId);
      return msgs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
        .reverse();
    }
  },

  async clearHistoryByUserId(userId: string) {
    if (useMongo) {
      await ChatMessageModel.deleteMany({ userId: toId(userId) });
      return true;
    } else {
      const data = fileDb.read();
      data.chatMessages = data.chatMessages.filter((m) => m.userId !== userId);
      fileDb.write(data);
      return true;
    }
  }
};

export const ChallengeRepository = {
  async listAll() {
    return fileDb.find<any>('challenges');
  }
};
