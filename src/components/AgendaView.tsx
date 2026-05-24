'use client';

import React from 'react';
import { Task } from '@/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Calendar, AlertTriangle, CheckCircle2, Timer, Camera, ChevronRight } from 'lucide-react';

interface AgendaViewProps {
  tasks: Task[];
  currentDate: string;
  onTaskClick: (task: Task) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ tasks, currentDate, onTaskClick }) => {
  // Filter tasks for today (or tasks that are active/delayed)
  const todayTasks = tasks.filter(task => {
    const start = task.actual.start || task.planned.start;
    const end = task.actual.end === 'Pending' ? '9999-12-31' : task.actual.end;
    const isActiveToday = currentDate >= start && currentDate <= end;
    const isRelevant = task.status === 'In-Progress' || task.performance === 'Delayed';
    return isActiveToday || isRelevant;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Daily Agenda</h2>
        </div>
        <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
            March 10, 2026
        </span>
      </div>

      <div className="grid gap-3">
        {todayTasks.length === 0 && (
            <div className="p-8 text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                <p className="text-slate-500 text-sm">No tasks scheduled for today.</p>
            </div>
        )}
        
        {todayTasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onTaskClick(task)}
            className={twMerge(
              "relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left active:scale-[0.98] group",
              task.performance === 'Advance' && "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20",
              task.performance === 'On-Time' && "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20",
              task.performance === 'Delayed' && "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 ring-4 ring-rose-500/5 animate-pulse-intense"
            )}
          >
            <div className={twMerge(
              "flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-110",
              task.performance === 'Advance' && "bg-emerald-500 text-white",
              task.performance === 'On-Time' && "bg-blue-500 text-white",
              task.performance === 'Delayed' && "bg-rose-500 text-white"
            )}>
              {task.status === 'Completed' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : task.performance === 'Delayed' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <Timer className="w-6 h-6" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{task.id} • {task.phase}</span>
              </div>
              <h4 className="text-white font-bold leading-tight truncate">{task.activity}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-400">Target: {task.baseline?.end || task.planned.end}</span>
                {task.delay_reason && (
                    <span className="text-[10px] text-rose-400 italic">! {task.delay_reason}</span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </div>
                {task.photo_url && (
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border-2 border-white/20">
                        <img src={task.photo_url} alt="Update" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
            
            {/* Status Indicator Bar */}
            <div className={twMerge(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 rounded-r-full",
                task.performance === 'Advance' && "bg-emerald-500",
                task.performance === 'On-Time' && "bg-blue-500",
                task.performance === 'Delayed' && "bg-rose-500"
            )} />
          </button>
        ))}
      </div>
    </div>
  );
};
