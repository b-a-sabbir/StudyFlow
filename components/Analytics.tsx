import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { AppData } from '../types';

interface AnalyticsProps {
  data: AppData;
  taskId?: string; // Optional: if provided, filters data for specific task
}

type ViewMode = 'weekly' | 'monthly';

export const Analytics: React.FC<AnalyticsProps> = ({ data, taskId }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  const { chartData, taskBreakdown } = useMemo(() => {
    const now = new Date();
    const daysToLookBack = viewMode === 'weekly' ? 7 : 30;
    
    // 1. Generate empty buckets for the date range
    const buckets: Record<number, Record<string, number>> = {};
    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const ts = d.getTime();
      
      const dayData: Record<string, number> = { date: ts };
      
      // Initialize Tasks as 0 (We now track Tasks in the chart, not Categories)
      data.tasks.forEach(t => {
        dayData[t.id] = 0;
      });
      buckets[ts] = dayData;
    }

    // 2. Filter sessions for the specific time range
    const rangeStart = new Date(now);
    rangeStart.setDate(rangeStart.getDate() - daysToLookBack);
    rangeStart.setHours(0,0,0,0);

    let relevantSessions = data.sessions.filter(s => s.startTime >= rangeStart.getTime());

    // Filter by specific task if we are in Task Details view
    if (taskId) {
      relevantSessions = relevantSessions.filter(s => s.taskId === taskId);
    }

    // 3. Process data for Chart and for Breakdown
    const breakdown: Record<string, number> = {}; // { taskId: totalSeconds }

    relevantSessions.forEach(session => {
      // Calculate duration
      let duration = session.durationSeconds;
      if (session.endTime === null) {
        duration = Math.floor((Date.now() - session.startTime) / 1000);
      }

      // Add to Chart Data (Buckets) - USING TASK ID
      const sessionDate = new Date(session.startTime).setHours(0, 0, 0, 0);
      if (buckets[sessionDate]) {
        if (buckets[sessionDate][session.taskId] !== undefined) {
             buckets[sessionDate][session.taskId] += (duration / 3600);
        } else {
             // Fallback if task was deleted but session exists
             buckets[sessionDate][session.taskId] = (duration / 3600);
        }
      }

      // Add to Breakdown Data
      if (!breakdown[session.taskId]) {
        breakdown[session.taskId] = 0;
      }
      breakdown[session.taskId] += duration;
    });

    const finalChartData = Object.values(buckets).map(bucket => ({
      ...bucket,
      label: new Date(bucket.date).toLocaleDateString(undefined, {
         weekday: viewMode === 'weekly' ? 'short' : undefined,
         month: 'numeric', 
         day: 'numeric' 
      }),
    }));

    // Convert breakdown to array
    const breakdownList = Object.entries(breakdown)
        .map(([tid, seconds]) => ({
            taskId: tid,
            totalSeconds: seconds
        }))
        .sort((a, b) => b.totalSeconds - a.totalSeconds);

    return { chartData: finalChartData, taskBreakdown: breakdownList };
  }, [data, viewMode, taskId]);

  // Determine which lines to draw (Tasks)
  const linesToDraw = useMemo(() => {
    if (taskId) {
      // Single task view
      const task = data.tasks.find(t => t.id === taskId);
      return task ? [task] : [];
    }
    // Global view: Draw all tasks that have data or just all tasks
    return data.tasks;
  }, [data, taskId]);

  const getTaskColor = (tid: string) => {
      const task = data.tasks.find(t => t.id === tid);
      if (!task) return '#ccc';
      const cat = data.categories.find(c => c.id === task.categoryId);
      return cat ? cat.color : '#ccc';
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col gap-6 h-full">
        {/* Chart Section */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[350px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {taskId ? 'Task Trends' : 'Overall Performance'}
                </h2>
                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                <button
                    onClick={() => setViewMode('weekly')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === 'weekly'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    Week
                </button>
                <button
                    onClick={() => setViewMode('monthly')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === 'monthly'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    Month
                </button>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                        dataKey="label" 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dy={10}
                        interval="preserveStartEnd" 
                        minTickGap={10}
                    />
                    <YAxis 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `${value.toFixed(1)}h`}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />
                    {linesToDraw.map((task) => {
                        const color = getTaskColor(task.id);
                        return (
                        <Line
                            key={task.id}
                            type="monotone"
                            dataKey={task.id}
                            name={task.name}
                            stroke={color}
                            strokeWidth={3}
                            dot={{ r: 3, strokeWidth: 0, fill: color }}
                            activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                    )})}
                </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Breakdown Section */}
        {!taskId && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                    Task Breakdown ({viewMode === 'weekly' ? 'Weekly' : 'Monthly'})
                </h3>
                <div className="space-y-3">
                    {taskBreakdown.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">No data for this period.</p>
                    ) : (
                        taskBreakdown.map(item => {
                            const task = data.tasks.find(t => t.id === item.taskId);
                            if (!task) return null;
                            const category = data.categories.find(c => c.id === task.categoryId);
                            const maxVal = taskBreakdown[0].totalSeconds;
                            const percent = (item.totalSeconds / maxVal) * 100;

                            return (
                                <div key={item.taskId} className="flex items-center gap-3">
                                    <div 
                                        className="w-1 rounded-full h-8 flex-shrink-0"
                                        style={{ backgroundColor: category?.color }}
                                    ></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{task.name}</span>
                                            <span className="font-mono text-slate-500 dark:text-slate-400">{formatDuration(item.totalSeconds)}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className="h-full rounded-full opacity-80"
                                                style={{ width: `${percent}%`, backgroundColor: category?.color }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        )}
    </div>
  );
};