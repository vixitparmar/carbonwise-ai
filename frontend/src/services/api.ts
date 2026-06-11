import axios from 'axios';
import { calculateCarbon } from '../utils/carbonCalculator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Dummy fallback data generator for offline/closed API server
const getMockData = (url: string, method: string, data?: any): any => {
  const cleanUrl = url.replace(API_URL, '').split('?')[0];
  console.warn(`📡 [API OFFLINE FALLBACK] Serving mock data for: ${method.toUpperCase()} ${cleanUrl}`);

  const getStoredUser = () => {
    const stored = localStorage.getItem('user');
    if (stored) return JSON.parse(stored);
    const defaultUser = {
      id: 'dummy-id',
      name: 'Vixit (Offline)',
      email: 'guest@example.com',
      carbonGoal: 500,
      greenCoins: 120,
      streak: 5,
      badges: ['Eco Warrior', 'Streak Star']
    };
    localStorage.setItem('user', JSON.stringify(defaultUser));
    return defaultUser;
  };

  const getStoredActivities = () => {
    const stored = localStorage.getItem('mock_activities');
    if (stored) return JSON.parse(stored);
    const defaultActivities = [
      {
        _id: "act-1",
        id: "act-1",
        userId: "dummy-id",
        category: "Transit",
        type: "travel",
        value: 32,
        carbonEmissions: 6.4,
        date: new Date().toISOString().split('T')[0],
        details: {
          vehicleType: "Petrol car",
          distance: 32,
          distanceUnit: "mi"
        }
      },
      {
        _id: "act-2",
        id: "act-2",
        userId: "dummy-id",
        category: "Electricity",
        type: "electricity",
        value: 205,
        carbonEmissions: 92.25,
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        details: {
          kwh: 205
        }
      }
    ];
    localStorage.setItem('mock_activities', JSON.stringify(defaultActivities));
    return defaultActivities;
  };

  const saveActivities = (activities: any[]) => {
    localStorage.setItem('mock_activities', JSON.stringify(activities));
  };

  const getStoredGoals = () => {
    const stored = localStorage.getItem('mock_goals');
    if (stored) return JSON.parse(stored);
    const defaultGoals = [
      { 
        _id: "goal-1", 
        userId: "dummy-id", 
        type: "weekly", 
        category: "travel", 
        targetEmissions: 50, 
        currentEmissions: 6.4, 
        startDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
        status: "active" 
      },
      { 
        _id: "goal-2", 
        userId: "dummy-id", 
        type: "monthly", 
        category: "electricity", 
        targetEmissions: 150, 
        currentEmissions: 92.25, 
        startDate: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        status: "active" 
      }
    ];
    localStorage.setItem('mock_goals', JSON.stringify(defaultGoals));
    return defaultGoals;
  };

  const saveGoals = (goals: any[]) => {
    localStorage.setItem('mock_goals', JSON.stringify(goals));
  };

  const getStoredChatHistory = () => {
    const stored = localStorage.getItem('mock_chat_history');
    if (stored) return JSON.parse(stored);
    const defaultHistory = [
      { _id: "chat-1", userId: "dummy-id", role: "user", content: "How can I reduce carbon footprint?", createdAt: new Date().toISOString() },
      { _id: "chat-2", userId: "dummy-id", role: "assistant", content: "You can start by driving less, eating more plant-based meals, and using energy-efficient appliances.", createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('mock_chat_history', JSON.stringify(defaultHistory));
    return defaultHistory;
  };

  const saveChatHistory = (history: any[]) => {
    localStorage.setItem('mock_chat_history', JSON.stringify(history));
  };

  // Auth endpoints
  if (cleanUrl.includes('/auth/login')) {
    const email = data?.email || 'guest@example.com';
    const user = {
      id: 'dummy-id',
      name: 'Vixit (Offline)',
      email: email,
      carbonGoal: 500,
      greenCoins: 120,
      streak: 5,
      badges: ['Eco Warrior', 'Streak Star']
    };
    localStorage.setItem('user', JSON.stringify(user));
    return { token: 'dummy-jwt-token', user };
  }

  if (cleanUrl.includes('/auth/register')) {
    const email = data?.email || 'guest@example.com';
    const name = data?.name || 'Vixit (Offline)';
    const user = {
      id: 'dummy-id',
      name: name,
      email: email,
      carbonGoal: 500,
      greenCoins: 0,
      streak: 0,
      badges: []
    };
    localStorage.setItem('user', JSON.stringify(user));
    return { token: 'dummy-jwt-token', user };
  }

  if (cleanUrl.includes('/auth/profile')) {
    if (method.toLowerCase() === 'put') {
      const updatedUser = { ...getStoredUser(), ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    }
    return getStoredUser();
  }

  // Activities endpoints
  if (cleanUrl.includes('/activities/stats')) {
    const activities = getStoredActivities();
    const user = getStoredUser();

    // calculate today's emissions
    const todayStr = new Date().toISOString().split('T')[0];
    const todayActivities = activities.filter((a: any) => a.date === todayStr);
    const todayCarbon = parseFloat(todayActivities.reduce((sum: number, a: any) => sum + (a.carbonEmissions || 0), 0).toFixed(1));

    // calculate weekly emissions (past 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyActivities = activities.filter((a: any) => new Date(a.date) >= sevenDaysAgo);
    const weeklyCarbon = parseFloat(weeklyActivities.reduce((sum: number, a: any) => sum + (a.carbonEmissions || 0), 0).toFixed(1));

    // calculate monthly emissions (current month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyActivities = activities.filter((a: any) => {
      const d = new Date(a.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthlyCarbon = parseFloat(monthlyActivities.reduce((sum: number, a: any) => sum + (a.carbonEmissions || 0), 0).toFixed(1));

    // category breakdown
    const breakdown: Record<string, number> = {
      travel: 0,
      food: 0,
      electricity: 0,
      shopping: 0,
      waste: 0,
      water: 0,
      flight: 0,
      public_transport: 0
    };
    activities.forEach((a: any) => {
      const cat = a.type || 'travel';
      if (breakdown[cat] !== undefined) {
        breakdown[cat] += a.carbonEmissions || 0;
      } else {
        breakdown[cat] = a.carbonEmissions || 0;
      }
    });

    // Make sure float precision
    Object.keys(breakdown).forEach(k => {
      breakdown[k] = parseFloat(breakdown[k].toFixed(1));
    });

    const carbonScore = Math.max(10, Math.min(100, 100 - Math.round(todayCarbon * 0.5 + (weeklyCarbon / 7) * 2)));

    return {
      metrics: {
        todayCarbon,
        weeklyCarbon,
        monthlyCarbon,
        carbonGoal: user.carbonGoal || 500,
        carbonScore,
        prediction: parseFloat((monthlyCarbon * 1.1 + 15).toFixed(1))
      },
      breakdown,
      streak: user.streak || 5,
      greenCoins: user.greenCoins || 120,
      badgesCount: user.badges?.length || 2
    };
  }

  if (cleanUrl.includes('/activities')) {
    const activities = getStoredActivities();

    // If DELETE request (e.g. /activities/act-123)
    if (method.toLowerCase() === 'delete') {
      const parts = cleanUrl.split('/');
      const id = parts[parts.length - 1];
      const filtered = activities.filter((a: any) => a._id !== id && a.id !== id);
      saveActivities(filtered);
      return { success: true };
    }

    // If POST request
    if (method.toLowerCase() === 'post') {
      // Calculate carbon emissions dynamically using the frontend calculator
      const computedCarbon = calculateCarbon({
        type: data.type || 'travel',
        value: Number(data.value || 0),
        details: data.details || {}
      });

      const newActivity = {
        _id: 'act-' + Date.now(),
        id: 'act-' + Date.now(),
        userId: 'dummy-id',
        date: data.date || new Date().toISOString().split('T')[0],
        type: data.type || 'travel',
        value: Number(data.value || 0),
        carbonEmissions: parseFloat(computedCarbon.toFixed(2)),
        details: data.details || {},
        createdAt: new Date().toISOString()
      };

      const updated = [newActivity, ...activities];
      saveActivities(updated);

      // Award Green Coins for logging or doing eco actions
      const user = getStoredUser();
      let coinsEarned = 10;
      if (data.type === 'cycling' || data.type === 'walking') {
        coinsEarned = 20;
      }
      const updatedUser = {
        ...user,
        greenCoins: user.greenCoins + coinsEarned,
        streak: user.streak + (todayLogged(updated) ? 0 : 1) // simple streak builder
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return newActivity;
    }

    // Default GET request
    return activities;
  }

  // Goals endpoints
  if (cleanUrl.includes('/goals')) {
    const goals = getStoredGoals();
    const activities = getStoredActivities();

    if (method.toLowerCase() === 'post') {
      const newGoal = {
        _id: 'goal-' + Date.now(),
        id: 'goal-' + Date.now(),
        userId: 'dummy-id',
        type: data.type || 'weekly',
        category: data.category || 'all',
        targetEmissions: Number(data.targetEmissions || 100),
        currentEmissions: 0,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'active'
      };
      const updated = [newGoal, ...goals];
      saveGoals(updated);
      return newGoal;
    }

    // For GET: recalculate currentEmissions for all active goals
    const updatedGoals = goals.map((g: any) => {
      const start = new Date(g.startDate);
      const end = new Date(g.endDate);
      const goalActivities = activities.filter((a: any) => {
        const actDate = new Date(a.date);
        const inRange = actDate >= start && actDate <= end;
        if (!inRange) return false;
        if (g.category === 'all' || !g.category) return true;
        return a.type === g.category;
      });
      const currentEmissions = parseFloat(goalActivities.reduce((sum: number, a: any) => sum + (a.carbonEmissions || 0), 0).toFixed(1));
      const status = currentEmissions > g.targetEmissions ? 'failed' : (new Date() > end ? 'achieved' : 'active');
      return { ...g, currentEmissions, status };
    });
    saveGoals(updatedGoals);
    return updatedGoals;
  }

  // Helper to check if user already logged an activity today
  function todayLogged(acts: any[]) {
    const todayStr = new Date().toISOString().split('T')[0];
    return acts.some(a => a.date === todayStr);
  }

  // AI endpoints
  if (cleanUrl.includes('/ai/coach-report')) {
    const stats: any = getMockData(API_URL + '/activities/stats', 'GET');
    const breakdownEntries: any = Object.entries(stats.breakdown).map(([category, co2]) => {
      const total = stats.metrics.monthlyCarbon || 1;
      return {
        category,
        percentage: Math.round(((co2 as number) / total) * 100),
        explanation: `${category} emissions contribute ${co2} kg CO2 to your monthly total.`
      };
    }).sort((a: any, b: any) => b.percentage - a.percentage);

    return {
      mainSources: breakdownEntries.slice(0, 3),
      recommendations: [
        { action: "Unplug standby home appliances", impact: "Medium", co2Savings: 8.5, timeframe: "This week", why: "Standby electricity accounts for ~5% of domestic power draw." },
        { action: "Walk or bike for short trips under 3km", impact: "High", co2Savings: 18.0, timeframe: "Ongoing", why: "Saves gasoline emissions and earns double green coins." },
        { action: "Implement meatless Mondays", impact: "High", co2Savings: 12.0, timeframe: "Immediate", why: "Vegan and vegetarian meals produce up to 80% less emissions than red meat." }
      ],
      monthlyGoals: [
        { title: "Keep transport emissions below 40 kg", category: "travel", target: 40 },
        { title: "Reduce utility emissions by 10%", category: "electricity", target: 80 }
      ],
      forecast: "Based on your current activity rate, you are on track to beat your carbon budget by 12% this month. Keep up the great work!"
    };
  }

  if (cleanUrl.includes('/ai/chat/history')) {
    const history = getStoredChatHistory();
    if (method.toLowerCase() === 'delete') {
      saveChatHistory([]);
      return { success: true };
    }
    return history;
  }

  if (cleanUrl.includes('/ai/chat')) {
    const history = getStoredChatHistory();
    const userMsg = {
      _id: 'chat-' + Date.now(),
      userId: 'dummy-id',
      role: 'user',
      content: data?.message || '',
      createdAt: new Date().toISOString()
    };

    const replyContent = `I am running in offline AI Coach mode. To address your question about "${data?.message || 'sustainability'}", try focusing on reducing home electricity use and optimizing your commutes. Every small choice contributes to your carbon goals!`;
    const assistantMsg = {
      _id: 'chat-' + (Date.now() + 1),
      userId: 'dummy-id',
      role: 'assistant',
      content: replyContent,
      createdAt: new Date().toISOString()
    };

    saveChatHistory([...history, userMsg, assistantMsg]);
    return assistantMsg;
  }

  if (cleanUrl.includes('/ai/scan-bill') || cleanUrl.includes('/ai/scan-receipt')) {
    // OCR Bill scan simulated response
    // Add to activities list automatically!
    const activities = getStoredActivities();
    const newActivity = {
      _id: 'act-' + Date.now(),
      id: 'act-' + Date.now(),
      userId: 'dummy-id',
      date: new Date().toISOString().split('T')[0],
      type: 'electricity',
      value: 120,
      carbonEmissions: 54, // 120 kwh * 0.45 = 54kg
      details: {
        kwh: 120,
        cost: 65,
        source: 'Gemini OCR Fallback'
      },
      createdAt: new Date().toISOString()
    };
    saveActivities([newActivity, ...activities]);

    return {
      success: true,
      co2Emissions: 54,
      details: {
        kwh: 120,
        cost: 65,
        source: "Gemini OCR Fallback"
      }
    };
  }

  // Gamification endpoints
  if (cleanUrl.includes('/gamification/challenges')) {
    return [
      { _id: "chal-1", id: "chal-1", title: "No-Car Day", description: "Commute without a car for one whole day.", coinsReward: 50, category: "travel", difficulty: "Easy" },
      { _id: "chal-2", id: "chal-2", title: "Veggies Day", description: "Eat vegetarian meals for three consecutive days.", coinsReward: 80, category: "food", difficulty: "Easy" },
      { _id: "chal-3", id: "chal-3", title: "Energy Saver", description: "Keep electricity usage below 10kWh today.", coinsReward: 100, category: "electricity", difficulty: "Medium" }
    ];
  }

  if (cleanUrl.includes('/gamification/claim')) {
    const user = getStoredUser();
    const coinsClaimed = Number(data?.coins || 50);
    const newTotal = user.greenCoins + coinsClaimed;
    localStorage.setItem('user', JSON.stringify({ ...user, greenCoins: newTotal }));
    return { success: true, coinsClaimed, newTotalCoins: newTotal };
  }

  if (cleanUrl.includes('/gamification/leaderboard')) {
    return [
      { rank: 1, name: "Emma Watson", coins: 450, avatar: "E" },
      { rank: 2, name: getStoredUser().name, coins: getStoredUser().greenCoins, avatar: getStoredUser().name.charAt(0) },
      { rank: 3, name: "John Doe", coins: 90, avatar: "J" }
    ];
  }

  if (cleanUrl.includes('/gamification/badges')) {
    return [
      { id: "badge-1", name: "Eco Warrior", description: "Log your first 5 activities", earned: true, icon: "Shield" },
      { id: "badge-2", name: "Streak Star", description: "Maintain a 5-day logging streak", earned: true, icon: "Flame" },
      { id: "badge-3", name: "Zero Hero", description: "Achieve 0 emissions for a day", earned: false, icon: "Award" }
    ];
  }

  return {};
};

// Handle expired token responses & offline mock fallbacks
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError =
      error.message === 'Network Error' ||
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.response.status === 502 ||
      error.response.status === 503 ||
      error.response.status === 504;

    if (isNetworkError && error.config) {
      try {
        const parsedData = error.config.data ? JSON.parse(error.config.data) : {};
        const mockResponse = getMockData(error.config.url || '', error.config.method || 'GET', parsedData);
        return Promise.resolve({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      } catch (err) {
        const mockResponse = getMockData(error.config.url || '', error.config.method || 'GET', {});
        return Promise.resolve({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      }
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
