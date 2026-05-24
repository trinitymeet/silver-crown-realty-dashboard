'use client';

import React from 'react';
import { Task } from '@/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GanttChartProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, onTaskClick }) => {
  // Find date range for the chart
  const dates = tasks.flatMap(t => [
    new Date(t.planned.start),
    new Date(t.planned.end),
    new Date(t.actual.start),
    ...(t.actual.end !== 'Pending' ? [new Date(t.actual.end)] : [])
  ]);
  
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  // Add padding to dates
  minDate.setDate(minDate.getDate() - 2);
  maxDate.setDate(maxDate.getDate() + 5);
  
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const getPosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayDiff = (date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
    return (dayDiff / totalDays) * 100;
  };

  const getWidth = (start: string, end: string | 'Pending') => {
    const startDate = new Date(start);
    const endDate = end === 'Pending' ? new Date("2026-03-10") : new Date(end); // Default to current if pending
    const dayDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return (Math.max(dayDiff, 0.5) / totalDays) * 100; // Min width for visibility
  };

  return (
    <div className="w-full bg-slate-900/50 rounded-xl border border-slate-700 p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Project Timeline</h3>
        <div className="flex gap-4 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 bg-slate-600 rounded-full" />
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 bg-emerald-500 rounded-sm" />
            <span>Actual</span>
          </div>
        </div>
      </div>
      
      <div className="relative min-h-[120px] space-y-6 pt-2">
        {/* Date Headers */}
        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20 border-x border-slate-700">
            {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="h-full border-r border-slate-700" />
            ))}
        </div>

        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="relative cursor-pointer group/task"
            onClick={() => onTaskClick(task)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-300 truncate max-w-[150px] group-hover/task:text-blue-400 transition-colors">{task.activity}</span>
              <span className={twMerge(
                "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                task.performance === 'Advance' && "bg-emerald-500/20 text-emerald-400",
                task.performance === 'On-Time' && "bg-blue-500/20 text-blue-400",
                task.performance === 'Delayed' && "bg-rose-500/20 text-rose-400 animate-pulse-intense"
              )}>
                {task.performance}
              </span>
            </div>
            
            <div className="relative h-4 w-full bg-slate-800/50 rounded-full overflow-hidden">
              {/* Planned Bar (Thin/Gray) */}
              <div 
                className="absolute top-0 h-1 bg-slate-600/50 rounded-full transition-all duration-500"
                style={{ 
                  left: `${getPosition(task.baseline?.start || task.planned.start)}%`, 
                  width: `${getWidth(task.baseline?.start || task.planned.start, task.baseline?.end || task.planned.end)}%` 
                }}
              />
              
              {/* Actual Bar (Thick/Colored) */}
              <div 
                className={twMerge(
                  "absolute bottom-0 h-2.5 rounded-full transition-all duration-500 shadow-sm",
                  task.performance === 'Advance' && "bg-emerald-500 shadow-emerald-500/20",
                  task.performance === 'On-Time' && "bg-blue-500 shadow-blue-500/20",
                  task.performance === 'Delayed' && "bg-rose-500 shadow-rose-500/20"
                )}
                style={{ 
                  left: `${getPosition(task.actual.start)}%`, 
                  width: `${getWidth(task.actual.start, task.actual.end)}%` 
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
