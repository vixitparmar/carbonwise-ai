export interface User {
  id: string;
  name: string;
  email: string;
  carbonGoal: number;
  greenCoins: number;
  streak: number;
  badges: string[];
  createdAt?: string;
}

export interface Activity {
  _id: string;
  id?: string;
  userId: string;
  date: string;
  type: 'travel' | 'food' | 'electricity' | 'shopping' | 'waste' | 'water' | 'flight' | 'public_transport' | 'cycling' | 'walking';
  value: number;
  carbonEmissions: number;
  details?: Record<string, any>;
  createdAt?: string;
}

export interface Goal {
  _id: string;
  id?: string;
  userId: string;
  type: 'weekly' | 'monthly';
  category: string;
  targetEmissions: number;
  currentEmissions: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'achieved' | 'failed';
}

export interface ChatMessage {
  _id: string;
  id?: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface DashboardStats {
  metrics: {
    todayCarbon: number;
    weeklyCarbon: number;
    monthlyCarbon: number;
    carbonGoal: number;
    carbonScore: number;
    prediction: number;
  };
  breakdown: Record<string, number>;
  streak: number;
  greenCoins: number;
  badgesCount: number;
}

export interface Challenge {
  _id: string;
  id?: string;
  title: string;
  description: string;
  coinsReward: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export interface CoachingReport {
  mainSources: Array<{ category: string; percentage: number; explanation: string }>;
  recommendations: Array<{ action: string; impact: 'High' | 'Medium' | 'Low'; co2Savings: number; timeframe: string; why: string }>;
  monthlyGoals: Array<{ title: string; category: string; target: number }>;
  forecast: string;
}
