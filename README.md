# StudyFlow Tracker

StudyFlow Tracker is a professional, mobile-first productivity application designed to track study hours and task duration with precision. Built with **React 19**, **TypeScript**, and **Tailwind CSS**, it features real-time time tracking, advanced graphical analytics, and persistent local storage.

## 🚀 Features

- **Real-time Time Tracking**: stopwatch-style timer that persists state even when the browser is closed or refreshed (using timestamp delta calculations).
- **Task Management**: Create, categorize, and rename tasks.
- **Advanced Analytics**:
  - Interactive Line Charts (using `recharts`) showing performance trends.
  - Switchable Weekly and Monthly views.
  - "Top 5" Logic to focus on your most important work.
  - Detailed task breakdown with progress bars.
- **Categorization**: Tasks are organized by categories (e.g., General, Priority) with distinct color coding.
- **Dark Mode**: Fully supported system-aware dark theme.
- **Responsive Design**: optimized for both Desktop (sidebar layout) and Mobile (bottom navigation).
- **Offline Persistence**: All data is saved instantly to the browser's `localStorage`.

## 🛠️ Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Custom SVG Components
- **State Management**: React Hooks (`useState`, `useEffect`, `useMemo`)
- **Storage**: Browser LocalStorage API

## 📂 Project Structure

```
/
├── index.html              # Entry point
├── index.tsx               # React root
├── types.ts                # TypeScript interfaces (Task, Session, Category)
├── App.tsx                 # Main Application Layout & State Logic
├── services/
│   └── storage.ts          # LocalStorage CRUD operations & Time logic
├── components/
│   ├── ActiveTimer.tsx     # The floating/static active timer component
│   ├── Analytics.tsx       # Charting and Statistics logic
│   ├── Icons.tsx           # SVG Icon definitions
│   ├── Sidebar.tsx         # Desktop navigation
│   ├── TaskDashboard.tsx   # Main grid view of tasks
│   └── TaskDetails.tsx     # Specific task history and rename logic
└── metadata.json           # App metadata
```

## ⚡ Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Development Server**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

## 📖 Usage Guide

1.  **Adding a Task**: Click the Floating Action Button (+) (or the "Create Task" button on desktop) to add a new subject. Assign it a category color.
2.  **Starting a Session**: Click the "Play" button on any task card. The timer will start immediately.
    *   *Note*: Only one task can be active at a time. Starting a new task automatically pauses the previous one.
3.  **Viewing Analytics**: Navigate to the "Analytics" tab to see your study trends over the last 7 or 30 days.
4.  **Task Details**: Click on the body of a task card to view its specific history, total accumulated time, or to rename it.

## 🎨 Customization

To modify the default categories or colors, edit the `INITIAL_DATA` constant in `services/storage.ts`:

```typescript
const INITIAL_DATA: AppData = {
  categories: [
    { id: 'cat_1', name: 'Math', color: '#3b82f6' },
    { id: 'cat_2', name: 'Physics', color: '#ef4444' },
  ],
  // ...
};
```

## 🔒 Data Persistence

Data is stored in `localStorage` under the key `studyflow_data_v1`.
- **Sessions** use timestamps (`startTime`, `endTime`) rather than simple counters. This ensures that if you start a timer at 10:00 PM, close the app, and return at 10:30 PM, the timer correctly shows 30 minutes elapsed.

---

*Built for high-performance productivity.*
