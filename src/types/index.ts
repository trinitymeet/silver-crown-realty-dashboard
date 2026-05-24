export type Status = 'Pending' | 'In-Progress' | 'Completed';
export type Performance = 'Advance' | 'On-Time' | 'Delayed';

export interface DateRange {
  start: string;
  end: string;
}

export interface Task {
  id: string;
  phase: string;
  activity: string;
  planned: DateRange;
  actual: {
    start: string;
    end: string | 'Pending';
  };
  baseline?: DateRange;
  status: Status;
  performance: Performance;
  delay_reason?: string;
  photo_url?: string | null;
}

export const calculatePerformance = (task: Task, currentDate: string): Performance => {
  const { actual, baseline, status } = task;
  const target = baseline || task.planned;

  if (status === 'Completed') {
    if (actual.end === 'Pending') return 'Delayed'; // Should not happen if completed
    return actual.end < target.end ? 'Advance' : actual.end === target.end ? 'On-Time' : 'Delayed';
  }

  // Not completed logic
  if (currentDate > target.end) {
    return 'Delayed';
  }

  return 'On-Time'; // Default for in-progress or pending within timeframe
};

// --- ERP SPECIFIC TYPES ---

export interface ERPBomItem {
  id: string;
  name: string;
  category: 'Material' | 'Labour' | 'Equipment';
  unit: string;
  plannedQty: number;
  plannedRate: number;
  plannedAmount: number;
  executedQty: number;
  executedAmount: number;
  poWOIssued: number;
}

export interface ERPActivity {
  id: string;
  name: string;
  unit: string;
  plannedQty: number;
  plannedRate: number;
  plannedBudget: number;
  physicalProgress: number; // 0 to 100
  startMonth: number; // 1 to 6 (Mar = 1, Apr = 2, May = 3, Jun = 4, Jul = 5, Aug = 6)
  durationMonths: number;
  bom: ERPBomItem[];
}

export interface Transaction {
  id: string;
  type: 'PO' | 'WO';
  activityId: string;
  activityName: string;
  bomItemId: string;
  bomItemName: string;
  category: 'Material' | 'Labour' | 'Equipment';
  qty: number;
  rate: number;
  amount: number;
  partyName: string;
  date: string;
  month: string;
}

export interface ResourceMetric {
  category: 'Material' | 'Labour' | 'Equipment';
  plannedValue: number;
  actualCost: number;
  earnedValue: number;
  plannedBudget: number;
  costVariance: number;
  scheduleVariance: number;
  cpi: number;
  spi: number;
  status: 'Healthy' | 'Over Budget' | 'Behind Schedule' | 'Critical';
}

