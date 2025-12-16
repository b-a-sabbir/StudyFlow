import { AppData, Category, Task, Session } from '../types';

const STORAGE_KEY = 'studyflow_data_v1';

const INITIAL_DATA: AppData = {
  categories: [
    { id: 'cat_1', name: 'General', color: '#3b82f6' }, // Blue
    { id: 'cat_2', name: 'Priority', color: '#ef4444' }, // Red
  ],
  tasks: [
    { id: 'task_1', categoryId: 'cat_1', name: 'Study' },
    { id: 'task_2', categoryId: 'cat_2', name: 'Productivity' },
  ],
  sessions: [],
};

export const loadData = (): AppData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return INITIAL_DATA;
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getActiveSession = (sessions: Session[]): Session | undefined => {
  return sessions.find(s => s.endTime === null);
};

export const createSession = (taskId: string, categoryId: string): Session => {
  const now = Date.now();
  // Normalize to start of day for easier charting later
  const date = new Date(now).setHours(0, 0, 0, 0);
  return {
    id: `sess_${now}_${Math.random().toString(36).substr(2, 9)}`,
    taskId,
    categoryId,
    startTime: now,
    endTime: null,
    durationSeconds: 0,
    date,
  };
};

export const stopSession = (session: Session): Session => {
  const now = Date.now();
  const durationSeconds = Math.floor((now - session.startTime) / 1000);
  return {
    ...session,
    endTime: now,
    durationSeconds,
  };
};
