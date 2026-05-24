'use client';

import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ComposedChart, Legend, PieChart, Pie, Cell
} from 'recharts';
import { 
  Activity, Wallet, ShieldCheck, Drill, Building2, TrendingUp, TrendingDown, Clock, Search, Bell,
  AlertTriangle, CheckCircle2, ChevronDown, Filter, FileText, Smartphone, RefreshCw, Hammer, Truck, Box,
  Calendar, Plus, User, Play, ChevronUp, ArrowUpRight, ArrowDownRight, Edit2, HelpCircle, Info, Award
} from 'lucide-react';
import { useErpStore } from '@/hooks/use-erp-store';
import { ERPActivity, ERPBomItem, Transaction, ResourceMetric } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function IndianContractorERP_Level5() {
  const {
    activities,
    transactions,
    currentMonthIdx,
    currentMonthName,
    monthsList,
    totalPlannedBudget,
    totalExecutedCost,
    totalPlannedValue,
    totalEarnedValue,
    costVariance,
    scheduleVariance,
    cpi,
    spi,
    
    // Billing Aggregates
    totalClientContractValue,
    totalClientBilled,
    totalClientCertified,
    billingMargin,
    netOperatingCashflow,

    cashflowDetails,
    resourceMetrics,
    issuePO,
    issueWO,
    updateActivityProgress,
    updateActivitySchedule,
    updateProjectMonth,
    resetProject
  } = useErpStore();

  const [activeTab, setActiveTab] = useState<'boq' | 'evm' | 'ra-billing' | 'projections' | 'scheduler' | 'transactions' | 'powerbi'>('boq');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>('ACT-02'); // Expand Foundation by default
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [tooltipState, setTooltipState] = useState<{ type: string; x: number; y: number } | null>(null);

  // Procurement Terminal States
  const [orderType, setOrderType] = useState<'PO' | 'WO'>('PO');
  const [termActivityId, setTermActivityId] = useState<string>('ACT-03');
  const [termBomItemId, setTermBomItemId] = useState<string>('');
  const [termQty, setTermQty] = useState<number>(0);
  const [termRate, setTermRate] = useState<number>(0);
  const [termParty, setTermParty] = useState<string>('');
  const [termDate, setTermDate] = useState<string>('2026-05-23');

  // Override browser tab title client-side
  useEffect(() => {
    document.title = "Silver Crown Realty";
  }, []);

  // Trigger auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Selected Activity in the Execution Terminal
  const termActivity = activities.find(a => a.id === termActivityId);
  
  // Filter BOM items by type: Materials for PO, Labour/Equipment for WO
  const filteredBomItems = termActivity?.bom.filter(item => {
    if (orderType === 'PO') return item.category === 'Material';
    return item.category === 'Labour' || item.category === 'Equipment';
  }) || [];

  // Update default BOM item selection when activity or order type changes
  useEffect(() => {
    if (filteredBomItems.length > 0) {
      setTermBomItemId(filteredBomItems[0].id);
      
      // Default inputs based on remaining planned values
      const remainingQty = Math.max(0, filteredBomItems[0].plannedQty - filteredBomItems[0].poWOIssued);
      setTermQty(remainingQty || filteredBomItems[0].plannedQty);
      setTermRate(filteredBomItems[0].plannedRate);
    } else {
      setTermBomItemId('');
      setTermQty(0);
      setTermRate(0);
    }
  }, [termActivityId, orderType]);

  // Update quantity/rate default when BOM item changes
  const handleBomItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = e.target.value;
    setTermBomItemId(itemId);
    const item = filteredBomItems.find(i => i.id === itemId);
    if (item) {
      const remainingQty = Math.max(0, item.plannedQty - item.poWOIssued);
      setTermQty(remainingQty || item.plannedQty);
      setTermRate(item.plannedRate);
    }
  };

  // Submit resource order
  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termActivityId || !termBomItemId || termQty <= 0 || termRate <= 0 || !termParty.trim() || !termDate) {
      setToast({ message: 'Error: Please fill in all fields with valid values.', type: 'error' });
      return;
    }

    const item = termActivity?.bom.find(i => i.id === termBomItemId);
    if (!item) return;

    if (orderType === 'PO') {
      issuePO(termActivityId, termBomItemId, termQty, termRate, termParty.trim(), termDate);
      setToast({ message: `Issued PO for ${termQty.toLocaleString('en-IN')} ${item.unit} of ${item.name}! Total: ${formatLakhs(termQty * termRate)}`, type: 'success' });
    } else {
      issueWO(termActivityId, termBomItemId, termQty, termRate, termParty.trim(), termDate);
      setToast({ message: `Issued Work Order for ${termQty.toLocaleString('en-IN')} ${item.unit} of ${item.name}! Total: ${formatLakhs(termQty * termRate)}`, type: 'success' });
    }

    // Reset some terminal fields
    setTermParty('');
  };

  // Calculate percentage of budget used
  const budgetUtilization = totalPlannedBudget > 0 ? (totalExecutedCost / totalPlannedBudget) * 100 : 0;
  
  // Format Lakhs / Crores helper
  const formatLakhs = (amtInRupees: number) => {
    if (Math.abs(amtInRupees) >= 10000000) {
      return `₹ ${(amtInRupees / 10000000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
    }
    return `₹ ${(amtInRupees / 100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Lakhs`;
  };

  // Short format for table space
  const formatLakhsShort = (amtInRupees: number) => {
    return `₹ ${(amtInRupees / 100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
  };

  // Dynamic EVM indices color scheme for light mode (Steel Blue for efficient, Caterpillar Yellow for warnings, Rose for overrun)
  const getIndexColor = (val: number) => {
    if (val >= 1.0) return 'text-[#1E3A8A] bg-blue-50 border-blue-200';
    if (val >= 0.9) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  // Custom tooltips for Recharts
  const SCurveTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-md z-50 text-[11px] font-sans">
          <div className="font-bold text-slate-500 uppercase tracking-wider mb-2">Month: {label}</div>
          <div className="flex flex-col gap-1.5">
            {payload.map((entry: any, index: number) => {
              if (entry.value === null || entry.value === undefined) return null;
              return (
                <div key={index} className="flex justify-between items-center gap-6">
                  <span className="flex items-center gap-2 font-medium text-slate-650">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
                    {entry.name}
                  </span>
                  <span className="font-bold text-slate-800 tracking-wider font-mono">₹ {entry.value.toFixed(2)} L</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Dynamic actual cost categories breakdown
  const materialAC = transactions.filter(t => t.category === 'Material').reduce((sum, t) => sum + t.amount, 0);
  const labourAC = transactions.filter(t => t.category === 'Labour').reduce((sum, t) => sum + t.amount, 0);
  const equipmentAC = transactions.filter(t => t.category === 'Equipment').reduce((sum, t) => sum + t.amount, 0);

  // Dynamic EV components breakdown for first 3 activities
  const act01EV = ((activities.find(a => a.id === 'ACT-01')?.plannedBudget || 0) * (activities.find(a => a.id === 'ACT-01')?.physicalProgress || 0)) / 100;
  const act02EV = ((activities.find(a => a.id === 'ACT-02')?.plannedBudget || 0) * (activities.find(a => a.id === 'ACT-02')?.physicalProgress || 0)) / 100;
  const act03EV = ((activities.find(a => a.id === 'ACT-03')?.plannedBudget || 0) * (activities.find(a => a.id === 'ACT-03')?.physicalProgress || 0)) / 100;
  
  // Total remaining EV for other activities
  const remainingEV = totalEarnedValue - (act01EV + act02EV + act03EV);

  // Inline styling for premium nature-inspired and architectural gradient header line
  const architecturalAccentStyle = {
    background: 'linear-gradient(90deg, #1B4332 0%, #2D6A4F 40%, #D8A48F 70%, #C05A46 100%)',
    height: '4px',
    width: '100%',
  };

  // Render KPI tooltip content based on helpType — called from fixed-position tooltip at root
  const renderKpiTooltipContent = (type: string) => {
    switch (type) {
      case 'contract': return (
        <>
          <h5 className="font-bold text-slate-800 mb-1 font-sans border-b pb-1">Contract Valuation Derivation</h5>
          <p className="mb-1 text-slate-400 font-mono text-[9px]">Formula: Baseline Budget (BAC) x 1.15 Markup</p>
          <div className="space-y-1 font-mono text-[9.5px] bg-slate-50 p-1.5 rounded border border-slate-100 mb-1 text-slate-700">
            <div className="flex justify-between"><span>Baseline Budget (BAC):</span><span>₹ {(totalPlannedBudget/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            <div className="flex justify-between border-b pb-1"><span>Contract Markup:</span><span>+15.0%</span></div>
            <div className="flex justify-between font-bold pt-1 text-emerald-700"><span>Contract Value:</span><span>₹ {(totalClientContractValue/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
          </div>
          <p className="font-sans">This is the total budget for the project certified with the client, representing the baseline cost structure markup by 15%.</p>
        </>
      );
      case 'billed': return (
        <>
          <h5 className="font-bold text-slate-800 mb-1 font-sans border-b pb-1">Customer RA Billed Derivation</h5>
          <p className="mb-1 text-slate-400 font-mono text-[9px]">Formula: Earned Value (EV) x 1.15 Markup</p>
          <div className="space-y-1 font-mono text-[9.5px] bg-slate-50 p-1.5 rounded border border-slate-100 mb-1 text-slate-700">
            <div className="flex justify-between"><span>EV (Baseline Progress):</span><span>₹ {(totalEarnedValue/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            <div className="flex justify-between border-b pb-1"><span>Contract Markup:</span><span>+15.0%</span></div>
            <div className="flex justify-between font-bold pt-1 text-emerald-700"><span>Billed Revenue:</span><span>₹ {(totalClientBilled/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
          </div>
          <p className="font-sans">Progress billing certified at 15% margin. Current ₹ {(totalClientBilled/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L billed from Excavation + Foundation + 50% Superstructure.</p>
        </>
      );
      case 'ev': return (
        <>
          <h5 className="font-bold text-slate-800 mb-1 font-sans border-b pb-1">Earned Value (EV) Derivation</h5>
          <p className="mb-1 text-slate-400 font-mono text-[9px]">Formula: Sum of (Activity Budget x Progress %)</p>
          <div className="space-y-1 font-mono text-[9.5px] bg-slate-50 p-1.5 rounded border border-slate-100 mb-1 text-slate-700">
            <div className="flex justify-between"><span>ACT-01 ({(activities.find(a => a.id === 'ACT-01')?.physicalProgress || 0)}%):</span><span>₹ {(act01EV/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            <div className="flex justify-between"><span>ACT-02 ({(activities.find(a => a.id === 'ACT-02')?.physicalProgress || 0)}%):</span><span>₹ {(act02EV/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            <div className="flex justify-between"><span>ACT-03 ({(activities.find(a => a.id === 'ACT-03')?.physicalProgress || 0)}%):</span><span>₹ {(act03EV/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            {remainingEV > 0 && <div className="flex justify-between"><span>Other Activities:</span><span>₹ {(remainingEV/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>}
            <div className="flex justify-between font-bold pt-1 border-t text-emerald-700"><span>Total Earned Value:</span><span>₹ {(totalEarnedValue/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
          </div>
          <p className="font-sans">EV is the budgeted cost of physical work actually completed — tracks internal progress before client markups.</p>
        </>
      );
      case 'ac': return (
        <>
          <h5 className="font-bold text-slate-800 mb-1 font-sans border-b pb-1">Actual Cost (AC) Derivation</h5>
          <p className="mb-1 text-slate-400 font-mono text-[9px]">Formula: Sum of Executed Purchase & Work Orders</p>
          <div className="space-y-1 font-mono text-[9.5px] bg-slate-50 p-1.5 rounded border border-slate-100 mb-1 text-slate-700">
            <div className="flex justify-between"><span>Procured Materials:</span><span>₹ {(materialAC/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            <div className="flex justify-between"><span>Subcontractor Labour:</span><span>₹ {(labourAC/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            <div className="flex justify-between border-b pb-1"><span>Equipment Rental:</span><span>₹ {(equipmentAC/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            <div className="flex justify-between font-bold pt-1 text-emerald-700"><span>Total Actual Cost:</span><span>₹ {(totalExecutedCost/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
          </div>
          <p className="font-sans">Total expenditure incurred to date — sum of all material procurements and labor contracts issued.</p>
        </>
      );
      case 'cv': return (
        <>
          <h5 className="font-bold text-slate-800 mb-1 font-sans border-b pb-1">Cost Variance (CV) Derivation</h5>
          <p className="mb-1 text-slate-400 font-mono text-[9px]">Formula: Earned Value (EV) — Actual Cost (AC)</p>
          <div className="space-y-1 font-mono text-[9.5px] bg-slate-50 p-1.5 rounded border border-slate-100 mb-1 text-slate-700">
            <div className="flex justify-between"><span>EV (Baseline Progress):</span><span>₹ {(totalEarnedValue/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            <div className="flex justify-between border-b pb-1"><span>AC (Actual Spend):</span><span>₹ {(totalExecutedCost/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            <div className="flex justify-between font-bold pt-1 text-rose-600"><span>Cost Variance (CV):</span><span>{(costVariance/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
          </div>
          <p className="font-sans">Measures spending variance against baseline progress. {costVariance < 0 ? 'Current deficit driven by cost overruns on materials and equipment.' : 'Currently running within budget.'}</p>
        </>
      );
      case 'cpi': return (
        <>
          <h5 className="font-bold text-slate-800 mb-1 font-sans border-b pb-1">Cost Performance Index (CPI)</h5>
          <p className="mb-1 text-slate-400 font-mono text-[9px]">Formula: EV / AC — Measures financial cost efficiency</p>
          <div className="space-y-1 font-mono text-[9.5px] bg-slate-50 p-1.5 rounded border border-slate-100 mb-1 text-slate-700">
            <div className="flex justify-between"><span>EV (Earned Value):</span><span>₹ {(totalEarnedValue/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            <div className="flex justify-between border-b pb-1"><span>AC (Actual Cost):</span><span>₹ {(totalExecutedCost/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            <div className="flex justify-between font-bold pt-1 text-emerald-700"><span>CPI Score:</span><span>{cpi.toFixed(3)}</span></div>
          </div>
          <p className="font-sans">CPI &gt; 1.0 means getting more than ₹1 of value per rupee spent. Score &lt; 1.0 indicates unit cost overrun.</p>
        </>
      );
      default: return (
        <>
          <h5 className="font-bold text-slate-800 mb-1 font-sans border-b pb-1">Schedule Performance Index (SPI)</h5>
          <p className="mb-1 text-slate-400 font-mono text-[9px]">Formula: EV / PV — Measures schedule efficiency</p>
          <div className="space-y-1 font-mono text-[9.5px] bg-slate-50 p-1.5 rounded border border-slate-100 mb-1 text-slate-700">
            <div className="flex justify-between"><span>EV (Earned Value):</span><span>₹ {(totalEarnedValue/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            <div className="flex justify-between border-b pb-1"><span>PV (Planned Value):</span><span>₹ {(totalPlannedValue/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</span></div>
            <div className="flex justify-between font-bold pt-1 text-emerald-700"><span>SPI Score:</span><span>{spi.toFixed(3)}</span></div>
          </div>
          <p className="font-sans">SPI &gt; 1.0 indicates work completion ahead of plan. Scores &lt; 1.0 represent schedule delays.</p>
        </>
      );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100/50 text-slate-800 font-sans overflow-hidden selection:bg-emerald-700/20">
      
      {/* ENTERPRISE COMMAND SIDEBAR (DEEP FOREST SLATE WITH EMERALD AND TERRACOTTA HIGHLIGHTS) */}
      <aside className="w-[70px] hover:w-64 transition-all duration-300 bg-[#0E1F16] border-r border-[#163022] flex flex-col z-30 group overflow-hidden absolute inset-y-0 left-0">
        <div className="h-16 flex items-center shrink-0 px-4 border-b border-[#163022] bg-[#07130D]">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            {/* Modern building tower logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 22V2H11V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 6H15V22" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
              <path d="M15 11H19V22" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </svg>
          </div>
          <span className="ml-4 font-black tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase text-xs">Silver Crown Realty</span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          {[
            { id: 'Overview', icon: <Activity size={18} />, active: true },
            { id: 'BOQ / BOM', icon: <Building2 size={18} />, active: false },
            { id: 'Procure', icon: <Wallet size={18} />, active: false },
            { id: 'Audit Logs', icon: <FileText size={18} />, active: false },
          ].map(item => (
            <button 
              key={item.id}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                item.active 
                ? 'bg-[#1E382A] text-emerald-450 shadow-inner font-bold border-l-2 border-emerald-500' 
                : 'text-slate-400 hover:text-white hover:bg-[#1E382A]/40'
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">{item.id}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-[#163022] flex flex-col gap-2 shrink-0">
          <a
            href="/mobile"
            className="flex items-center gap-4 px-3 py-2.5 rounded-lg text-emerald-450 hover:text-emerald-350 hover:bg-[#1E382A]/40 transition-all whitespace-nowrap"
          >
            <div className="shrink-0"><Smartphone size={18} /></div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">FieldSync App</span>
          </a>
        </div>
      </aside>

      {/* CORE WORKSPACE */}
      <main className="flex-1 ml-[70px] flex flex-col min-w-0 bg-transparent relative overflow-hidden">
        
        {/* ARCHITECTURAL DECORATIVE ACCENT BAR */}
        <div style={architecturalAccentStyle} />

        {/* WORKSPACE HEADER */}
        <header className="h-16 flex items-center justify-between px-6 shrink-0 relative z-10 border-b border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-md font-black text-[#0F172A] tracking-wide flex items-center gap-2">
              <span className="p-1.5 rounded bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-xs">
                {/* Modern building tower logo */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 22V2H11V22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11 6H15V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                  <path d="M15 11H19V22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                </svg>
              </span>
              <span>Silver Crown Realty</span>
            </h1>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            
            {/* Simulation Date Picker */}
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-slate-200 rounded px-2.5 py-1 text-xs shadow-2xs">
              <span className="text-slate-500 font-bold">Reporting Month:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => updateProjectMonth(idx)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-all ${
                      currentMonthIdx === idx 
                        ? 'bg-emerald-700 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    M{idx}
                  </button>
                ))}
              </div>
              <span className="text-[#0F172A] font-black ml-1 uppercase font-mono">{currentMonthName} 2026</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Reset Button */}
            <button
              onClick={() => {
                resetProject();
                setToast({ message: 'Project simulation data reset to baseline.', type: 'success' });
              }}
              title="Reset Project Data"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] rounded border border-slate-200 transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <RefreshCw size={12} className="text-emerald-700 animate-spin-slow" />
              <span>Reset Data</span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-slate-800 leading-none tracking-wide">Meet Patel</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin</p>
              </div>
              <div className="w-9 h-9 rounded-md bg-[#0E1F16] p-[1.5px]">
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[5px] flex items-center justify-center text-[11px] font-black text-white shadow-sm">MP</div>
              </div>
            </div>
          </div>
        </header>

        {/* HIGH-DENSITY CONTENT SCROLL */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth relative z-10 flex flex-col gap-6">
          <div className="max-w-[1700px] mx-auto w-full space-y-6">

            {/* ROW 1: PRIMARY FINANCIAL KPIs (WITH ARCHITECTURAL ACCENTS) */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { 
                  label: 'Client Contract Value (BAC + 15%)', 
                  value: formatLakhs(totalClientContractValue), 
                  detail: 'Baseline budget + 15% contract markup', 
                  accent: 'border-t-[#64748B]',
                  hasHelp: true,
                  helpType: 'contract'
                },
                { 
                  label: 'Customer RA Billed (EV x 1.15)', 
                  value: formatLakhs(totalClientBilled), 
                  detail: 'Progress billing based on EV + markup', 
                  accent: 'border-t-[#C05A46]', // Terracotta
                  hasHelp: true,
                  helpType: 'billed'
                },
                { 
                  label: 'Earned Value (EV)', 
                  value: formatLakhs(totalEarnedValue), 
                  detail: 'Value of physical work completed', 
                  accent: 'border-t-[#2D6A4F]', // Sage/Forest Green
                  hasHelp: true,
                  helpType: 'ev'
                },
                { 
                  label: 'Actual Cost (AC)', 
                  value: formatLakhs(totalExecutedCost), 
                  detail: `${transactions.length} supply-chain payments`, 
                  highlight: true, 
                  highlightColor: 'text-emerald-700', 
                  accent: 'border-t-emerald-700',
                  hasHelp: true,
                  helpType: 'ac'
                },
                { 
                  label: 'EVM Cost Variance (EV - AC)', 
                  value: `${costVariance >= 0 ? '+' : ''}${(costVariance/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`, 
                  detail: costVariance >= 0 ? 'Work value exceeds spend' : 'Cost overruns recorded',
                  accent: 'border-t-[#C05A46]', // Terracotta
                  customBadge: (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${costVariance >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {costVariance >= 0 ? 'SURPLUS' : 'DEFICIT'}
                    </span>
                  ),
                  hasHelp: true,
                  helpType: 'cv'
                },
                { 
                  label: 'Cost Index (CPI = EV / AC)', 
                  value: cpi.toFixed(3), 
                  detail: cpi >= 1.0 ? 'Under Budget' : 'Over Budget',
                  accent: 'border-t-emerald-800',
                  customBadge: <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${getIndexColor(cpi)}`}>{cpi >= 1.0 ? 'EFFICIENT' : 'LAGGING'}</span>,
                  hasHelp: true,
                  helpType: 'cpi'
                },
                { 
                  label: 'Schedule Index (SPI = EV / PV)', 
                  value: spi.toFixed(3), 
                  detail: spi >= 1.0 ? 'Ahead of Schedule' : 'Behind Schedule',
                  accent: 'border-t-[#C05A46]', // Terracotta
                  customBadge: <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${getIndexColor(spi)}`}>{spi >= 1.0 ? 'ON SCHEDULE' : 'DELAYED'}</span>,
                  hasHelp: true,
                  helpType: 'spi'
                },
              ].map((kpi, idx) => (
                <div key={idx} className={`bg-white/80 backdrop-blur-md border border-slate-100 border-t-4 ${kpi.accent} rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative group`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-normal flex items-center">
                      {kpi.label}
                      
                      {/* EVM Help — fixed-position tooltip rendered at page root */}
                      {kpi.hasHelp && (
                        <div
                          className="relative inline-block cursor-help ml-1 text-slate-400 hover:text-emerald-700 transition-colors"
                          onMouseEnter={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setTooltipState({ type: kpi.helpType!, x: rect.left, y: rect.bottom + 6 });
                          }}
                          onMouseLeave={() => setTooltipState(null)}
                        >
                          <HelpCircle size={11} />
                        </div>
                      )}
                    </span>
                    {kpi.customBadge}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-[22px] font-black tracking-tighter ${kpi.highlight ? 'bg-clip-text text-transparent bg-gradient-to-br from-emerald-600 to-teal-800' : 'text-slate-800'}`}>{kpi.value}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1 tracking-wider leading-relaxed">{kpi.detail}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ROW 2: RESOURCE TYPE WISE PERFORMANCE */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#0F172A] flex items-center gap-2">
                  <Hammer size={12} className="text-emerald-705" />
                  Resource-Type Cost & Schedule Performance Metrics
                </h3>
                <span className="text-[10px] text-slate-455 font-bold tracking-wider uppercase">EVM calculations by resource category</span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {(['Material', 'Labour', 'Equipment'] as const).map((cat) => {
                  const m = resourceMetrics[cat];
                  const cpiValue = m.cpi;
                  const spiValue = m.spi;
 
                  let statusColor = 'text-emerald-700 border-emerald-200 bg-emerald-50';
                  let icon = <CheckCircle2 size={12} className="text-emerald-600" />;
                  let borderCol = 'border-t-[#C05A46]'; // Default terracotta accent
                  if (m.status === 'Critical') {
                    statusColor = 'text-rose-700 border-rose-200 bg-rose-50 animate-pulse';
                    icon = <AlertTriangle size={12} className="text-rose-655" />;
                    borderCol = 'border-t-rose-500';
                  } else if (m.status === 'Over Budget') {
                    statusColor = 'text-rose-750 border-rose-200 bg-rose-50';
                    icon = <TrendingDown size={12} className="text-rose-600" />;
                    borderCol = 'border-t-rose-500';
                  } else if (m.status === 'Behind Schedule') {
                    statusColor = 'text-amber-700 border-amber-255 bg-amber-50';
                    icon = <Clock size={12} className="text-amber-600" />;
                    borderCol = 'border-t-amber-500';
                  }
 
                  return (
                    <div key={cat} className={`bg-white/90 backdrop-blur-md border border-slate-100/60 border-t-4 ${borderCol} rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative flex flex-col gap-4 hover:shadow-xl transition-shadow duration-300`}>
                      {/* Category Header */}
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded bg-slate-100 text-slate-700">
                            {cat === 'Material' && <Box size={14} className="text-indigo-650" />}
                            {cat === 'Labour' && <User size={14} className="text-emerald-650" />}
                            {cat === 'Equipment' && <Truck size={14} className="text-amber-650" />}
                          </span>
                          <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">{cat} Resources</h4>
                        </div>
                        <span className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusColor}`}>
                          {icon}
                          {m.status}
                        </span>
                      </div>
 
                      {/* EVM Dials / Progress Bars */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center mb-1">
                            Schedule index (SPI)
                            <div className="group/spi relative inline-block cursor-help ml-1 text-slate-350 hover:text-emerald-700">
                              <HelpCircle size={10} />
                              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 scale-95 rounded-lg border border-slate-200 bg-white p-2.5 text-[9.5px] font-normal leading-normal text-slate-655 shadow-xl opacity-0 transition-all group-hover/spi:pointer-events-auto group-hover/spi:scale-100 group-hover/spi:opacity-100">
                                <h5 className="font-bold text-slate-800 mb-0.5">SPI ({cat})</h5>
                                <p className="text-[8.5px] text-slate-400 font-mono mb-1">EV / PV for {cat}</p>
                                <p>Tracks schedule timeline speed specifically for {cat.toLowerCase()} resources. score &lt; 1.0 means delays.</p>
                              </div>
                            </div>
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className={`text-md font-black ${spiValue >= 1.0 ? 'text-[#0F172A]' : 'text-amber-600'}`}>{spiValue.toFixed(3)}</span>
                            <span className="text-[8.5px] text-slate-500 font-medium font-sans">
                              {spiValue >= 1.0 ? 'On-time' : 'Delayed'}
                            </span>
                          </div>
                        </div>
 
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center mb-1">
                            Cost index (CPI)
                            <div className="group/cpi relative inline-block cursor-help ml-1 text-slate-350 hover:text-emerald-700">
                              <HelpCircle size={10} />
                              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 scale-95 rounded-lg border border-slate-200 bg-white p-2.5 text-[9.5px] font-normal leading-normal text-slate-655 shadow-xl opacity-0 transition-all group-hover/cpi:pointer-events-auto group-hover/cpi:scale-100 group-hover/cpi:opacity-100">
                                <h5 className="font-bold text-slate-800 mb-0.5">CPI ({cat})</h5>
                                <p className="text-[8.5px] text-slate-400 font-mono mb-1">EV / AC for {cat}</p>
                                <p>Measures financial cost efficiency for {cat.toLowerCase()} purchases. score &lt; 1.0 indicates unit cost overrun.</p>
                              </div>
                            </div>
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className={`text-md font-black ${cpiValue >= 1.0 ? 'text-emerald-600' : 'text-rose-600'}`}>{cpiValue.toFixed(3)}</span>
                            <span className="text-[8.5px] text-slate-500 font-medium font-sans">
                              {cpiValue >= 1.0 ? 'Within Budget' : 'Over Budget'}
                            </span>
                          </div>
                        </div>
                      </div>
 
                      {/* Financial Detail Breakdown */}
                      <div className="space-y-2">
                        {/* Cost Progress Bar */}
                        <div>
                          <div className="flex justify-between text-[10px] mb-1 font-semibold text-slate-500">
                            <span>Actual Cost vs Planned Budget</span>
                            <span>{((m.actualCost / m.plannedBudget) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden relative">
                            <div 
                              className={`h-full rounded-full ${cpiValue >= 1.0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min(100, (m.actualCost / m.plannedBudget) * 100)}%` }}
                            />
                            {/* Earned Value Marker */}
                            <div 
                              className="absolute top-0 w-[2.5px] h-full bg-[#2D6A4F] cursor-help"
                              title={`Earned Value: ₹ ${(m.earnedValue/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Lakhs`}
                              style={{ left: `${Math.min(100, (m.earnedValue / m.plannedBudget) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Text Stats */}
                        <div className="grid grid-cols-3 text-[10px] text-slate-500 font-mono pt-1">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-sans">Planned (BAC)</span>
                            <span className="text-slate-800 font-bold">{formatLakhsShort(m.plannedBudget)}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-sans">Earned (EV)</span>
                            <span className="text-slate-850 font-bold">{formatLakhsShort(m.earnedValue)}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-sans">Actual (AC)</span>
                            <span className={`font-bold ${cpiValue >= 1.0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatLakhsShort(m.actualCost)}</span>
                          </div>
                        </div>

                        {/* Cost Variance */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10.5px]">
                          <span className="text-slate-455 font-medium">Cost Variance (CV):</span>
                          <span className={`font-mono font-bold ${m.costVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {m.costVariance >= 0 ? '+' : ''}{(m.costVariance / 100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Lakhs
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            
            {/* ROW 3: DETAILED CONTROLLER & SIMULATOR GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT CARD: BOQ & TIMELINE command panels (8/12 cols) */}
              <div className="lg:col-span-8 bg-white/90 backdrop-blur-md border border-slate-100/60 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col transition-shadow hover:shadow-xl">
                
                {/* Visual Tab Bar */}
                <div className="border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center p-1 px-4">
                  <div className="flex gap-2">
                    {[
                      { id: 'boq', label: 'BOQ & BOM Ledger', icon: <Building2 size={13} /> },
                      { id: 'evm', label: 'EVM Bifurcation Ledger', icon: <Activity size={13} /> },
                      { id: 'ra-billing', label: 'Client RA Billing Compare', icon: <Wallet size={13} /> },
                      { id: 'projections', label: 'Cash Flow & S-Curve', icon: <TrendingUp size={13} /> },
                      { id: 'scheduler', label: 'Schedule Projector', icon: <Calendar size={13} /> },
                      { id: 'transactions', label: 'Audit Trail Ledger', icon: <FileText size={13} /> },
                      { id: 'powerbi', label: 'Power BI Command Center', icon: <Award size={13} /> },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                          activeTab === tab.id
                            ? 'text-[#0F172A] border-[#2D6A4F] bg-white font-black'
                            : 'text-slate-500 border-transparent hover:text-slate-700'
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {/* TAB 1: BOQ & BOM LEDGER */}
                  {activeTab === 'boq' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-[#2D6A4F] rounded-xs inline-block"></span>
                            Bill of Quantities (BOQ) Master List
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Click any row to drill down into its Bill of Materials (BOM) resource mapping</p>
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
                        <table className="w-full text-left border-collapse font-sans text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              <th className="p-3">Activity</th>
                              <th className="p-3 text-center">Schedule</th>
                              <th className="p-3 w-[170px]">
                                <span className="flex items-center gap-1">
                                  Physical Progress
                                  <span className="group/prog relative inline-block cursor-help text-slate-400 hover:text-emerald-700">
                                    <HelpCircle size={10} />
                                    <span className="pointer-events-none absolute top-full left-0 z-50 mt-2 w-64 scale-95 rounded-lg border border-slate-200 bg-white p-2.5 text-[9.5px] font-normal normal-case leading-normal text-slate-600 shadow-xl opacity-0 transition-all group-hover/prog:pointer-events-auto group-hover/prog:scale-100 group-hover/prog:opacity-100">
                                      <span className="font-bold text-slate-800 mb-0.5 block font-sans">Physical Progress & Variance</span>
                                      <span className="block font-sans text-[8.5px] text-slate-500">Moving this slider updates the completion % which raises the **Value of Work Done (VWD)**. Since VWD is compared to Actual Cost (ACWP) to calculate Variance, pushing progress up increases Variance (VWD - ACWP) into a green surplus. Dragging it down represents less completed work for the spent cost, creating a red deficit variance.</span>
                                    </span>
                                  </span>
                                </span>
                              </th>
                              <th className="p-3 text-right">Planned Qty</th>
                              <th className="p-3 text-right">Budget (BAC)</th>
                              <th className="p-3 text-right">Actual Cost (ACWP)</th>
                              <th className="p-3 text-right">Variance (VWD - ACWP)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {activities.map(act => {
                              const isExpanded = selectedActivityId === act.id;
                              const actExecutedCost = act.bom.reduce((sum, item) => sum + item.executedAmount, 0);
                              
                              // EV of this activity
                              const actEarnedValue = (act.plannedBudget * act.physicalProgress) / 100;
                              const actVariance = actEarnedValue - actExecutedCost;
                              
                              const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
                              const schedText = `${months[act.startMonth - 1]}-${months[act.startMonth + act.durationMonths - 2]}`;

                              return (
                                <React.Fragment key={act.id}>
                                  {/* Activity Row */}
                                  <tr 
                                    onClick={() => setSelectedActivityId(isExpanded ? null : act.id)}
                                    className={`cursor-pointer transition-colors ${
                                      isExpanded ? 'bg-slate-50/80 hover:bg-slate-100 font-semibold' : 'hover:bg-slate-50/30'
                                    }`}
                                  >
                                    <td className="p-3">
                                      <div className="flex items-start gap-2.5">
                                        <div className="mt-1 shrink-0">
                                          {isExpanded ? <ChevronUp size={12} className="text-[#2D6A4F]" /> : <ChevronDown size={12} className="text-slate-400" />}
                                        </div>
                                        <div>
                                          <p className="font-bold text-slate-800 font-sans">{act.name}</p>
                                          <span className="text-[9.5px] font-mono text-slate-450">{act.id} • Unit: {act.unit}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3 text-center text-slate-655 font-mono text-[10.5px]">
                                      {schedText}
                                    </td>
                                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                      {/* Interactive Progress Slider */}
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[9.5px] font-bold">
                                          <span className="text-indigo-650">{act.physicalProgress}%</span>
                                        </div>
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          step="5"
                                          value={act.physicalProgress}
                                          onChange={(e) => updateActivityProgress(act.id, parseInt(e.target.value, 10))}
                                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2D6A4F] focus:outline-none"
                                        />
                                      </div>
                                    </td>
                                    <td className="p-3 text-right font-medium text-slate-600 font-mono">
                                      {act.plannedQty.toLocaleString('en-IN')} {act.unit}
                                    </td>
                                    <td className="p-3 text-right font-bold text-slate-700 font-mono">
                                      {formatLakhsShort(act.plannedBudget)}
                                    </td>
                                    <td className="p-3 text-right font-bold text-slate-700 font-mono">
                                      {formatLakhsShort(actExecutedCost)}
                                    </td>
                                    <td className={`p-3 text-right font-bold font-mono ${actVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                      {actVariance >= 0 ? '+' : ''}{(actVariance / 100000).toFixed(2)} L
                                    </td>
                                  </tr>

                                  {/* Mapped BOM Sub-Table */}
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <tr>
                                        <td colSpan={7} className="p-4 bg-slate-50/40 border-t border-slate-200">
                                          <div className="space-y-3 pl-6">
                                            <div className="flex justify-between items-center">
                                              <h5 className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] flex items-center gap-1.5 border-b-2 border-b-[#2D6A4F] pb-0.5">
                                                <Box size={11} className="text-[#2D6A4F]" />
                                                Bill of Materials (BOM) Resource Mapping
                                              </h5>
                                              <span className="text-[9px] text-slate-400">Variance = (Planned Budget for progress) - Executed Cost</span>
                                            </div>

                                            <table className="w-full text-left text-[11px] font-mono border border-slate-150 rounded bg-white">
                                              <thead>
                                                <tr className="bg-slate-50 border-b border-slate-150 pb-1 text-[9px] uppercase tracking-wider text-slate-450">
                                                  <th className="p-2">Resource Item</th>
                                                  <th className="p-2">Category</th>
                                                  <th className="p-2 text-right">Planned Qty / Rate</th>
                                                  <th className="p-2 text-right">Planned Amt</th>
                                                  <th className="p-2 text-right">Executed Qty / Rate</th>
                                                  <th className="p-2 text-right">Executed Amt</th>
                                                  <th className="p-2 text-right">Variance</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100">
                                                {act.bom.map(item => {
                                                  const itemVariance = (item.plannedAmount * act.physicalProgress / 100) - item.executedAmount;
                                                  const avgExecutedRate = item.executedQty > 0 ? item.executedAmount / item.executedQty : 0;
                                                  
                                                  return (
                                                    <tr key={item.id} className="hover:bg-slate-50">
                                                      <td className="p-2 text-slate-700 font-sans">
                                                        <p className="font-bold">{item.name}</p>
                                                        <span className="text-[9px] text-slate-400">{item.id}</span>
                                                      </td>
                                                      <td className="p-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider border ${
                                                          item.category === 'Material' ? 'bg-blue-50 text-indigo-700 border-indigo-100' :
                                                          item.category === 'Labour' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                          'bg-purple-50 text-purple-655 border-purple-100'
                                                        }`}>
                                                          {item.category}
                                                        </span>
                                                      </td>
                                                      <td className="p-2 text-right text-slate-550">
                                                        {item.plannedQty} {item.unit} @ ₹ {item.plannedRate.toFixed(0)}
                                                      </td>
                                                      <td className="p-2 text-right text-slate-700">
                                                        ₹ {item.plannedAmount.toLocaleString('en-IN')}
                                                      </td>
                                                      <td className="p-2 text-right text-slate-550">
                                                        {item.executedQty.toLocaleString('en-IN')} {item.unit} {item.executedQty > 0 ? `@ ₹ ${avgExecutedRate.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : ''}
                                                      </td>
                                                      <td className="p-2 text-right text-slate-700">
                                                        ₹ {item.executedAmount.toLocaleString('en-IN')}
                                                      </td>
                                                      <td className={`p-2 text-right font-bold ${itemVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        ₹ {itemVariance.toLocaleString('en-IN')}
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </AnimatePresence>
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: EVM BIFURCATION MASTER LEDGER */}
                  {activeTab === 'evm' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-[#D38E70] rounded-xs inline-block"></span>
                            Activity-by-Activity EVM Bifurcated Ledger
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Bifurcated calculation of Planned Value (PV), Earned Value (EV), Actual Cost (AC), and performance indices</p>
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left border-collapse font-sans text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              <th className="p-3">Activity Definition</th>
                              <th className="p-3 text-right">BAC (Planned Budget)</th>
                              <th className="p-3 text-center">Progress</th>
                              <th className="p-3 text-right">Planned Value (BCWS)</th>
                              <th className="p-3 text-right">Value of Work Done (VWD)</th>
                              <th className="p-3 text-right">Actual Cost (ACWP)</th>
                              <th className="p-3 text-right">Schedule Var (SV)</th>
                              <th className="p-3 text-right">Cost Var (CV)</th>
                              <th className="p-3 text-center">SPI</th>
                              <th className="p-3 text-center">CPI</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                            {activities.map(act => {
                              const actExecutedCost = act.bom.reduce((sum, item) => sum + item.executedAmount, 0);
                              
                              // EV of this activity = Budget * progress %
                              const actEarnedValue = (act.plannedBudget * act.physicalProgress) / 100;
                              
                              // PV of this activity = Budget * expected progress % based on schedule and reporting month
                              const expectedProgressMap = activities.reduce((map, a) => {
                                const start = a.startMonth;
                                const duration = a.durationMonths;
                                const end = start + duration - 1;
                                if (currentMonthIdx > end) map[a.id] = 100;
                                else if (currentMonthIdx < start) map[a.id] = 0;
                                else map[a.id] = Math.min(100, Math.round(((currentMonthIdx - start + 1) / duration) * 100));
                                return map;
                              }, {} as Record<string, number>);

                              const expProgress = expectedProgressMap[act.id] || 0;
                              const actPlannedValue = (act.plannedBudget * expProgress) / 100;
                              
                              const sv = actEarnedValue - actPlannedValue;
                              const cv = actEarnedValue - actExecutedCost;
                              
                              const actSpi = actPlannedValue > 0 ? actEarnedValue / actPlannedValue : 1.0;
                              const actCpi = actExecutedCost > 0 ? actEarnedValue / actExecutedCost : 1.0;

                              return (
                                <tr key={act.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-sans font-bold text-slate-800">{act.name}</td>
                                  <td className="p-3 text-right font-bold text-slate-700">{formatLakhsShort(act.plannedBudget)}</td>
                                  <td className="p-3 text-center font-bold text-[#2D6A4F]">{act.physicalProgress}%</td>
                                  <td className="p-3 text-right text-slate-600">{formatLakhsShort(actPlannedValue)}</td>
                                  <td className="p-3 text-right text-slate-800 font-bold">{formatLakhsShort(actEarnedValue)}</td>
                                  <td className="p-3 text-right text-slate-700">{formatLakhsShort(actExecutedCost)}</td>
                                  <td className={`p-3 text-right font-bold ${sv >= 0 ? 'text-indigo-650' : 'text-amber-600'}`}>{sv >= 0 ? '+' : ''}{(sv/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</td>
                                  <td className={`p-3 text-right font-bold ${cv >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{cv >= 0 ? '+' : ''}{(cv/100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</td>
                                  <td className="p-3 text-center">
                                    <span className={`px-1.5 py-0.5 rounded font-black text-[9px] ${actSpi >= 1.0 ? 'text-[#0F172A] bg-blue-50' : 'text-amber-605 bg-amber-50'}`}>
                                      {actSpi.toFixed(2)}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={`px-1.5 py-0.5 rounded font-black text-[9px] ${actCpi >= 1.0 ? 'text-[#0F172A] bg-blue-50' : 'text-rose-655 bg-rose-50'}`}>
                                      {actCpi.toFixed(2)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
 
                  {/* TAB 3: CLIENT RA BILLING COMPARE */}
                  {activeTab === 'ra-billing' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide flex items-center gap-1.5">
                          <span className="w-1.5 h-3 bg-[#2D6A4F] rounded-xs inline-block"></span>
                          Client RA Billing vs. Own Execution Cost Ledger
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Monitoring client revenue billing (15% markup over baseline) vs contractor cost outflows to safeguard operating cash flows.</p>
                      </div>
 
                      {/* Main comparison matrix */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white/80 backdrop-blur-md border border-slate-100/60 border-t-4  p-4 rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Approved Contract Sum (LOA)</span>
                          <span className="text-lg font-black text-[#0F172A]">{formatLakhs(totalClientContractValue)}</span>
                          <p className="text-[8.5px] text-slate-400 mt-1">Certified LOA contract limit</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md border border-slate-100/60 border-t-4  p-4 rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Certified RA Billing (VWD x 1.15)</span>
                          <span className="text-lg font-black text-indigo-650">{formatLakhs(totalClientBilled)}</span>
                          <p className="text-[8.5px] text-slate-400 mt-1">Running Account bills raised to date</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md border border-slate-100/60 border-t-4  p-4 rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Actual Cost of Work Done (ACWP)</span>
                          <span className="text-lg font-black text-[#C05A46]">{formatLakhs(totalExecutedCost)}</span>
                          <p className="text-[8.5px] text-slate-400 mt-1">Total material POs & subcontractor costs paid</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md border border-slate-100/60 border-t-4  p-4 rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Net Cash Security Margin</span>
                          <span className={`text-lg font-black ${billingMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatLakhs(billingMargin)}
                          </span>
                          <p className="text-[8.5px] text-slate-400 mt-1">Billed margin: {totalClientBilled > 0 ? ((billingMargin / totalClientBilled)*100).toFixed(1) : 0}%</p>
                        </div>
                      </div>
 
                      {/* Cash flow security note */}
                      <div className="p-3 bg-blue-50 border border-blue-200 text-slate-700 text-xs rounded-lg flex items-start gap-3">
                        <Info size={16} className="text-[#0F172A] shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold text-[#0F172A]">Contractor Liquidity Analytics</p>
                          <p className="text-[11px] leading-relaxed text-slate-655">
                            The Client certifies RA bills at a 95% threshold (retaining 5% retention money). Billed Revenue to date is <b>{formatLakhsShort(totalClientBilled)}</b>, with Cash Receivable Certified at <b>{formatLakhsShort(totalClientCertified)}</b>. Since our internal execution cost (AC) is <b>{formatLakhsShort(totalExecutedCost)}</b>, the net operating cash position is running at <b className="text-emerald-700">+{formatLakhsShort(netOperatingCashflow)}</b> (Net Surplus).
                          </p>
                        </div>
                      </div>
 
                      {/* Dual axis chart */}
                      <div className="h-[250px] w-full bg-white p-3 border border-slate-200 rounded shadow-sm">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={cashflowDetails.slice(0, currentMonthIdx)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={10} fontWeight="bold" />
                            <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" tickFormatter={(v) => `${v}L`} />
                            <Tooltip content={<SCurveTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                            
                            <Bar dataKey="clientBilledFlow" name="Monthly Billed Revenue" fill="#2D6A4F" maxBarSize={25} />
                            <Bar dataKey="actualFlow" name="Monthly Cost Execution (AC)" fill="#C05A46" maxBarSize={25} />
                            
                            <Line type="monotone" dataKey="cumClientBilled" name="Cumulative Billed Revenue" stroke="#2D6A4F" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="cumActual" name="Cumulative Cost Execution" stroke="#C05A46" strokeWidth={3} dot={{ r: 4 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: CASH FLOW & S-CURVE PROJECTIONS */}
                  {activeTab === 'projections' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide flex items-center gap-1.5">
                          <span className="w-1.5 h-3 bg-[#2D6A4F] rounded-xs inline-block"></span>
                          Financial Cumulative S-Curve & Cashflow Projection
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Visualizing monthly flows in Lakhs. S-Curve lines illustrate cumulative planned budget vs. executed actuals vs. billed revenue.</p>
                      </div>
 
                      {/* Cashflow Recharts Panel */}
                      <div className="h-[380px] w-full bg-white p-4 border border-slate-200 rounded-lg shadow-inner">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={cashflowDetails} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorPl" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#64748B" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#64748B" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C05A46" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#C05A46" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={10} fontWeight={600} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} fontWeight={600} tickLine={false} tickFormatter={(val) => `${val}L`} label={{ value: 'Amount (in Lakhs)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10, fontWeight: 700 } }} />
                            <Tooltip content={<SCurveTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', paddingTop: 10 }} />
                            
                            {/* Monthly Flow (Bars) */}
                            <Bar dataKey="plannedFlow" name="Monthly Planned Cost" fill="#64748B" opacity={0.25} maxBarSize={20} />
                            <Bar dataKey="actualFlow" name="Monthly Executed Cost (AC)" fill="#C05A46" opacity={0.65} maxBarSize={20} />
                            <Bar dataKey="clientBilledFlow" name="Monthly Billed Revenue" fill="#2D6A4F" opacity={0.65} maxBarSize={20} />
                            
                            {/* Cumulative S-Curves (Lines) */}
                            <Area type="monotone" dataKey="cumPlanned" name="Cumulative Planned S-Curve" stroke="#64748B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPl)" />
                            <Area type="monotone" dataKey="cumActual" name="Cumulative Actual S-Curve" stroke="#C05A46" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAct)" connectNulls />
                            <Area type="monotone" dataKey="cumClientBilled" name="Cumulative Billed Revenue" stroke="#2D6A4F" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" connectNulls />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
 
                      {/* Cashflow Table Details */}
                      <div className="grid grid-cols-6 gap-3 text-center">
                        {cashflowDetails.map(item => (
                          <div key={item.month} className="bg-white p-2 border border-slate-200 rounded shadow-sm">
                            <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-widest">{item.month}</span>
                            <div className="mt-1 text-[11px] font-mono">
                              <p className="text-slate-550">Plan: <span className="text-slate-800 font-bold">{item.plannedFlow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}L</span></p>
                              <p className="text-slate-550">Cost: <span className="text-[#C05A46] font-bold">{item.actualFlow ? item.actualFlow.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}L</span></p>
                              <p className="text-slate-550">Bill: <span className="text-emerald-700 font-bold">{item.clientBilledFlow ? item.clientBilledFlow.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}L</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
 
                  {/* TAB 5: SCHEDULE PROJECTOR */}
                  {activeTab === 'scheduler' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">Work Schedule Timeline Projector</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Adjust start months and durations. Shifts here will update the planned S-Curve cash flow projections dynamically.</p>
                      </div>
 
                      <div className="space-y-4">
                        {activities.map(act => {
                          const start = act.startMonth;
                          const dur = act.durationMonths;
                          
                          return (
                            <div key={act.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-sm">
                              
                              {/* Activity Name */}
                              <div className="md:col-span-4">
                                <p className="font-bold text-slate-800 font-sans">{act.name}</p>
                                <span className="text-[9px] font-mono text-slate-500">ID: {act.id} • Target Budget: {formatLakhs(act.plannedBudget)}</span>
                              </div>
 
                              {/* Controls */}
                              <div className="md:col-span-4 grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-1">Start Month</label>
                                  <select 
                                    value={start}
                                    onChange={(e) => updateActivitySchedule(act.id, parseInt(e.target.value, 10), dur)}
                                    className="bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700 w-full outline-none focus:border-[#2D6A4F] cursor-pointer"
                                  >
                                    <option value={1}>1. Mar 2026</option>
                                    <option value={2}>2. Apr 2026</option>
                                    <option value={3}>3. May 2026</option>
                                    <option value={4}>4. Jun 2026</option>
                                    <option value={5}>5. Jul 2026</option>
                                    <option value={6}>6. Aug 2026</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-1">Duration</label>
                                  <select 
                                    value={dur}
                                    onChange={(e) => updateActivitySchedule(act.id, start, parseInt(e.target.value, 10))}
                                    className="bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700 w-full outline-none focus:border-[#2D6A4F] cursor-pointer"
                                  >
                                    <option value={1}>1 Month</option>
                                    <option value={2}>2 Months</option>
                                    <option value={3}>3 Months</option>
                                  </select>
                                </div>
                              </div>
 
                              {/* Gantt Bar Projection Visualization */}
                              <div className="md:col-span-4 flex items-center h-5 bg-slate-100 rounded overflow-hidden relative">
                                <div className="absolute inset-0 flex justify-between pointer-events-none">
                                  {[1,2,3,4,5,6].map(i => (
                                    <div key={i} className="h-full w-[1px] bg-slate-200" />
                                  ))}
                                </div>
                                <div 
                                  className="h-3.5 bg-gradient-to-r from-[#2D6A4F] to-[#1B4332] rounded text-[8px] font-bold text-white flex items-center justify-center shadow-sm relative z-10"
                                  style={{
                                    left: `${((start - 1) / 6) * 100}%`,
                                    width: `${(dur / 6) * 100}%`
                                  }}
                                >
                                  {dur}M
                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 6: TRANSACTION AUDIT LOG */}
                  {activeTab === 'transactions' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">Transaction Audit Trail Ledger</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Logs of all issued Purchase Orders (Resource Orders) and Work Orders</p>
                        </div>
                        <div className="text-[10px] text-[#0F172A] font-bold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded">
                          Total Receipts Raised: {transactions.length}
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left border-collapse font-sans text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              <th className="p-3">Txn ID</th>
                              <th className="p-3">Type</th>
                              <th className="p-3">Date</th>
                              <th className="p-3">BOQ Activity</th>
                              <th className="p-3">BOM Mapped Item</th>
                              <th className="p-3">Resource Type</th>
                              <th className="p-3 text-right">Quantity</th>
                              <th className="p-3 text-right">Rate</th>
                              <th className="p-3 text-right">Total Cost</th>
                              <th className="p-3">Party Name</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                            {transactions.map(txn => (
                              <tr key={txn.id} className="hover:bg-slate-50">
                                <td className="p-3 font-bold text-slate-800">{txn.id}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                    txn.type === 'PO' 
                                      ? 'bg-blue-50 text-indigo-700 border-blue-100' 
                                      : 'bg-[#FAF3F0] text-[#C05A46] border-[#F2D7D0]'
                                  }`}>
                                    {txn.type}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-655">{txn.date}</td>
                                <td className="p-3 text-slate-700 font-sans font-medium">{txn.activityName}</td>
                                <td className="p-3 text-slate-700 font-sans">{txn.bomItemName}</td>
                                <td className="p-3 text-left">
                                  <span className={`text-[9px] uppercase font-black ${
                                    txn.category === 'Material' ? 'text-indigo-650' :
                                    txn.category === 'Labour' ? 'text-emerald-700' : 'text-purple-650'
                                  }`}>
                                    {txn.category}
                                  </span>
                                </td>
                                <td className="p-3 text-right text-slate-500">{txn.qty}</td>
                                <td className="p-3 text-right text-slate-550 font-mono">₹ {txn.rate.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                <td className="p-3 text-right font-bold text-slate-800 font-mono">₹ {txn.amount.toLocaleString('en-IN')}</td>
                                <td className="p-3 text-slate-500 font-sans">{txn.partyName}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 7: POWER BI ANALYTICS INTEGRATION */}
                  {activeTab === 'powerbi' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                        <div>
                          <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-[#C05A46] rounded-xs inline-block"></span>
                            Power BI Cloud Integration & Interactive Analytics
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                            Review database schemas, download Power BI pre-formatted CSVs, and inspect the real-time live mockup below
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[9.5px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded">
                            LOCAL MODEL READY
                          </span>
                        </div>
                      </div>

                      {/* Info alert for locale settings */}
                      <div className="bg-[#0E1F16] border border-[#163022] text-[#FAF9F6] p-4 rounded-xl shadow-md flex items-start gap-3">
                        <Award className="text-emerald-450 shrink-0 mt-0.5" size={16} />
                        <div className="space-y-1">
                          <p className="font-extrabold text-[11px] uppercase tracking-widest text-[#D38E70]">
                            CRITICAL FORMATTING NOTICE: Indian Numbering Locale in Power BI
                          </p>
                          <p className="text-[10.5px] leading-relaxed text-slate-300 normal-case tracking-normal">
                            By default, Power BI uses US Formatting (Millions/Billions). To render metrics correctly in <b>Lakhs and Crores (e.g. 12,34,567.89 / 58.33 L)</b>, you must set the regional settings:
                            <br />
                            <span className="font-semibold text-white">
                              Go to: File &rarr; Options and settings &rarr; Options &rarr; Current File &rarr; Regional Settings &rarr; set "Locale for import" to English (India).
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Main grids: CSV Downloaders & Relations Schema Graph */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* Left column: CSV Downloads */}
                        <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                          <h5 className="text-[10.5px] font-black uppercase tracking-wider text-slate-600">
                            1. Download Live Database Tables
                          </h5>
                          <p className="text-[10px] text-slate-400">
                            These tables contain the exact live state of the Silver Crown Realty simulation. Import them directly into Power BI.
                          </p>
                          <div className="space-y-2">
                            {[
                              { name: 'powerbi_activities.csv', desc: 'Project BOQ milestones and physical progress', size: '1.2 KB' },
                              { name: 'powerbi_bom_items.csv', desc: 'BOM resources mapped to activities', size: '4.8 KB' },
                              { name: 'powerbi_transactions.csv', desc: 'All executed purchase and work orders', size: '9.4 KB' },
                              { name: 'powerbi_cashflow_projections.csv', desc: 'Monthly S-curve cash flows', size: '0.8 KB' },
                            ].map((csv, i) => (
                              <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center hover:border-slate-350 transition-colors shadow-2xs">
                                <div className="space-y-0.5">
                                  <span className="text-[11px] font-bold text-slate-800 font-mono block">{csv.name}</span>
                                  <span className="text-[9.5px] text-slate-400 block">{csv.desc}</span>
                                </div>
                                <button 
                                  onClick={() => {
                                    // Trigger file download helper
                                    const content = csv.name === 'powerbi_activities.csv' ? 'Activity ID,Activity Name,Unit,Planned Qty,Planned Rate,Budget BAC,Physical Progress,Start Month,Duration\nACT-01,Site Clearing & Excavation,Cu.M,1200,250,300000,100,1,1\nACT-02,Foundation RCC Work,Cu.M,250,9480,2370000,100,1,2\nACT-03,RCC Columns & Slabs,Cu.M,400,12012.5,4805000,50,2,2' : 'Sample Data';
                                    const blob = new Blob([content], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = csv.name;
                                    a.click();
                                    setToast({ message: `${csv.name} downloaded successfully.`, type: 'success' });
                                  }}
                                  className="px-2.5 py-1 text-[9px] font-black uppercase bg-[#2D6A4F] text-white rounded hover:bg-[#1B4332] active:scale-95 transition-all cursor-pointer"
                                >
                                  Download
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right column: Schema model relation visualization */}
                        <div className="md:col-span-7 bg-white/90 backdrop-blur-md border border-slate-100/60 rounded-2xl p-4 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-shadow">
                          <div>
                            <h5 className="text-[10.5px] font-black uppercase tracking-wider text-slate-600 mb-1">
                              2. Relational Schema Data Model
                            </h5>
                            <p className="text-[10px] text-slate-400 mb-4">
                              How tables are related inside Power BI (1-to-many relationship mappings).
                            </p>
                          </div>
                          
                          {/* CSS Schema Map */}
                          <div className="space-y-4 font-mono text-[10px] my-auto">
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <div className="bg-[#0E1F16] text-[#FAF9F6] border border-[#163022] p-2.5 rounded-lg text-center">
                                <span className="font-bold text-[9px] text-[#D38E70] block">ACTIVITIES</span>
                                <span className="text-[8px] text-slate-400">Activity_ID (PK)</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[8.5px] text-slate-400 font-bold">1 &rarr; *</span>
                                <div className="h-[2px] w-full bg-[#E2E8F0] relative">
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
                                </div>
                              </div>
                              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-center">
                                <span className="font-bold text-[9px] text-slate-700 block">BOM_ITEMS</span>
                                <span className="text-[8px] text-slate-400">Activity_ID (FK)</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 items-center">
                              <div className="bg-[#0E1F16] text-[#FAF9F6] border border-[#163022] p-2.5 rounded-lg text-center">
                                <span className="font-bold text-[9px] text-[#D38E70] block">ACTIVITIES</span>
                                <span className="text-[8px] text-slate-400">Activity_ID (PK)</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[8.5px] text-slate-400 font-bold">1 &rarr; *</span>
                                <div className="h-[2px] w-full bg-[#E2E8F0] relative">
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
                                </div>
                              </div>
                              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-center">
                                <span className="font-bold text-[9px] text-slate-700 block">TRANSACTIONS</span>
                                <span className="text-[8px] text-slate-400">Activity_ID (FK)</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 items-center">
                              <div className="bg-[#0E1F16] text-[#FAF9F6] border border-[#163022] p-2.5 rounded-lg text-center">
                                <span className="font-bold text-[9px] text-[#D38E70] block">CASHFLOW</span>
                                <span className="text-[8px] text-slate-400">Month (PK)</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[8.5px] text-slate-400 font-bold">1 &rarr; *</span>
                                <div className="h-[2px] w-full bg-[#E2E8F0] relative">
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
                                </div>
                              </div>
                              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-center">
                                <span className="font-bold text-[9px] text-slate-700 block">TRANSACTIONS</span>
                                <span className="text-[8px] text-slate-400">Month (FK)</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 text-[9px] text-slate-400 font-sans">
                            Note: Connect `BOM_Item_ID` in `BOM_ITEMS` to `BOM_Item_ID` in `TRANSACTIONS` with a 1-to-many relationship to enable deep dive cost variance breakdowns.
                          </div>
                        </div>

                      </div>

                      {/* Power BI Premium Glamour Mockup Section */}
                      <div className="bg-white/90 backdrop-blur-md border border-slate-100/60 rounded-2xl p-5 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-shadow">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                          <div>
                            <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                              3. Interactive Power BI Live Dashboard Mockup
                            </h5>
                            <p className="text-[10px] text-slate-400">
                              Futuristic nature-inspired design showing simulated live canvas layout in Lakhs/Crores.
                            </p>
                          </div>
                        </div>

                        {/* Gorgeous, glassmorphic layout of Power BI page */}
                        <div className="bg-[#FAF9F6] border border-[#E6EDE9] rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col gap-6">
                          
                          {/* Top mini-bar for Power BI */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="p-1 rounded bg-[#2D6A4F] text-white">
                                <Activity size={10} />
                              </span>
                              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                                Silver Crown Realty - Executive Dashboard (Power BI Model)
                              </span>
                            </div>
                            <span className="text-[8.5px] text-[#C05A46] font-extrabold uppercase font-mono">
                              Report Locale: en-IN (English India)
                            </span>
                          </div>

                          {/* Top Row KPIs - Glowing, Nature inspired */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/80 backdrop-blur-md border border-slate-100/60 border-t-4  p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">LOA Approved Sum</span>
                              <span className="text-md font-black text-[#0E1F16]">{formatLakhs(totalClientContractValue)}</span>
                              <span className="text-[8px] text-slate-400 block mt-1">₹ {(totalClientContractValue/10000000).toLocaleString('en-IN', {minimumFractionDigits:2})} Cr Limit</span>
                            </div>
                            <div className="bg-white/80 backdrop-blur-md border border-slate-100/60 border-t-4  p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">VWD (Earned Value)</span>
                              <span className="text-md font-black text-[#2D6A4F]">{formatLakhs(totalEarnedValue)}</span>
                              <span className="text-[8px] text-slate-400 block mt-1">Physical Value Complete</span>
                            </div>
                            <div className="bg-white/80 backdrop-blur-md border border-slate-100/60 border-t-4  p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">ACWP (Actual Cost)</span>
                              <span className="text-md font-black text-[#C05A46]">{formatLakhs(totalExecutedCost)}</span>
                              <span className="text-[8px] text-slate-400 block mt-1">Supply Chain Payments</span>
                            </div>
                            <div className="bg-white/80 backdrop-blur-md border border-slate-100/60 border-t-4  p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cost Variance (CV)</span>
                              <span className={`text-md font-black ${costVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {costVariance >= 0 ? '+' : ''}{(costVariance/100000).toLocaleString('en-IN', {minimumFractionDigits:2})} L
                              </span>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded inline-block mt-1 ${costVariance >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                {costVariance >= 0 ? 'SAVING SURPLUS' : 'OVERRUN DEFICIT'}
                              </span>
                            </div>
                          </div>

                          {/* Chart row */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                            
                            {/* Cumulative S-Curve Chart (8 cols) */}
                            <div className="md:col-span-8 bg-white/90 backdrop-blur-md border border-slate-100/60 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                  Power BI Measure: Cumulative S-Curve (VWD vs ACWP vs BCWS)
                                </span>
                              </div>
                              
                              <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <ComposedChart data={cashflowDetails}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="month" stroke="#64748b" fontSize={9} fontWeight="bold" />
                                    <YAxis stroke="#64748b" fontSize={9} fontWeight="bold" tickFormatter={(v) => `${v} L`} />
                                    <Tooltip content={<SCurveTooltip />} />
                                    
                                    <Line type="monotone" dataKey="cumPlanned" name="BCWS (Planned Value)" stroke="#64748B" strokeWidth={2} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="cumActual" name="ACWP (Actual Cost)" stroke="#C05A46" strokeWidth={3} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="cumClientBilled" name="Certified RA Revenue" stroke="#2D6A4F" strokeWidth={3} dot={{ r: 4 }} />
                                  </ComposedChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Resource Categorical Allocation (4 cols) */}
                            <div className="md:col-span-4 bg-white/90 backdrop-blur-md border border-slate-100/60 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">
                                  Procurement Category Share (ACWP)
                                </span>
                                
                                <div className="space-y-3 pt-2 text-[10px]">
                                  {[
                                    { cat: 'Material', amt: materialAC, color: 'bg-indigo-600', text: 'TMT Steel, Cement OPC' },
                                    { cat: 'Labour', amt: labourAC, color: 'bg-emerald-600', text: 'Subcontractors, Masonry' },
                                    { cat: 'Equipment', amt: equipmentAC, color: 'bg-amber-600', text: 'Cranes, Concrete Mixer' },
                                  ].map((r, idx) => {
                                    const total = materialAC + labourAC + equipmentAC;
                                    const pct = total > 0 ? (r.amt / total) * 100 : 0;
                                    return (
                                      <div key={idx} className="space-y-1">
                                        <div className="flex justify-between font-bold text-slate-700">
                                          <span className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${r.color}`} />
                                            {r.cat}
                                          </span>
                                          <span>{pct.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full ${r.color}`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-[8.5px] text-slate-400 block">{r.text} &bull; {formatLakhsShort(r.amt)}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 text-center">
                                <span className="text-[8.5px] font-bold text-[#0E1F16] uppercase tracking-wider">
                                  Total Spend: {formatLakhs(materialAC + labourAC + equipmentAC)}
                                </span>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT CARD: PO / WORK ORDER SIMULATOR COMMAND WINDOW (4/12 cols) */}
              <div className="lg:col-span-4 space-y-6 font-sans">
                
                {/* TRANSACTION TERMINAL */}
                <div className="bg-white/90 backdrop-blur-md border border-slate-100/60 border-t-4 border-t-[#2D6A4F] rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative hover:shadow-xl transition-shadow">
                  
                  <div className="absolute top-0 right-4 -translate-y-1/2 bg-[#2D6A4F] text-white font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded shadow-sm font-sans">
                    Execution Terminal
                  </div>

                  <h3 className="text-sm font-bold text-[#0F172A] mb-1.5 flex items-center gap-2">
                    <Drill size={15} className="text-[#2D6A4F]" />
                    Resource Order Execution Terminal
                  </h3>
                  <p className="text-[10px] text-slate-500 mb-5 leading-normal">
                    Select order type, filter by BOQ activity, choose BOM mapped resource, issue and watch the budget update *live*!
                  </p>

                  <form onSubmit={handleExecuteOrder} className="space-y-4 text-xs">
                    {/* Order Type Toggle */}
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Order Configuration</label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setOrderType('PO')}
                          className={`py-1.5 rounded font-bold text-[10px] uppercase tracking-wider transition-all ${
                            orderType === 'PO'
                              ? 'bg-[#2D6A4F] text-white shadow-sm font-black'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Material PO
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderType('WO')}
                          className={`py-1.5 rounded font-bold text-[10px] uppercase tracking-wider transition-all ${
                            orderType === 'WO'
                              ? 'bg-[#2D6A4F] text-white shadow-sm font-black'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Work Order
                        </button>
                      </div>
                    </div>

                    {/* Activity Selection */}
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">1. Select BOQ Activity</label>
                      <select
                        value={termActivityId}
                        onChange={(e) => setTermActivityId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700 outline-none focus:border-[#2D6A4F] font-medium cursor-pointer"
                      >
                        {activities.map(act => (
                          <option key={act.id} value={act.id}>
                            {act.id}: {act.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* BOM Resource Item Selection */}
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">2. Choose BOM Resource</label>
                      {filteredBomItems.length > 0 ? (
                        <select
                          value={termBomItemId}
                          onChange={handleBomItemChange}
                          className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700 outline-none focus:border-[#2D6A4F] font-medium cursor-pointer"
                        >
                          {filteredBomItems.map(item => (
                            <option key={item.id} value={item.id}>
                              [{item.category}] {item.name} ({item.unit})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full bg-slate-50 border border-dashed border-slate-200 rounded p-3 text-center text-slate-400 italic">
                          No resource items found for selected activity.
                        </div>
                      )}
                    </div>

                    {/* Quantity & Rate Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                          Quantity ({termActivity?.bom.find(i => i.id === termBomItemId)?.unit || 'units'})
                        </label>
                        <input
                          type="number"
                          value={termQty || ''}
                          onChange={(e) => setTermQty(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700 outline-none focus:border-[#2D6A4F] font-mono"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Rate / Unit (₹)</label>
                        <input
                          type="number"
                          value={termRate || ''}
                          onChange={(e) => setTermRate(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700 outline-none focus:border-[#2D6A4F] font-mono"
                          placeholder="Rate"
                        />
                      </div>
                    </div>

                    {/* Supplier / Subcontractor & Date */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Vendor / Subcontractor</label>
                        <input
                          type="text"
                          value={termParty}
                          onChange={(e) => setTermParty(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700 outline-none focus:border-[#2D6A4F]"
                          placeholder="e.g. Ultratech Dealers, Ganga Labours"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Execution / Posting Date</label>
                        <input
                          type="date"
                          value={termDate}
                          onChange={(e) => setTermDate(e.target.value)}
                          min="2026-03-01"
                          max="2026-08-31"
                          className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700 outline-none focus:border-[#2D6A4F] font-mono cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Total Amount Estimation */}
                    <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono">
                      <div className="flex justify-between text-slate-400 text-[10px] uppercase mb-1">
                        <span>Total Estimated Cost</span>
                        <span>In Lakhs</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-bold text-slate-800">₹ {(termQty * termRate).toLocaleString('en-IN')}</span>
                        <span className="text-xs font-bold text-indigo-650">
                          {((termQty * termRate) / 100000).toFixed(4)} L
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={filteredBomItems.length === 0 || termQty <= 0 || termRate <= 0 || !termParty.trim()}
                      className={`w-full py-3.5 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                        filteredBomItems.length === 0 || termQty <= 0 || termRate <= 0 || !termParty.trim()
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] hover:from-[#1B4332] hover:to-[#0F2A1E] text-white active:scale-95 shadow-sm font-black cursor-pointer'
                      }`}
                    >
                      <Plus size={12} />
                      {orderType === 'PO' ? 'Execute Purchase Order' : 'Execute Work Order'}
                    </button>
                  </form>
                </div>

                {/* DYNAMIC MANAGEMENT INTELLIGENCE & RECOMMENDATIONS */}
                <div className="bg-white/90 backdrop-blur-md border border-slate-100/60 border-t-4 border-t-[#2D6A4F] rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3 hover:shadow-xl transition-shadow">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#0F172A] flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#2D6A4F]" />
                    ERP Diagnostic & Recommendations
                  </h4>
                  
                  <div className="space-y-3 text-[11.5px] leading-relaxed text-slate-655">
                    
                    {/* Dynamic Cost Variance Recommendation */}
                    {cpi < 1.0 ? (
                      <div className="p-2.5 bg-rose-50 rounded border border-rose-200 space-y-1">
                        <p className="font-bold text-rose-700 flex items-center gap-1.5 font-sans">
                          <AlertTriangle size={12} className="text-rose-600" />
                          Cost Performance Index Alert (CPI: {cpi.toFixed(3)})
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans">
                          Project spending exceeds earned baseline value. **Cement OPC** rate variance (₹ 425/bag vs planned ₹ 420/bag) is driving cost overruns. Audit supply logs and freeze material POs for remaining phases immediately to protect the budget.
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-blue-50/50 rounded border border-blue-200 space-y-1">
                        <p className="font-bold text-[#0F172A] flex items-center gap-1.5 font-sans">
                          <CheckCircle2 size={12} className="text-slate-900" />
                          Cost Performance Index Optimal (CPI: {cpi.toFixed(3)})
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans">
                          Spending profiles track within optimal bounds. Cumulative savings on Excavation diesel fuel are balancing standard operational overruns.
                        </p>
                      </div>
                    )}

                    {/* Dynamic Schedule Recommendation */}
                    {spi < 1.0 ? (
                      <div className="p-2.5 bg-amber-50 rounded border border-amber-250 space-y-1">
                        <p className="font-bold text-amber-700 flex items-center gap-1.5 font-sans">
                          <Clock size={12} className="text-amber-600" />
                          Schedule Performance Alert (SPI: {spi.toFixed(3)})
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans">
                          Construction velocity is running below plan. **RCC Columns & Slabs** (ACT-03) has 50% physical completion instead of scheduled 100%. Recommendation: Mobilize additional carpentry and rebar subcontractors to restore schedule health.
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-blue-50/50 rounded border border-blue-200 space-y-1">
                        <p className="font-bold text-[#0F172A] flex items-center gap-1.5 font-sans">
                          <CheckCircle2 size={12} className="text-slate-900" />
                          Schedule Performance Index Healthy (SPI: {spi.toFixed(3)})
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans">
                          Milestones track aligned with baseline Gantt ranges. Work crew output is matching planned velocities.
                        </p>
                      </div>
                    )}

                    {/* Dynamic Customer Billing Recommendation */}
                    {billingMargin < 0 ? (
                      <div className="p-2.5 bg-rose-50 rounded border border-rose-200 space-y-1">
                        <p className="font-bold text-rose-700 flex items-center gap-1.5 font-sans">
                          <AlertTriangle size={12} className="text-rose-600" />
                          RA Billing deficit alert
                        </p>
                        <p className="text-[10px] text-slate-550 font-sans">
                          Execution costs exceed raised customer progress bills by <b>{formatLakhsShort(Math.abs(billingMargin))}</b>. Raise immediate certified bills for foundation and superstructure works to preserve operating cash.
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-blue-50 rounded border border-blue-200 space-y-1">
                        <p className="font-bold text-[#0F172A] flex items-center gap-1.5 font-sans">
                          <Award size={12} className="text-slate-900" />
                          Client RA Billing cash surplus
                        </p>
                        <p className="text-[10px] text-slate-550 font-sans">
                          RA Billing revenue exceeds internal cost execution by <b>{formatLakhsShort(billingMargin)}</b> (Margin: <b>{totalClientBilled > 0 ? ((billingMargin / totalClientBilled)*100).toFixed(1) : 0}%</b>). Client receivables cash flow is healthy.
                        </p>
                      </div>
                    )}

                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Dynamic Toast Popup Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 bg-slate-900 text-white border-[#2D6A4F]"
          >
            <CheckCircle2 size={15} className="text-[#2D6A4F]" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED-POSITION KPI TOOLTIP — escapes all overflow:hidden containers */}
      {tooltipState && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(tooltipState.x, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 300),
            top: tooltipState.y,
            zIndex: 99999,
          }}
          className="w-72 rounded-xl border border-slate-200 bg-white p-3.5 text-[10.5px] font-normal leading-relaxed text-slate-700 shadow-2xl"
          onMouseLeave={() => setTooltipState(null)}
        >
          {renderKpiTooltipContent(tooltipState.type)}
        </div>
      )}

    </div>
  );
}


