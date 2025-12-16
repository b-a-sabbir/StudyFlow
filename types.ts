export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  categoryId: string;
  name: string;
}

export interface Session {
  id: string;
  taskId: string;
  categoryId: string;
  startTime: number;
  endTime: number | null;
  durationSeconds: number;
  date: number; // Start of day timestamp for aggregation
}

export interface AppData {
  categories: Category[];
  tasks: Task[];
  sessions: Session[];
}
