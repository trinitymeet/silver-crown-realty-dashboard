'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { X, Camera, Save, AlertCircle, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

interface UpdateModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ task, isOpen, onClose, onUpdate }) => {
  const [actualStart, setActualStart] = useState(task.actual.start);
  const [actualEnd, setActualEnd] = useState(task.actual.end === 'Pending' ? '' : task.actual.end);
  const [status, setStatus] = useState(task.status);
  const [delayReason, setDelayReason] = useState(task.delay_reason || '');
  
  // Camera Simulation States
  const [showCamera, setShowCamera] = useState(false);
  const [flash, setFlash] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(task.photo_url || null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(task.id, {
      actual: {
        start: actualStart,
        end: actualEnd || 'Pending',
      },
      status,
      delay_reason: status !== 'Completed' ? delayReason : undefined,
      photo_url: photoUrl,
    });
    onClose();
  };

  const handleCapture = () => {
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      const randomId = Math.floor(Math.random() * 1000);
      const simulatedUrl = `https://placehold.co/600x400/020617/f8fafc?text=Field+Sync+Capture+${task.id}+[${randomId}]`;
      setPhotoUrl(simulatedUrl);
      setShowCamera(false);
    }, 300);
  };

  const removePhoto = () => {
    setPhotoUrl(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
        {/* Flash Overlay */}
        {flash && (
          <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />
        )}

        {/* Viewfinder Screen */}
        {showCamera ? (
          <div className="p-6 space-y-6 bg-slate-950 text-white min-h-[400px] flex flex-col justify-between relative">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Simulated Viewfinder</span>
                <h3 className="text-lg font-bold text-white">Live Camera Feed</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCamera(false)} 
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewfinder Frame */}
            <div className="relative aspect-video w-full border-2 border-slate-800 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
              {/* Grid Overlay */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                <div className="border-r border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-b border-white"></div>
                <div className="border-r border-white"></div>
                <div className="border-r border-white"></div>
                <div></div>
              </div>
              
              <div className="text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <Camera className="w-8 h-8 text-blue-500/60 animate-pulse" />
                <span>Pointing device at {task.activity}</span>
              </div>

              {/* Status indicator */}
              <div className="absolute top-3 left-3 bg-red-600 px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                REC 4K
              </div>
            </div>

            {/* Shutter controls */}
            <div className="flex justify-center pb-4">
              <button
                type="button"
                onClick={handleCapture}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:scale-90 transition-transform group"
              >
                <div className="w-12 h-12 rounded-full bg-red-600 group-hover:bg-red-500 transition-colors" />
              </button>
            </div>
          </div>
        ) : (
          /* Normal Update Form */
          <>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{task.id} Update</span>
                    <h3 className="text-xl font-bold text-white">{task.activity}</h3>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase">Actual Start</label>
                        <input 
                            type="date" 
                            value={actualStart}
                            onChange={(e) => setActualStart(e.target.value)}
                            className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase">Actual End</label>
                        <input 
                            type="date" 
                            value={actualEnd}
                            onChange={(e) => setActualEnd(e.target.value)}
                            placeholder="Pending"
                            className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Progress Status</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Pending', 'In-Progress', 'Completed'].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStatus(s as any)}
                                className={clsx(
                                    "py-2.5 rounded-xl text-xs font-bold transition-all",
                                    status === s 
                                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {status !== 'Completed' && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3 text-rose-400" />
                            Delay Reason (Optional)
                        </label>
                        <textarea 
                            value={delayReason}
                            onChange={(e) => setDelayReason(e.target.value)}
                            className="w-full bg-slate-800 border-none rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-rose-500 outline-none h-20 resize-none"
                            placeholder="Why is it delayed?"
                        />
                    </div>
                )}

                {/* Photo Preview inside Form */}
                {photoUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video group/photo">
                    <img src={photoUrl} alt="Captured preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowCamera(true)} 
                        className="p-2 bg-slate-850 hover:bg-slate-800 rounded-full text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Camera className="w-4 h-4" /> Retake
                      </button>
                      <button 
                        type="button" 
                        onClick={removePhoto} 
                        className="p-2 bg-rose-600 hover:bg-rose-500 rounded-full text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                    {!photoUrl && (
                      <button
                          type="button"
                          onClick={() => setShowCamera(true)}
                          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-700 active:scale-[0.98] transition-all"
                      >
                          <Camera className="w-5 h-5" />
                          Add Photo
                      </button>
                    )}
                    <button
                        type="submit"
                        className={clsx(
                          "flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-400 shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all",
                          photoUrl ? "flex-1" : "flex-[1.5]"
                        )}
                    >
                        <Save className="w-5 h-5" />
                        Save Update
                    </button>
                </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

