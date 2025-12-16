import React from 'react';
import { HomeIcon, BarChartIcon, MoonIcon, SunIcon } from './Icons';

interface SidebarProps {
  currentView: 'dashboard' | 'analytics';
  setCurrentView: (view: 'dashboard' | 'analytics') => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView, 
  isDarkMode, 
  setIsDarkMode 
}) => {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          StudyFlow
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Professional Tracker</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            currentView === 'dashboard'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <HomeIcon />
          <span>Tasks</span>
        </button>
        <button
          onClick={() => setCurrentView('analytics')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            currentView === 'analytics'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <BarChartIcon />
          <span>Analytics</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
          <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
};