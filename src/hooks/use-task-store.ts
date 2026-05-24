'use client';

import { useState, useCallback } from 'react';
import { Task, calculatePerformance } from '@/types';

const INITIAL_TASKS: Task[] = [
  {
    "id": "F-101",
    "phase": "Foundation",
    "activity": "Rebar & Mesh Placement",
    "planned": { "start": "2026-03-08", "end": "2026-03-10" },
    "actual": { "start": "2026-03-08", "end": "2026-03-09" },
    "status": "Completed",
    "performance": "Advance",
    "photo_url": "https://placehold.co/400x300?text=Rebar+Check+OK"
  },
  {
    "id": "F-102",
    "phase": "Foundation",
    "activity": "Concrete Pour (Slab)",
    "planned": { "start": "2026-03-11", "end": "2026-03-11" },
    "actual": { "start": "2026-03-12", "end": "Pending" },
    "status": "In-Progress",
    "performance": "Delayed",
    "delay_reason": "Heavy Rain - Crew standing by",
    "photo_url": null
  }
];

export const useTaskStore = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isFrozen, setIsFrozen] = useState(false);
  const currentDate = "2026-03-10"; // As per request context

  const freezePlan = useCallback(() => {
    setTasks(prev => prev.map(task => ({
      ...task,
      baseline: { ...task.planned }
    })));
    setIsFrozen(true);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      
      const updatedTask = { ...task, ...updates };
      updatedTask.performance = calculatePerformance(updatedTask, currentDate);
      return updatedTask;
    }));
  }, [currentDate]);

  return {
    tasks,
    isFrozen,
    freezePlan,
    updateTask,
    currentDate
  };
};
