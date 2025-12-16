import React from 'react';
import { AppData, Task, Category, Session } from '../types';
import { PlayIcon, PauseIcon } from './Icons';

interface TaskDashboardProps {
  data: AppData;
  activeSession: Session | undefined;
  onStartSession: (task: Task) => void;
  onStopSession: () => void;
  onSelectTask: (task: Task) => void;
}

export const TaskDashboard: React.FC<TaskDashboardProps> = ({ 
  data, 
  activeSession, 
  onStartSession, 
  onStopSession,
  onSelectTask
}) => {
  
  const getCategory = (id: string): Category | undefined => 
    data.categories.find(c => c.id === id);

  // Helper to get duration stats
  const getTaskStats = (task: Task) => {
    const now = Date.now();
    const startOfToday = new Date().setHours(0,0,0,0);

    let totalSeconds = 0;
    let todaySeconds = 0;

    data.sessions
      .filter(s => s.taskId === task.id)
      .forEach(s => {
        let dur = s.durationSeconds;
        // If this is the active session, calculate live duration
        if (activeSession && activeSession.id === s.id) {
            dur = Math.floor((now - s.startTime) / 1000);
        }

        totalSeconds += dur;

        // Check if session belongs to today
        // We compare the session start time to today's midnight timestamp
        if (s.startTime >= startOfToday) {
            todaySeconds += dur;
        }
      });
      
    return { totalSeconds, todaySeconds };
  };

  const formatTimeSimple = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h === 0 && m === 0) return '0m';
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-4 pb-24 md:pb-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Your Tasks</h2>
      </div>
      
      {/* Responsive Grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.tasks.map((task) => {
          const category = getCategory(task.categoryId);
          const isActive = activeSession?.taskId === task.id;
          const stats = getTaskStats(task);

          return (
            <div 
              key={task.id} 
              className={`
                relative overflow-hidden group p-5 rounded-2xl transition-all duration-300
                bg-white dark:bg-slate-800 border 
                ${isActive 
                  ? 'border-blue-500 shadow-lg ring-1 ring-blue-500 transform scale-[1.01]' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md'
                }
              `}
            >
              {isActive && (
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 animate-pulse"></div>
              )}

              <div className="flex justify-between items-start">
                {/* Clickable area for details */}
                <div 
                  className="flex-1 cursor-pointer pr-4"
                  onClick={() => onSelectTask(task)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase"
                      style={{ 
                        backgroundColor: `${category?.color}15`, 
                        color: category?.color 
                      }}
                    >
                      {category?.name}
                    </span>
                    {isActive && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 line-clamp-1" title={task.name}>
                    {task.name}
                  </h3>
                  
                  {/* Stats Grid */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg font-medium">
                        <span className="text-slate-500 dark:text-slate-400">Today</span>
                        <span className="text-sm">{formatTimeSimple(stats.todaySeconds)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 px-2 py-1.5">
                        <span>Total: {formatTimeSimple(stats.totalSeconds)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    isActive ? onStopSession() : onStartSession(task);
                  }}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shrink-0
                    ${isActive 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none shadow-lg'
                    }
                  `}
                >
                  {isActive ? <PauseIcon /> : <PlayIcon className="ml-1" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};