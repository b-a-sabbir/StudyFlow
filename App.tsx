import React, { useEffect, useState } from 'react';
import { AppData, Task, Session } from './types';
import * as db from './services/storage';
import { Analytics } from './components/Analytics';
import { TaskDashboard } from './components/TaskDashboard';
import { TaskDetails } from './components/TaskDetails';
import { ActiveTimer } from './components/ActiveTimer';
import { BarChartIcon, HomeIcon, MoonIcon, PlusIcon, SunIcon } from './components/Icons';
import { Sidebar } from './components/Sidebar';

type View = 'dashboard' | 'analytics';

function App() {
  const [data, setData] = useState<AppData>(db.loadData());
  const [activeSession, setActiveSession] = useState<Session | undefined>();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Add Task Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState(data.categories[0]?.id || '');

  // Initialize
  useEffect(() => {
    // Check dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
    
    // Sync data
    const active = db.getActiveSession(data.sessions);
    setActiveSession(active);
  }, []);

  // Effect to apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleStartSession = (task: Task) => {
    // Auto-pause if existing session
    let updatedSessions = [...data.sessions];
    if (activeSession) {
      const stopped = db.stopSession(activeSession);
      updatedSessions = updatedSessions.map(s => s.id === stopped.id ? stopped : s);
    }

    const newSession = db.createSession(task.id, task.categoryId);
    updatedSessions.push(newSession);

    const newData = { ...data, sessions: updatedSessions };
    setData(newData);
    db.saveData(newData);
    setActiveSession(newSession);
  };

  const handleStopSession = () => {
    if (!activeSession) return;
    const stopped = db.stopSession(activeSession);
    const updatedSessions = data.sessions.map(s => s.id === stopped.id ? stopped : s);
    
    const newData = { ...data, sessions: updatedSessions };
    setData(newData);
    db.saveData(newData);
    setActiveSession(undefined);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      name: newTaskName,
      categoryId: newTaskCategory
    };

    const newData = {
      ...data,
      tasks: [...data.tasks, newTask]
    };
    
    setData(newData);
    db.saveData(newData);
    setNewTaskName('');
    setIsAddModalOpen(false);
  };
  
  const handleRenameTask = (taskId: string, newName: string) => {
    const updatedTasks = data.tasks.map(t => 
        t.id === taskId ? { ...t, name: newName } : t
    );
    const newData = { ...data, tasks: updatedTasks };
    setData(newData);
    db.saveData(newData);
  };

  // Helper to get active task object
  const activeTask = activeSession 
    ? data.tasks.find(t => t.id === activeSession.taskId) 
    : undefined;
  
  const activeCategory = activeTask
    ? data.categories.find(c => c.id === activeTask.categoryId)
    : undefined;

  const selectedTask = selectedTaskId 
    ? data.tasks.find(t => t.id === selectedTaskId)
    : null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      
      {/* Desktop Wrapper: Sidebar + Main Content */}
      <div className="flex flex-row max-w-[1920px] mx-auto">
        
        {/* Sidebar (Desktop Only) */}
        <Sidebar 
          currentView={currentView} 
          setCurrentView={(view) => {
            setCurrentView(view);
            setSelectedTaskId(null); // Reset detail view when changing tabs
          }}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen bg-white dark:bg-slate-900 shadow-2xl relative flex flex-col max-w-full">
          
          {/* Header - Mobile Only (Hidden on Desktop) */}
          {!selectedTask && (
            <header className="md:hidden px-6 py-6 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-20 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  StudyFlow
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Professional Tracker</p>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
              </button>
            </header>
          )}

          {/* Desktop Header for Context (Optional, but good for spacing) */}
          <div className="hidden md:flex justify-between items-center px-8 py-6">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
               {selectedTask ? 'Task Details' : currentView}
             </h2>
             <div className="text-sm text-slate-500">
               {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric'})}
             </div>
          </div>
          
          {/* STATIC ACTIVE TIMER - Inserted in the flow */}
          {activeSession && activeTask && activeCategory && (
            <ActiveTimer 
              session={activeSession}
              task={activeTask}
              category={activeCategory}
              onStop={handleStopSession}
            />
          )}

          {/* Scrollable Content */}
          <main className={`flex-1 overflow-y-auto pb-32 ${selectedTask ? 'p-0 md:p-8' : 'p-6 md:p-8'}`}>
            {selectedTask ? (
              <div className="p-6 md:p-0">
                <TaskDetails 
                  task={selectedTask}
                  data={data}
                  activeSession={activeSession}
                  onBack={() => setSelectedTaskId(null)}
                  onStartSession={handleStartSession}
                  onStopSession={handleStopSession}
                  onRenameTask={handleRenameTask}
                />
              </div>
            ) : (
              currentView === 'dashboard' ? (
                <TaskDashboard 
                  data={data}
                  activeSession={activeSession}
                  onStartSession={handleStartSession}
                  onStopSession={handleStopSession}
                  onSelectTask={(task) => setSelectedTaskId(task.id)}
                />
              ) : (
                <Analytics data={data} />
              )
            )}
          </main>

          {/* FAB - Visible on Dashboard, Mobile and Desktop */}
          {currentView === 'dashboard' && !selectedTask && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center z-10 transition-transform hover:scale-110 active:scale-95"
            >
              <PlusIcon />
            </button>
          )}

          {/* Bottom Navigation - Mobile Only */}
          {!selectedTask && (
            <nav className="md:hidden fixed bottom-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 pb-safe">
              <div className="flex justify-around items-center h-16">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex flex-col items-center gap-1 w-full h-full justify-center ${
                    currentView === 'dashboard' 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <HomeIcon className={currentView === 'dashboard' ? 'stroke-[2.5px]' : ''} />
                  <span className="text-[10px] font-medium">Tasks</span>
                </button>
                <button 
                  onClick={() => setCurrentView('analytics')}
                  className={`flex flex-col items-center gap-1 w-full h-full justify-center ${
                    currentView === 'analytics' 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <BarChartIcon className={currentView === 'analytics' ? 'stroke-[2.5px]' : ''} />
                  <span className="text-[10px] font-medium">Analytics</span>
                </button>
              </div>
            </nav>
          )}

          {/* Add Task Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
              <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative z-10 animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">New Task</h2>
                <form onSubmit={handleAddTask}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Task Name</label>
                      <input 
                        type="text" 
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        placeholder="e.g. Linear Algebra"
                        className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Category</label>
                      <div className="grid grid-cols-3 gap-2">
                        {data.categories.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setNewTaskCategory(cat.id)}
                            className={`
                              px-2 py-2 rounded-lg text-sm font-medium border transition-all
                              ${newTaskCategory === cat.id 
                                ? 'border-transparent text-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }
                            `}
                            style={{ 
                              backgroundColor: newTaskCategory === cat.id ? cat.color : undefined,
                              borderColor: newTaskCategory === cat.id ? cat.color : undefined,
                              boxShadow: newTaskCategory === cat.id ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                            }}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button 
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={!newTaskName.trim()}
                      className="flex-1 px-4 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;