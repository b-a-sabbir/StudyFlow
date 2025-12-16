import React, { useState, useEffect, useMemo } from 'react';
import { AppData, Task, Session } from '../types';
import { Analytics } from './Analytics';
import { ArrowLeftIcon, PlayIcon, PauseIcon, EditIcon, CheckIcon } from './Icons';

interface TaskDetailsProps {
  task: Task;
  data: AppData;
  activeSession: Session | undefined;
  onBack: () => void;
  onStartSession: (task: Task) => void;
  onStopSession: () => void;
  onRenameTask: (taskId: string, newName: string) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  data,
  activeSession,
  onBack,
  onStartSession,
  onStopSession,
  onRenameTask
}) => {
  const category = data.categories.find(c => c.id === task.categoryId);
  const isActive = activeSession?.taskId === task.id;

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  
  // Force update for timer
  const [, setTick] = useState(0);

  useEffect(() => {
     if (isActive) {
         const id = setInterval(() => setTick(t => t + 1), 1000);
         return () => clearInterval(id);
     }
  }, [isActive]);

  // Sync when task prop changes
  useEffect(() => {
    setEditName(task.name);
  }, [task.name]);

  const handleSaveRename = () => {
    if (editName.trim()) {
        onRenameTask(task.id, editName.trim());
        setIsEditing(false);
    }
  };

  // Calculate total stats
  const taskSessions = data.sessions.filter(s => s.taskId === task.id);

  const totalSeconds = taskSessions.reduce((acc, curr) => {
    let dur = curr.durationSeconds;
    if (activeSession && activeSession.id === curr.id) {
        dur = Math.floor((Date.now() - curr.startTime) / 1000);
    }
    return acc + dur;
  }, 0);

  // Group History by Day
  const historyByDay = useMemo(() => {
    const groups: Record<number, { date: number, duration: number, isToday: boolean }> = {};
    const todayStr = new Date().toDateString();

    taskSessions.forEach(s => {
        // Normalize to start of day
        const d = new Date(s.startTime);
        d.setHours(0,0,0,0);
        const dayKey = d.getTime();
        
        let dur = s.durationSeconds;
        // Add live duration if this session is active
        if (activeSession && activeSession.id === s.id) {
             dur = Math.floor((Date.now() - s.startTime) / 1000);
        }

        if (!groups[dayKey]) {
            groups[dayKey] = {
                date: dayKey,
                duration: 0,
                isToday: new Date(dayKey).toDateString() === todayStr
            };
        }
        groups[dayKey].duration += dur;
    });

    return Object.values(groups).sort((a, b) => b.date - a.date);
  }, [taskSessions, activeSession]); // Re-calculate when active session updates

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatHistoryDate = (ts: number, isToday: boolean) => {
    if (isToday) return 'Today';
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', weekday: 'short'
    });
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300 max-w-4xl mx-auto w-full">
      {/* App Bar */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <ArrowLeftIcon />
        </button>
        <div className="flex-1">
          {isEditing ? (
              <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-1 rounded-lg text-lg font-bold outline-none border border-transparent focus:border-indigo-500 w-full"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename();
                    }}
                  />
                  <button 
                    onClick={handleSaveRename}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckIcon />
                  </button>
              </div>
          ) : (
              <div className="group flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-none truncate max-w-[200px] sm:max-w-md">
                      {task.name}
                  </h2>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full"
                    aria-label="Rename Task"
                  >
                      <EditIcon className="w-4 h-4" />
                  </button>
              </div>
          )}
          
          {!isEditing && (
            <span 
                className="text-xs font-semibold mt-1 inline-block"
                style={{ color: category?.color }}
            >
                {category?.name}
            </span>
          )}
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Focus Time</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
            {formatDuration(totalSeconds)}
          </p>
        </div>
        <button
          onClick={() => isActive ? onStopSession() : onStartSession(task)}
          className={`
            w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
            ${isActive 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
            }
          `}
        >
          {isActive ? <PauseIcon /> : <PlayIcon className="ml-1" />}
        </button>
      </div>

      {/* Analytics Chart */}
      <div className="mb-6 h-[400px]">
        <Analytics data={data} taskId={task.id} />
      </div>

      {/* History List (Grouped by Day) */}
      <div className="flex-1 pb-10">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Daily History</h3>
        {historyByDay.length === 0 ? (
          <div className="text-center py-8 text-slate-400 italic">No study sessions yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {historyByDay.map(dayItem => (
              <div 
                key={dayItem.date}
                className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm"
              >
                <div>
                  <div className={`text-sm font-medium ${dayItem.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {formatHistoryDate(dayItem.date, dayItem.isToday)}
                  </div>
                  {dayItem.isToday && isActive && (
                     <span className="text-[10px] uppercase font-bold text-indigo-500 animate-pulse">Running</span>
                  )}
                </div>
                <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                  {formatDuration(dayItem.duration)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};