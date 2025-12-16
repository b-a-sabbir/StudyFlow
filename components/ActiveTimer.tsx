import React, { useEffect, useState } from 'react';
import { Task, Category, Session } from '../types';
import { PauseIcon } from './Icons';
import * as db from '../services/storage';

interface ActiveTimerProps {
  session: Session;
  task: Task;
  category: Category;
  onStop: () => void;
}

export const ActiveTimer: React.FC<ActiveTimerProps> = ({ session, task, category, onStop }) => {
  const [elapsed, setElapsed] = useState(0);
  const [previousTodaySeconds, setPreviousTodaySeconds] = useState(0);

  useEffect(() => {
    // Calculate how much we already studied today BEFORE this session started
    const data = db.loadData();
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    
    const todayTotal = data.sessions
      .filter(s => s.taskId === task.id && s.id !== session.id && s.startTime >= startOfToday)
      .reduce((acc, curr) => acc + curr.durationSeconds, 0);
      
    setPreviousTodaySeconds(todayTotal);
  }, [task.id, session.id]);

  useEffect(() => {
    // Immediate update
    const update = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - session.startTime) / 1000));
    };
    update();

    // Interval update
    const intervalId = setInterval(update, 1000);
    return () => clearInterval(intervalId);
  }, [session.startTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  const formatTotalContext = (seconds: number) => {
     const h = Math.floor(seconds / 3600);
     const m = Math.floor((seconds % 3600) / 60);
     if (h === 0) return `${m}m`;
     return `${h}h ${m}m`;
  };

  const totalToday = previousTodaySeconds + elapsed;

  // Re-designed as a static block that fits into the layout
  return (
    <div className="w-full px-6 pt-4 pb-0 md:px-8">
      <div 
        className="w-full bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-xl p-4 flex items-center justify-between border-l-4 overflow-hidden relative"
        style={{ borderLeftColor: category.color }}
      >
        {/* Background glow effect based on category color */}
        <div 
            className="absolute right-0 top-0 w-32 h-32 blur-[60px] opacity-20 pointer-events-none"
            style={{ backgroundColor: category.color }}
        ></div>

        <div className="flex items-center gap-4 relative z-10">
           {/* Minimal circular indicator */}
           <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
              <div 
                className="absolute inset-0 rounded-full border-2 border-t-transparent border-l-transparent animate-spin"
                style={{ borderColor: `${category.color} transparent transparent transparent` }}
              ></div>
           </div>
           
           <div>
             <div className="font-bold text-lg leading-none flex items-center gap-2">
               {task.name}
               <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-normal">
                 {category.name}
               </span>
             </div>
             <div className="flex items-center gap-3 mt-1">
                 <div className="text-white text-xl font-mono tabular-nums font-bold tracking-tight">
                   {formatTime(elapsed)}
                 </div>
                 <div className="text-slate-400 text-xs border-l border-slate-700 pl-3">
                    Today: {formatTotalContext(totalToday)}
                 </div>
             </div>
           </div>
        </div>

        <button 
          onClick={onStop}
          className="relative z-10 bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors w-10 h-10 rounded-full flex items-center justify-center border border-white/10 shrink-0"
        >
          <PauseIcon />
        </button>
      </div>
    </div>
  );
};