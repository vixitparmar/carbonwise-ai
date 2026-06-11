import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  carbonGoal: number;
  greenCoins: number;
  streak: number;
  badges: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const checkBackendAndInit = async () => {
      let isBackendRunning = false;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      try {
        await axios.get(`${apiUrl}/health`, { timeout: 3000 });
        isBackendRunning = true;
      } catch (err) {
        console.warn('📡 Backend is offline. Bypassing login to show mock dashboard directly.');
      }

      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (isBackendRunning) {
        if (storedToken && storedUser && storedToken !== 'dummy-jwt-token') {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          api.get('/auth/profile')
            .then((res) => {
              const freshUser: User = res.data;
              setUser(freshUser);
              localStorage.setItem('user', JSON.stringify(freshUser));
            })
            .catch(() => {
              logout();
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          logout();
          setLoading(false);
        }
      } else {
        const offlineUser: User = {
          id: 'dummy-id',
          name: 'Vixit (Offline)',
          email: 'guest@example.com',
          carbonGoal: 500,
          greenCoins: 120,
          streak: 5,
          badges: ['Eco Warrior', 'Streak Star']
        };
        setToken('dummy-jwt-token');
        setUser(offlineUser);
        localStorage.setItem('token', 'dummy-jwt-token');
        localStorage.setItem('user', JSON.stringify(offlineUser));
        setLoading(false);
      }
    };

    checkBackendAndInit();
  }, []);

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/profile');
      const freshUser: User = res.data;
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
