import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Leaf,
  MessageSquare,
  TrendingUp,
  Coins,
  LogOut,
  Settings,
  Scan,
  Award,
  Menu,
  X,
  Sun,
  Moon,
  Zap
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Tracker', path: '/tracker', icon: Leaf },
  { name: 'AI Coach', path: '/coach', icon: Zap },
  { name: 'AI Chatbot', path: '/chatbot', icon: MessageSquare },
  { name: 'Scanner', path: '/scanner', icon: Scan },
  { name: 'Gamification', path: '/gamification', icon: Award },
  { name: 'Analytics', path: '/analytics', icon: TrendingUp },
  { name: 'Settings', path: '/settings', icon: Settings }
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For tablet collapsible
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false); // For mobile drawer

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* --- DESKTOP / TABLET SIDEBAR --- */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand Header */}
        <div className={`h-16 flex items-center border-b border-slate-200 dark:border-slate-800 transition-all duration-300 ${
          isSidebarOpen ? 'justify-between px-6' : 'justify-center px-4'
        }`}>
          {isSidebarOpen ? (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg text-emerald-600">
                  <Leaf className="h-5 w-5 shrink-0" />
                </div>
                <span className="font-semibold text-lg tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap">
                  CarbonWise <span className="text-blue-600 dark:text-blue-500 font-bold">AI</span>
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hidden lg:block p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                aria-label="Collapse Sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg text-emerald-600 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
              aria-label="Expand Sidebar"
            >
              <Leaf className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center rounded-lg text-sm font-medium transition-colors ${
                  isSidebarOpen
                    ? 'gap-4 px-4 py-2.5 w-full'
                    : 'justify-center p-2.5 mx-auto w-12 h-10'
                } ${
                  active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={!isSidebarOpen ? item.name : undefined}
              >
                {active && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-blue-50 dark:bg-blue-950/20 rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {isSidebarOpen && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User profile details & actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          {/* User Quick Info */}
          {isSidebarOpen && user && (
            <div className="px-2 py-1.5 flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-semibold truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Coins className="h-3 w-3 text-amber-500 shrink-0" />
                  <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold shrink-0">{user.greenCoins}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">|</span>
                  <Zap className="h-3 w-3 text-orange-500 shrink-0" />
                  <span className="text-[10px] text-orange-600 dark:text-orange-500 font-bold shrink-0">{user.streak}d</span>
                </div>
              </div>
            </div>
          )}

          {/* Theme & Logout Buttons */}
          <div className={`flex gap-2 w-full ${isSidebarOpen ? 'flex-row' : 'flex-col items-center'}`}>
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={toggleTheme}
              className={`rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all cursor-pointer ${
                isSidebarOpen ? 'flex-1 py-2' : 'w-10 h-10'
              }`}
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleLogout}
              className={`rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all cursor-pointer ${
                isSidebarOpen ? 'flex-1 py-2' : 'w-10 h-10'
              }`}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </aside>

      {/* --- MOBILE LAYOUT & MOBILE HEADER --- */}
      <header className="md:hidden h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg text-emerald-600">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-semibold text-md tracking-tight text-slate-800 dark:text-slate-100">
            CarbonWise <span className="text-blue-600 dark:text-blue-500">AI</span>
          </span>
        </div>

        {/* User stats & actions header */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-full text-xs">
              <div className="flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-bold text-amber-600 dark:text-amber-500">{user.greenCoins}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <div className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-orange-500" />
                <span className="font-bold text-orange-600 dark:text-orange-500">{user.streak}d</span>
              </div>
            </div>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label="Open Drawer"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsMobileDrawerOpen(false)}
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-80 max-w-[80vw] bg-white dark:bg-slate-950 h-full flex flex-col p-6 z-10 border-r border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-semibold text-lg text-slate-800 dark:text-slate-100">Menu</span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <nav className="flex-1 space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={`relative flex items-center gap-4 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                        active
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeNavIndicatorMobile"
                          className="absolute inset-0 bg-blue-50 dark:bg-blue-950/30 rounded-lg -z-10"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className={`h-5 w-5 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Actions */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm text-slate-500">Theme</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
                  </motion.button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-3 w-full py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-slate-200 dark:border-slate-800 font-medium cursor-pointer"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONTENT AREA & MOBILE BOTTOM NAV --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-0 h-[calc(100vh-4rem)] md:h-screen">
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 flex items-center justify-around z-40">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            isActive('/dashboard') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="h-5.5 w-5.5" />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/tracker"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            isActive('/tracker') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
          }`}
        >
          <Leaf className="h-5.5 w-5.5" />
          <span>Tracker</span>
        </Link>
        <Link
          to="/coach"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            isActive('/coach') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
          }`}
        >
          <Zap className="h-5.5 w-5.5" />
          <span>AI Coach</span>
        </Link>
        <Link
          to="/chatbot"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            isActive('/chatbot') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="h-5.5 w-5.5" />
          <span>Chat</span>
        </Link>
        <Link
          to="/scanner"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            isActive('/scanner') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
          }`}
        >
          <Scan className="h-5.5 w-5.5" />
          <span>Scan</span>
        </Link>
      </nav>

    </div>
  );
};
export default DashboardLayout;
