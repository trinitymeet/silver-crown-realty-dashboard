'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/hooks/use-task-store';
import { GanttChart } from '@/components/GanttChart';
import { AgendaView } from '@/components/AgendaView';
import { UpdateModal } from '@/components/UpdateModal';
import { Task } from '@/types';
import { 
  Smartphone, Monitor, ShieldCheck, Lock, Unlock, 
  Layers, Calendar, BarChart3, Plus, Send, RefreshCw, 
  MapPin, CheckCircle, Clock, AlertTriangle, MessageSquare, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock initial field updates log
interface FieldNote {
  id: string;
  time: string;
  category: string;
  author: string;
  note: string;
}

export default function MobileDashboard() {
  const { tasks, isFrozen, freezePlan, updateTask, currentDate } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'agenda' | 'notes'>('dashboard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Custom Field Notes state
  const [notes, setNotes] = useState<FieldNote[]>([
    { id: '1', time: '09:30 AM', category: 'Foundation', author: 'Rajesh K. (Foreman)', note: 'Rebar check complete for zone A. Ready for pour.' },
    { id: '2', time: '10:15 AM', category: 'Weather', author: 'System Alert', note: 'Heavy rain warning. Concrete pour delayed by 1 hour.' }
  ]);
  const [newNote, setNewNote] = useState('');
  const [newCategory, setNewCategory] = useState('Foundation');

  // Compute Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In-Progress').length;
  const delayedTasks = tasks.filter(t => t.performance === 'Delayed').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Add field note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const noteObj: FieldNote = {
      id: Date.now().toString(),
      time: timeNow,
      category: newCategory,
      author: 'You (Supervisor)',
      note: newNote.trim()
    };
    
    setNotes(prev => [noteObj, ...prev]);
    setNewNote('');
  };

  const renderDashboardTab = () => {
    return (
      <div className="space-y-6">
        {/* Baseline Freeze Section */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-5 border border-slate-800 flex items-center justify-between shadow-xl">
          <div className="space-y-1 pr-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Baseline Lock</h4>
            <p className="text-sm font-semibold text-white">
              {isFrozen ? 'Baseline Lock is ACTIVE' : 'Baseline Lock is PENDING'}
            </p>
            <p className="text-[10px] text-slate-500">
              {isFrozen ? 'All performance variances are tracked.' : 'Freeze planned dates before logging actuals.'}
            </p>
          </div>
          <button
            onClick={freezePlan}
            disabled={isFrozen}
            className={`px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              isFrozen 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95'
            }`}
          >
            {isFrozen ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Frozen</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-white animate-bounce" />
                <span>Freeze</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Circular Progress */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center justify-between">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Execution Progress</h4>
            <h3 className="text-2xl font-black text-white">{completionPercentage}% <span className="text-xs font-semibold text-slate-500">Done</span></h3>
            <p className="text-[10px] text-slate-500 leading-normal max-w-[160px]">
              {completedTasks} of {totalTasks} sequenced milestones fully complete.
            </p>
          </div>
          
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                strokeWidth="8"
                stroke="#1e293b"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                strokeWidth="8"
                stroke={completionPercentage === 100 ? '#10b981' : '#4f46e5'}
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * completionPercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-sm font-black text-white">{completionPercentage}%</span>
          </div>
        </div>

        {/* Main KPIs Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-4 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-white">{inProgressTasks}</p>
            <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">In-Progress Tasks</p>
          </div>

          <div className={`bg-slate-900/60 backdrop-blur-md rounded-3xl p-4 border transition-all ${
            delayedTasks > 0 ? 'border-rose-900/50 bg-rose-950/10' : 'border-slate-800'
          } shadow-md`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alerts</span>
              <AlertTriangle className={`w-4 h-4 ${delayedTasks > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <p className={`text-2xl font-black ${delayedTasks > 0 ? 'text-rose-500' : 'text-white'}`}>{delayedTasks}</p>
            <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">Delayed Tasks</p>
          </div>
        </div>

        {/* Task Cards Quick List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Execution Plan</h4>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Tap to Update</span>
          </div>
          <div className="space-y-2">
            {tasks.map(task => (
              <div 
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 transition-all duration-300 flex items-center justify-between cursor-pointer group"
              >
                <div className="space-y-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{task.id}</span>
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase font-bold tracking-wider">{task.phase}</span>
                  </div>
                  <h5 className="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{task.activity}</h5>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span>Plan: {task.planned.end}</span>
                    <span>•</span>
                    <span className={task.actual.end === 'Pending' ? 'text-indigo-400' : 'text-slate-400'}>
                      Actual: {task.actual.end}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                    task.status === 'In-Progress' ? 'bg-indigo-500/10 text-indigo-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {task.status}
                  </span>
                  
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    task.performance === 'Advance' ? 'bg-emerald-500/20 text-emerald-400' :
                    task.performance === 'On-Time' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-rose-500/20 text-rose-400 animate-pulse-intense'
                  }`}>
                    {task.performance}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTimelineTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-5 border border-slate-800 shadow-xl">
          <GanttChart 
            tasks={tasks} 
            onTaskClick={(task) => setSelectedTask(task)} 
          />
        </div>
        
        <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800/80 space-y-2">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-indigo-400" />
            Interactive Timeline Guide
          </h5>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Foremen can tap on any task bar or label directly to launch the Field Execution update modal. Recalculations are done live.
          </p>
        </div>
      </div>
    );
  };

  const renderAgendaTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-5 border border-slate-800 shadow-xl">
          <AgendaView 
            tasks={tasks} 
            currentDate={currentDate}
            onTaskClick={(task) => setSelectedTask(task)} 
          />
        </div>
      </div>
    );
  };

  const renderNotesTab = () => {
    return (
      <div className="space-y-6">
        {/* Add note card */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-5 border border-slate-800 shadow-xl">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Post Field Note</h4>
          
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {['Foundation', 'MEP', 'Weather', 'Safety', 'Material'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all ${
                      newCategory === cat 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Log Message</label>
              <div className="relative">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Describe actual work, crew status, or logs..."
                  className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none pr-12"
                />
                <button
                  type="submit"
                  className="absolute bottom-4 right-4 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl active:scale-95 transition-all shadow-md shadow-indigo-600/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Notes stream */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Field Update Log</h4>
          <div className="space-y-3">
            {notes.map(note => (
              <div key={note.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-800 border border-slate-700 text-indigo-400 px-2 py-0.5 rounded font-black tracking-wider uppercase">
                      {note.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{note.author}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{note.time}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{note.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 select-none font-sans">
      
      {/* Device frame controls */}
      <div className="hidden md:flex gap-4 mb-6 z-10">
        <button
          onClick={() => setIsFullscreen(false)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border ${
            !isFullscreen 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mobile Device View</span>
        </button>
        <button
          onClick={() => setIsFullscreen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border ${
            isFullscreen 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Fullscreen Canvas</span>
        </button>
      </div>

      {/* Main Mobile App Container */}
      <div className={`transition-all duration-500 ease-out shadow-2xl relative ${
        isFullscreen 
          ? 'w-full max-w-5xl rounded-[32px] border border-slate-800 overflow-hidden bg-slate-950 flex flex-col min-h-[85vh]' 
          : 'w-[400px] h-[840px] rounded-[55px] border-[10px] border-slate-800 overflow-hidden bg-slate-950 flex flex-col shadow-slate-950/80 ring-1 ring-slate-700/50'
      }`}>
        
        {/* Device Notch & Status bar */}
        {!isFullscreen && (
          <div className="h-10 bg-slate-950 shrink-0 flex items-center justify-between px-8 text-xs font-extrabold text-slate-400 relative z-40 select-none">
            <span>09:41</span>
            {/* Notch */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-32 h-6 bg-slate-800 rounded-b-2xl" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] tracking-widest">5G</span>
              <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-[1px] flex items-center">
                <div className="h-full w-4 bg-slate-400 rounded-2xs" />
              </div>
            </div>
          </div>
        )}

        {/* App Title Header */}
        <header className="h-16 shrink-0 bg-slate-900/40 border-b border-slate-800/80 px-6 flex items-center justify-between relative z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">Construction</span>
              <h2 className="text-xs font-black text-white uppercase tracking-wider">FieldSync Mobile</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
              Foreman Access
            </span>
          </div>
        </header>

        {/* Content Panel Scroll */}
        <div className="flex-1 overflow-y-auto p-5 pb-24 relative select-none">
          {/* Subtle glowing blob */}
          <div className="absolute top-[-10%] left-[-10%] w-[200px] h-[200px] bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[200px] h-[200px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

          {activeTab === 'dashboard' && renderDashboardTab()}
          {activeTab === 'timeline' && renderTimelineTab()}
          {activeTab === 'agenda' && renderAgendaTab()}
          {activeTab === 'notes' && renderNotesTab()}
        </div>

        {/* App Bottom Navigation Bar */}
        <nav className="absolute bottom-0 inset-x-0 h-20 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800/85 px-4 flex items-center justify-around z-40 select-none">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <Layers className="w-5 h-5" /> },
            { id: 'timeline', label: 'Timeline', icon: <BarChart3 className="w-5 h-5" /> },
            { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-5 h-5" /> },
            { id: 'notes', label: 'Field Notes', icon: <MessageSquare className="w-5 h-5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 py-2 px-3.5 rounded-2xl transition-all ${
                activeTab === tab.id 
                  ? 'text-indigo-400 scale-105' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              <span className="text-[9px] font-black tracking-wider uppercase">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Mock Home Indicator bar for Mobile View */}
        {!isFullscreen && (
          <div className="absolute bottom-1 inset-x-0 h-1 flex justify-center pointer-events-none z-50">
            <div className="w-36 h-1 bg-slate-700 rounded-full" />
          </div>
        )}

      </div>

      {/* Task Update Modal */}
      {selectedTask && (
        <UpdateModal
          task={selectedTask}
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
        />
      )}

    </div>
  );
}
