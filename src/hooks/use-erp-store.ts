'use client';

import { useState, useCallback, useMemo } from 'react';
import { ERPActivity, ERPBomItem, Transaction, ResourceMetric } from '@/types';

// Helper to extract month name from transaction date
const getMonthFromDate = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length < 2) return 'Mar';
  const monthNum = parseInt(parts[1], 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNum - 1] || 'Mar';
};

const PROJECT_MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

// 10 Construction activities common in real estate with BOM mappings
const INITIAL_ACTIVITIES: ERPActivity[] = [
  {
    id: 'ACT-01',
    name: 'Site Clearing & Excavation',
    unit: 'Cu.M',
    plannedQty: 1200,
    plannedRate: 250,
    plannedBudget: 300000,
    physicalProgress: 100,
    startMonth: 1, // Mar
    durationMonths: 1,
    bom: [
      { id: 'BOM-01-M1', name: 'Diesel Fuel', category: 'Material', unit: 'Litres', plannedQty: 2000, plannedRate: 95, plannedAmount: 190000, executedQty: 2000, executedAmount: 186000, poWOIssued: 2000 },
      { id: 'BOM-01-L1', name: 'Excavator Operator', category: 'Labour', unit: 'Hours', plannedQty: 120, plannedRate: 350, plannedAmount: 42000, executedQty: 120, executedAmount: 42000, poWOIssued: 120 },
      { id: 'BOM-01-L2', name: 'Unskilled Labor', category: 'Labour', unit: 'Hours', plannedQty: 200, plannedRate: 150, plannedAmount: 30000, executedQty: 210, executedAmount: 31500, poWOIssued: 210 },
      { id: 'BOM-01-E1', name: 'Hydraulic Excavator', category: 'Equipment', unit: 'Days', plannedQty: 10, plannedRate: 3800, plannedAmount: 38000, executedQty: 10, executedAmount: 38000, poWOIssued: 10 },
    ]
  },
  {
    id: 'ACT-02',
    name: 'Foundation RCC Work',
    unit: 'Cu.M',
    plannedQty: 250,
    plannedRate: 9480,
    plannedBudget: 2370000,
    physicalProgress: 100,
    startMonth: 1, // Mar
    durationMonths: 2, // Mar-Apr
    bom: [
      { id: 'BOM-02-M1', name: 'Cement OPC 53 Grade', category: 'Material', unit: 'Bags', plannedQty: 1100, plannedRate: 420, plannedAmount: 462000, executedQty: 1100, executedAmount: 467500, poWOIssued: 1100 },
      { id: 'BOM-02-M2', name: 'River Sand', category: 'Material', unit: 'Brass', plannedQty: 80, plannedRate: 6500, plannedAmount: 520000, executedQty: 80, executedAmount: 512000, poWOIssued: 80 },
      { id: 'BOM-02-M3', name: 'Reinforcement Steel', category: 'Material', unit: 'Tons', plannedQty: 18, plannedRate: 62000, plannedAmount: 1116000, executedQty: 18, executedAmount: 1134000, poWOIssued: 18 },
      { id: 'BOM-02-L1', name: 'Concrete Mason', category: 'Labour', unit: 'Days', plannedQty: 150, plannedRate: 700, plannedAmount: 105000, executedQty: 150, executedAmount: 105000, poWOIssued: 150 },
      { id: 'BOM-02-L2', name: 'Helper Crew', category: 'Labour', unit: 'Days', plannedQty: 300, plannedRate: 400, plannedAmount: 120000, executedQty: 290, executedAmount: 116000, poWOIssued: 290 },
      { id: 'BOM-02-E1', name: 'Concrete Mixer & Chute', category: 'Equipment', unit: 'Days', plannedQty: 15, plannedRate: 2500, plannedAmount: 37500, executedQty: 15, executedAmount: 37500, poWOIssued: 15 },
      { id: 'BOM-02-E2', name: 'Concrete Vibrator', category: 'Equipment', unit: 'Days', plannedQty: 15, plannedRate: 633.33, plannedAmount: 9500, executedQty: 15, executedAmount: 9000, poWOIssued: 15 },
    ]
  },
  {
    id: 'ACT-03',
    name: 'RCC Columns & Slabs (Superstructure)',
    unit: 'Cu.M',
    plannedQty: 400,
    plannedRate: 12012.5,
    plannedBudget: 4805000,
    physicalProgress: 50,
    startMonth: 2, // Apr
    durationMonths: 2, // Apr-May
    bom: [
      { id: 'BOM-03-M1', name: 'Ready-Mix Concrete M25', category: 'Material', unit: 'Cu.M', plannedQty: 400, plannedRate: 6500, plannedAmount: 2600000, executedQty: 200, executedAmount: 1320000, poWOIssued: 200 },
      { id: 'BOM-03-M2', name: 'TMT Steel Rebars', category: 'Material', unit: 'Tons', plannedQty: 28, plannedRate: 65000, plannedAmount: 1820000, executedQty: 15, executedAmount: 975000, poWOIssued: 15 },
      { id: 'BOM-03-L1', name: 'Carpenter / Shuttering crew', category: 'Labour', unit: 'Days', plannedQty: 200, plannedRate: 800, plannedAmount: 160000, executedQty: 100, executedAmount: 80000, poWOIssued: 100 },
      { id: 'BOM-03-L2', name: 'Steel Bar Bender & Binder', category: 'Labour', unit: 'Days', plannedQty: 150, plannedRate: 750, plannedAmount: 112500, executedQty: 80, executedAmount: 60000, poWOIssued: 80 },
      { id: 'BOM-03-E1', name: 'Tower Crane Rental', category: 'Equipment', unit: 'Days', plannedQty: 30, plannedRate: 3000, plannedAmount: 90000, executedQty: 15, executedAmount: 45000, poWOIssued: 15 },
      { id: 'BOM-03-E2', name: 'Shuttering Scaffolding Set', category: 'Equipment', unit: 'Days', plannedQty: 30, plannedRate: 750, plannedAmount: 22500, executedQty: 15, executedAmount: 11250, poWOIssued: 15 },
    ]
  },
  {
    id: 'ACT-04',
    name: 'Brick Masonry Work',
    unit: 'Sq.M',
    plannedQty: 1500,
    plannedRate: 1200,
    plannedBudget: 1800000,
    physicalProgress: 0,
    startMonth: 3, // May
    durationMonths: 2, // May-Jun
    bom: [
      { id: 'BOM-04-M1', name: 'Clay Bricks', category: 'Material', unit: 'Nos', plannedQty: 75000, plannedRate: 12, plannedAmount: 900000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-04-M2', name: 'PPC Cement', category: 'Material', unit: 'Bags', plannedQty: 450, plannedRate: 390, plannedAmount: 175500, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-04-M3', name: 'Fine Plaster Sand', category: 'Material', unit: 'Brass', plannedQty: 60, plannedRate: 6000, plannedAmount: 360000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-04-L1', name: 'Mason Crew', category: 'Labour', unit: 'Days', plannedQty: 220, plannedRate: 750, plannedAmount: 165000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-04-L2', name: 'Mason Helpers', category: 'Labour', unit: 'Days', plannedQty: 440, plannedRate: 400, plannedAmount: 176000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-04-E1', name: 'Site Wheelbarrows', category: 'Equipment', unit: 'Units', plannedQty: 4, plannedRate: 5875, plannedAmount: 23500, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
    ]
  },
  {
    id: 'ACT-05',
    name: 'Electrical Conduit & Wiring (MEP)',
    unit: 'R.M',
    plannedQty: 2200,
    plannedRate: 220,
    plannedBudget: 484000,
    physicalProgress: 0,
    startMonth: 4, // Jun
    durationMonths: 1,
    bom: [
      { id: 'BOM-05-M1', name: 'PVC Conduits 25mm', category: 'Material', unit: 'Metres', plannedQty: 2200, plannedRate: 45, plannedAmount: 99000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-05-M2', name: 'Copper Wires FR', category: 'Material', unit: 'Coils', plannedQty: 80, plannedRate: 2800, plannedAmount: 224000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-05-L1', name: 'Lead Electrician', category: 'Labour', unit: 'Days', plannedQty: 120, plannedRate: 700, plannedAmount: 84000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-05-L2', name: 'Electrician Helper', category: 'Labour', unit: 'Days', plannedQty: 120, plannedRate: 400, plannedAmount: 48000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-05-E1', name: 'Wall Grooving Machine', category: 'Equipment', unit: 'Days', plannedQty: 15, plannedRate: 1933.33, plannedAmount: 29000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
    ]
  },
  {
    id: 'ACT-06',
    name: 'Plumbing & Drainage Piping (MEP)',
    unit: 'R.M',
    plannedQty: 1100,
    plannedRate: 350,
    plannedBudget: 385000,
    physicalProgress: 0,
    startMonth: 4, // Jun
    durationMonths: 2, // Jun-Jul
    bom: [
      { id: 'BOM-06-M1', name: 'CPVC Pipes 3/4" & 1"', category: 'Material', unit: 'Metres', plannedQty: 1100, plannedRate: 180, plannedAmount: 198000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-06-M2', name: 'PVC Drainage Pipes 4"', category: 'Material', unit: 'Metres', plannedQty: 400, plannedRate: 220, plannedAmount: 88000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-06-L1', name: 'Plumber Specialist', category: 'Labour', unit: 'Days', plannedQty: 75, plannedRate: 750, plannedAmount: 56250, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-06-L2', name: 'Plumber Helpers', category: 'Labour', unit: 'Days', plannedQty: 75, plannedRate: 400, plannedAmount: 30000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-06-E1', name: 'Pipe Fusion & Threader Machine', category: 'Equipment', unit: 'Days', plannedQty: 15, plannedRate: 850, plannedAmount: 12750, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
    ]
  },
  {
    id: 'ACT-07',
    name: 'Internal Plastering Work',
    unit: 'Sq.M',
    plannedQty: 3500,
    plannedRate: 380,
    plannedBudget: 1330000,
    physicalProgress: 0,
    startMonth: 4, // Jun
    durationMonths: 2, // Jun-Jul
    bom: [
      { id: 'BOM-07-M1', name: 'Gypsum Plaster Bags', category: 'Material', unit: 'Bags', plannedQty: 1400, plannedRate: 380, plannedAmount: 532000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-07-M2', name: 'Plaster Sand', category: 'Material', unit: 'Brass', plannedQty: 70, plannedRate: 6000, plannedAmount: 420000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-07-M3', name: 'Portland Cement', category: 'Material', unit: 'Bags', plannedQty: 300, plannedRate: 420, plannedAmount: 126000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-07-L1', name: 'Plastering Mason', category: 'Labour', unit: 'Days', plannedQty: 180, plannedRate: 700, plannedAmount: 126000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-07-L2', name: 'Plastering Helpers', category: 'Labour', unit: 'Days', plannedQty: 250, plannedRate: 400, plannedAmount: 100000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-07-E1', name: 'Mortar Spray Machine', category: 'Equipment', unit: 'Days', plannedQty: 10, plannedRate: 2600, plannedAmount: 26000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
    ]
  },
  {
    id: 'ACT-08',
    name: 'Flooring & Wall Tiling',
    unit: 'Sq.M',
    plannedQty: 800,
    plannedRate: 2100,
    plannedBudget: 1680000,
    physicalProgress: 0,
    startMonth: 5, // Jul
    durationMonths: 1,
    bom: [
      { id: 'BOM-08-M1', name: 'Vitrified Tiles 2x2', category: 'Material', unit: 'Sq.M', plannedQty: 800, plannedRate: 1100, plannedAmount: 880000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-08-M2', name: 'Tile Adhesive Bags', category: 'Material', unit: 'Bags', plannedQty: 350, plannedRate: 650, plannedAmount: 227500, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-08-M3', name: 'White Cement', category: 'Material', unit: 'Bags', plannedQty: 50, plannedRate: 450, plannedAmount: 22500, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-08-M4', name: 'Granite/Marble Trims', category: 'Material', unit: 'Sq.M', plannedQty: 150, plannedRate: 1908, plannedAmount: 286200, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-08-L1', name: 'Tile Layer Specialist', category: 'Labour', unit: 'Days', plannedQty: 160, plannedRate: 850, plannedAmount: 136000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-08-L2', name: 'Flooring Helpers', category: 'Labour', unit: 'Days', plannedQty: 240, plannedRate: 400, plannedAmount: 96000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-08-E1', name: 'Heavy Duty Tile Cutter', category: 'Equipment', unit: 'Days', plannedQty: 20, plannedRate: 1590, plannedAmount: 31800, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
    ]
  },
  {
    id: 'ACT-09',
    name: 'Chemical Waterproofing (Wet Areas)',
    unit: 'Sq.M',
    plannedQty: 600,
    plannedRate: 550,
    plannedBudget: 330000,
    physicalProgress: 0,
    startMonth: 5, // Jul
    durationMonths: 1,
    bom: [
      { id: 'BOM-09-M1', name: 'Waterproofing Membrane Chem', category: 'Material', unit: 'Cans', plannedQty: 120, plannedRate: 1800, plannedAmount: 216000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-09-M2', name: 'SBR Polymer Primer', category: 'Material', unit: 'Cans', plannedQty: 30, plannedRate: 1200, plannedAmount: 36000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-09-L1', name: 'Coating Applicator Specialist', category: 'Labour', unit: 'Days', plannedQty: 60, plannedRate: 800, plannedAmount: 48000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-09-L2', name: 'Coating Helpers', category: 'Labour', unit: 'Days', plannedQty: 60, plannedRate: 400, plannedAmount: 24000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-09-E1', name: 'Chemical Spray Gun & Blower', category: 'Equipment', unit: 'Days', plannedQty: 10, plannedRate: 600, plannedAmount: 6000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
    ]
  },
  {
    id: 'ACT-10',
    name: 'Painting & Finishing',
    unit: 'Sq.M',
    plannedQty: 4200,
    plannedRate: 280,
    plannedBudget: 1176000,
    physicalProgress: 0,
    startMonth: 5, // Jul
    durationMonths: 2, // Jul-Aug
    bom: [
      { id: 'BOM-10-M1', name: 'Acrylic Wall Putty', category: 'Material', unit: 'Bags', plannedQty: 300, plannedRate: 650, plannedAmount: 195000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-10-M2', name: 'Acrylic Emulsion Paint', category: 'Material', unit: 'Litres', plannedQty: 1800, plannedRate: 280, plannedAmount: 504000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-10-M3', name: 'Acrylic Primer Paint', category: 'Material', unit: 'Litres', plannedQty: 600, plannedRate: 160, plannedAmount: 96000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-10-L1', name: 'Master Painter', category: 'Labour', unit: 'Days', plannedQty: 280, plannedRate: 750, plannedAmount: 210000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-10-L2', name: 'Painter Helper', category: 'Labour', unit: 'Days', plannedQty: 280, plannedRate: 400, plannedAmount: 112000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
      { id: 'BOM-10-E1', name: 'Electric Sanding Machine & Mixer', category: 'Equipment', unit: 'Days', plannedQty: 30, plannedRate: 1966.67, plannedAmount: 59000, executedQty: 0, executedAmount: 0, poWOIssued: 0 },
    ]
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  // Excavation - Completed March 2026
  { id: 'TXN-PO-001', type: 'PO', activityId: 'ACT-01', activityName: 'Site Clearing & Excavation', bomItemId: 'BOM-01-M1', bomItemName: 'Diesel Fuel', category: 'Material', qty: 2000, rate: 93, amount: 186000, partyName: 'Bharat Petroleum Corp.', date: '2026-03-05', month: 'Mar' },
  { id: 'TXN-WO-001', type: 'WO', activityId: 'ACT-01', activityName: 'Site Clearing & Excavation', bomItemId: 'BOM-01-L1', bomItemName: 'Excavator Operator', category: 'Labour', qty: 120, rate: 350, amount: 42000, partyName: 'Super Infrastructures', date: '2026-03-08', month: 'Mar' },
  { id: 'TXN-WO-002', type: 'WO', activityId: 'ACT-01', activityName: 'Site Clearing & Excavation', bomItemId: 'BOM-01-L2', bomItemName: 'Unskilled Labor', category: 'Labour', qty: 210, rate: 150, amount: 31500, partyName: 'Ramu Contractors Ltd.', date: '2026-03-10', month: 'Mar' },
  { id: 'TXN-WO-003', type: 'WO', activityId: 'ACT-01', activityName: 'Site Clearing & Excavation', bomItemId: 'BOM-01-E1', bomItemName: 'Hydraulic Excavator', category: 'Equipment', qty: 10, rate: 3800, amount: 38000, partyName: 'EarthMovers rental agency', date: '2026-03-10', month: 'Mar' },
  
  // Foundation - Completed March/April 2026
  { id: 'TXN-PO-002', type: 'PO', activityId: 'ACT-02', activityName: 'Foundation RCC Work', bomItemId: 'BOM-02-M1', bomItemName: 'Cement OPC 53 Grade', category: 'Material', qty: 1100, rate: 425, amount: 467500, partyName: 'Ultratech Cement Depot', date: '2026-03-20', month: 'Mar' },
  { id: 'TXN-PO-003', type: 'PO', activityId: 'ACT-02', activityName: 'Foundation RCC Work', bomItemId: 'BOM-02-M2', bomItemName: 'River Sand', category: 'Material', qty: 80, rate: 6400, amount: 512000, partyName: 'Local Quarry Syndicate', date: '2026-03-22', month: 'Mar' },
  { id: 'TXN-PO-004', type: 'PO', activityId: 'ACT-02', activityName: 'Foundation RCC Work', bomItemId: 'BOM-02-M3', bomItemName: 'Reinforcement Steel', category: 'Material', qty: 18, rate: 63000, amount: 1134000, partyName: 'Tata Tiscon Steel Yards', date: '2026-03-25', month: 'Mar' },
  
  { id: 'TXN-WO-004', type: 'WO', activityId: 'ACT-02', activityName: 'Foundation RCC Work', bomItemId: 'BOM-02-L1', bomItemName: 'Concrete Mason', category: 'Labour', qty: 150, rate: 700, amount: 105000, partyName: 'Ganga Labour Co.', date: '2026-04-02', month: 'Apr' },
  { id: 'TXN-WO-005', type: 'WO', activityId: 'ACT-02', activityName: 'Foundation RCC Work', bomItemId: 'BOM-02-L2', bomItemName: 'Helper Crew', category: 'Labour', qty: 290, rate: 400, amount: 116000, partyName: 'Ganga Labour Co.', date: '2026-04-05', month: 'Apr' },
  { id: 'TXN-WO-006', type: 'WO', activityId: 'ACT-02', activityName: 'Foundation RCC Work', bomItemId: 'BOM-02-E1', bomItemName: 'Concrete Mixer & Chute', category: 'Equipment', qty: 15, rate: 2500, amount: 37500, partyName: 'EquipRental Mumbai', date: '2026-04-05', month: 'Apr' },
  { id: 'TXN-WO-007', type: 'WO', activityId: 'ACT-02', activityName: 'Foundation RCC Work', bomItemId: 'BOM-02-E2', bomItemName: 'Concrete Vibrator', category: 'Equipment', qty: 15, rate: 600, amount: 9000, partyName: 'EquipRental Mumbai', date: '2026-04-05', month: 'Apr' },

  // RCC Superstructure - Partial March-May 2026
  { id: 'TXN-PO-005', type: 'PO', activityId: 'ACT-03', activityName: 'RCC Columns & Slabs (Superstructure)', bomItemId: 'BOM-03-M1', bomItemName: 'Ready-Mix Concrete M25', category: 'Material', qty: 200, rate: 6600, amount: 1320000, partyName: 'Lafarge RMC Plant', date: '2026-04-28', month: 'Apr' },
  { id: 'TXN-PO-006', type: 'PO', activityId: 'ACT-03', activityName: 'RCC Columns & Slabs (Superstructure)', bomItemId: 'BOM-03-M2', bomItemName: 'TMT Steel Rebars', category: 'Material', qty: 15, rate: 65000, amount: 975000, partyName: 'JSW Steel Distributor', date: '2026-05-05', month: 'May' },
  { id: 'TXN-WO-008', type: 'WO', activityId: 'ACT-03', activityName: 'RCC Columns & Slabs (Superstructure)', bomItemId: 'BOM-03-L1', bomItemName: 'Carpenter / Shuttering crew', category: 'Labour', qty: 100, rate: 800, amount: 80000, partyName: 'Om Shuttering Agencies', date: '2026-05-10', month: 'May' },
  { id: 'TXN-WO-009', type: 'WO', activityId: 'ACT-03', activityName: 'RCC Columns & Slabs (Superstructure)', bomItemId: 'BOM-03-L2', bomItemName: 'Steel Bar Bender & Binder', category: 'Labour', qty: 80, rate: 750, amount: 60000, partyName: 'Mourya Steelbinders', date: '2026-05-12', month: 'May' },
  { id: 'TXN-WO-010', type: 'WO', activityId: 'ACT-03', activityName: 'RCC Columns & Slabs (Superstructure)', bomItemId: 'BOM-03-E1', bomItemName: 'Tower Crane Rental', category: 'Equipment', qty: 15, rate: 3000, amount: 45000, partyName: 'Apex Cranes Ltd.', date: '2026-05-15', month: 'May' },
  { id: 'TXN-WO-011', type: 'WO', activityId: 'ACT-03', activityName: 'RCC Columns & Slabs (Superstructure)', bomItemId: 'BOM-03-E2', bomItemName: 'Shuttering Scaffolding Set', category: 'Equipment', qty: 15, rate: 750, amount: 11250, partyName: 'Om Shuttering Agencies', date: '2026-05-15', month: 'May' },
];

export const useErpStore = () => {
  const [activities, setActivities] = useState<ERPActivity[]>(INITIAL_ACTIVITIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [currentMonthIdx, setCurrentMonthIdx] = useState<number>(3); // May (Index 3 of 6 months)

  const currentMonthName = useMemo(() => PROJECT_MONTHS[currentMonthIdx - 1], [currentMonthIdx]);

  // Total planned budget (BAC)
  const totalPlannedBudget = useMemo(() => {
    return activities.reduce((sum, act) => sum + act.plannedBudget, 0);
  }, [activities]);

  // Total executed cost (AC)
  const totalExecutedCost = useMemo(() => {
    return transactions.reduce((sum, txn) => sum + txn.amount, 0);
  }, [transactions]);

  // Client billing values (15% markup over internal cost structure)
  // Contract Value = BAC * 1.15
  const totalClientContractValue = useMemo(() => {
    return totalPlannedBudget * 1.15;
  }, [totalPlannedBudget]);

  // Total Client Billed (Cumulative Client RA Billing) based on physical progress achieved
  const totalClientBilled = useMemo(() => {
    return activities.reduce((sum, act) => {
      const actContractVal = act.plannedBudget * 1.15;
      return sum + (actContractVal * act.physicalProgress) / 100;
    }, 0);
  }, [activities]);

  // Client RA Bill Certified (Certified is typically 95% of progress billing, rest is retention)
  const totalClientCertified = useMemo(() => {
    return totalClientBilled * 0.95;
  }, [totalClientBilled]);

  const billingMargin = totalClientBilled - totalExecutedCost;
  const netOperatingCashflow = totalClientCertified - totalExecutedCost;

  // Calculate expected progress of each activity based on scheduling and current month
  const expectedProgressMap = useMemo(() => {
    const map: Record<string, number> = {};
    
    activities.forEach(act => {
      const start = act.startMonth;
      const duration = act.durationMonths;
      const end = start + duration - 1;
      
      if (currentMonthIdx > end) {
        map[act.id] = 100; // Expected to be complete
      } else if (currentMonthIdx < start) {
        map[act.id] = 0; // Not yet scheduled to start
      } else {
        const elapsedMonths = currentMonthIdx - start + 1;
        const progress = Math.min(100, Math.round((elapsedMonths / duration) * 100));
        map[act.id] = progress;
      }
    });
    
    return map;
  }, [activities, currentMonthIdx]);

  // Total Planned Value (PV) up to current month
  const totalPlannedValue = useMemo(() => {
    return activities.reduce((sum, act) => {
      const expProgress = expectedProgressMap[act.id] || 0;
      return sum + (act.plannedBudget * expProgress) / 100;
    }, 0);
  }, [activities, expectedProgressMap]);

  // Total Earned Value (EV) based on physical progress
  const totalEarnedValue = useMemo(() => {
    return activities.reduce((sum, act) => {
      return sum + (act.plannedBudget * act.physicalProgress) / 100;
    }, 0);
  }, [activities]);

  // High-level cost and schedule metrics
  const costVariance = totalEarnedValue - totalExecutedCost;
  const scheduleVariance = totalEarnedValue - totalPlannedValue;
  const cpi = totalExecutedCost > 0 ? totalEarnedValue / totalExecutedCost : 1.0;
  const spi = totalPlannedValue > 0 ? totalEarnedValue / totalPlannedValue : 1.0;

  // Monthly Cash Flow Projections (Planned vs Actual Cash Flow + Client RA Billing Revenue Flow)
  const cashflowDetails = useMemo(() => {
    const plannedMonthly = Array(6).fill(0); // [Mar, Apr, May, Jun, Jul, Aug]
    const actualMonthly = Array(6).fill(0);
    const clientBilledMonthly = Array(6).fill(0);

    // 1. Calculate planned cost distribution
    activities.forEach(act => {
      const budget = act.plannedBudget;
      const startIdx = act.startMonth - 1; 
      const dur = act.durationMonths;
      
      const budgetPerMonth = budget / dur;
      for (let i = 0; i < dur; i++) {
        const monthIdx = startIdx + i;
        if (monthIdx < 6) {
          plannedMonthly[monthIdx] += budgetPerMonth;
        }
      }
    });

    // 2. Calculate actual cost distribution from transactions
    transactions.forEach(txn => {
      const idx = PROJECT_MONTHS.indexOf(txn.month);
      if (idx !== -1) {
        actualMonthly[idx] += txn.amount;
      }
    });

    // 3. Calculate client RA billing revenues mapping over transaction dates
    // For simplicity, we distribute billed amounts based on transaction month activities
    // or let it follow physical progress checkpoints.
    // Let's map it month-by-month to matching actual progress intervals
    // Excavation: Mar (100% progress) -> Billed in Mar
    // Foundation: Mar (50% progress), Apr (50% progress) -> Billed in Mar/Apr
    // RCC Frame: Apr (25% progress), May (25% progress) -> Billed in Apr/May
    activities.forEach(act => {
      const actContractVal = act.plannedBudget * 1.15;
      const startIdx = act.startMonth - 1;
      const dur = act.durationMonths;
      
      // Billed amount distributed proportional to physical progress
      const actBilled = (actContractVal * act.physicalProgress) / 100;
      if (actBilled > 0) {
        const billedPerActiveMonth = actBilled / Math.min(dur, currentMonthIdx - startIdx + 1);
        for (let i = 0; i < dur; i++) {
          const monthIdx = startIdx + i;
          if (monthIdx < currentMonthIdx && monthIdx < 6) {
            clientBilledMonthly[monthIdx] += billedPerActiveMonth;
          }
        }
      }
    });

    // 4. Accumulate values
    const cumulativePlanned: number[] = [];
    const cumulativeActual: number[] = [];
    const cumulativeClientBilled: number[] = [];
    
    let cumPl = 0;
    let cumAct = 0;
    let cumBill = 0;

    for (let i = 0; i < 6; i++) {
      cumPl += plannedMonthly[i];
      cumulativePlanned.push(cumPl);

      if (i < currentMonthIdx) {
        cumAct += actualMonthly[i];
        cumulativeActual.push(cumAct);

        cumBill += clientBilledMonthly[i];
        cumulativeClientBilled.push(cumBill);
      }
    }

    return PROJECT_MONTHS.map((month, idx) => ({
      month,
      plannedFlow: Math.round(plannedMonthly[idx] / 1000) / 100, 
      actualFlow: Math.round(actualMonthly[idx] / 1000) / 100, 
      clientBilledFlow: Math.round(clientBilledMonthly[idx] / 1000) / 100,
      cumPlanned: Math.round(cumulativePlanned[idx] / 1000) / 100, 
      cumActual: idx < currentMonthIdx ? Math.round(cumulativeActual[idx] / 1000) / 100 : null, 
      cumClientBilled: idx < currentMonthIdx ? Math.round(cumulativeClientBilled[idx] / 1000) / 100 : null,
    }));
  }, [activities, transactions, currentMonthIdx]);

  // Resource Type Wise Cost & Schedule Tracking
  const resourceMetrics = useMemo((): Record<'Material' | 'Labour' | 'Equipment', ResourceMetric> => {
    const categories: ('Material' | 'Labour' | 'Equipment')[] = ['Material', 'Labour', 'Equipment'];
    
    const result = {} as Record<'Material' | 'Labour' | 'Equipment', ResourceMetric>;

    categories.forEach(cat => {
      let plannedBudget = 0;
      activities.forEach(act => {
        act.bom.forEach(item => {
          if (item.category === cat) {
            plannedBudget += item.plannedAmount;
          }
        });
      });

      const actualCost = transactions
        .filter(txn => txn.category === cat)
        .reduce((sum, txn) => sum + txn.amount, 0);

      let earnedValue = 0;
      activities.forEach(act => {
        const progress = act.physicalProgress;
        let actCatPlanned = 0;
        act.bom.forEach(item => {
          if (item.category === cat) {
            actCatPlanned += item.plannedAmount;
          }
        });
        earnedValue += (actCatPlanned * progress) / 100;
      });

      let plannedValue = 0;
      activities.forEach(act => {
        const expProgress = expectedProgressMap[act.id] || 0;
        let actCatPlanned = 0;
        act.bom.forEach(item => {
          if (item.category === cat) {
            actCatPlanned += item.plannedAmount;
          }
        });
        plannedValue += (actCatPlanned * expProgress) / 100;
      });

      const costVar = earnedValue - actualCost;
      const schedVar = earnedValue - plannedValue;
      const catCpi = actualCost > 0 ? earnedValue / actualCost : 1.0;
      const catSpi = plannedValue > 0 ? earnedValue / plannedValue : 1.0;

      let status: 'Healthy' | 'Over Budget' | 'Behind Schedule' | 'Critical' = 'Healthy';
      if (catCpi < 0.95 && catSpi < 0.95) {
        status = 'Critical';
      } else if (catCpi < 0.95) {
        status = 'Over Budget';
      } else if (catSpi < 0.95) {
        status = 'Behind Schedule';
      }

      result[cat] = {
        category: cat,
        plannedValue,
        actualCost,
        earnedValue,
        plannedBudget,
        costVariance: costVar,
        scheduleVariance: schedVar,
        cpi: catCpi,
        spi: catSpi,
        status
      };
    });

    return result;
  }, [activities, transactions, expectedProgressMap]);

  // Execute / Issue Purchase Order
  const issuePO = useCallback((
    activityId: string,
    bomItemId: string,
    qty: number,
    rate: number,
    partyName: string,
    dateStr: string
  ) => {
    setActivities(prevActivities => {
      return prevActivities.map(act => {
        if (act.id !== activityId) return act;
        
        const updatedBom = act.bom.map(item => {
          if (item.id !== bomItemId) return item;
          return {
            ...item,
            executedQty: item.executedQty + qty,
            executedAmount: item.executedAmount + (qty * rate),
            poWOIssued: item.poWOIssued + qty
          };
        });

        return { ...act, bom: updatedBom };
      });
    });

    setTransactions(prevTxns => {
      const month = getMonthFromDate(dateStr);
      const activity = activities.find(a => a.id === activityId);
      const bomItem = activity?.bom.find(b => b.id === bomItemId);
      
      const newTxn: Transaction = {
        id: `TXN-PO-${Date.now().toString().slice(-4)}`,
        type: 'PO',
        activityId,
        activityName: activity?.name || 'Unknown Activity',
        bomItemId,
        bomItemName: bomItem?.name || 'Unknown BOM Item',
        category: 'Material',
        qty,
        rate,
        amount: qty * rate,
        partyName,
        date: dateStr,
        month
      };
      
      return [newTxn, ...prevTxns];
    });
  }, [activities]);

  // Execute / Issue Work Order
  const issueWO = useCallback((
    activityId: string,
    bomItemId: string,
    qty: number,
    rate: number,
    partyName: string,
    dateStr: string
  ) => {
    const activity = activities.find(a => a.id === activityId);
    const bomItem = activity?.bom.find(b => b.id === bomItemId);
    const cat = bomItem?.category || 'Labour';

    setActivities(prevActivities => {
      return prevActivities.map(act => {
        if (act.id !== activityId) return act;
        
        const updatedBom = act.bom.map(item => {
          if (item.id !== bomItemId) return item;
          return {
            ...item,
            executedQty: item.executedQty + qty,
            executedAmount: item.executedAmount + (qty * rate),
            poWOIssued: item.poWOIssued + qty
          };
        });

        return { ...act, bom: updatedBom };
      });
    });

    setTransactions(prevTxns => {
      const month = getMonthFromDate(dateStr);
      
      const newTxn: Transaction = {
        id: `TXN-WO-${Date.now().toString().slice(-4)}`,
        type: 'WO',
        activityId,
        activityName: activity?.name || 'Unknown Activity',
        bomItemId,
        bomItemName: bomItem?.name || 'Unknown BOM Item',
        category: cat,
        qty,
        rate,
        amount: qty * rate,
        partyName,
        date: dateStr,
        month
      };
      
      return [newTxn, ...prevTxns];
    });
  }, [activities]);

  // Adjust activity physical progress slider
  const updateActivityProgress = useCallback((activityId: string, progress: number) => {
    setActivities(prev => prev.map(act => {
      if (act.id !== activityId) return act;
      return { ...act, physicalProgress: progress };
    }));
  }, []);

  // Update activity scheduled month and duration
  const updateActivitySchedule = useCallback((activityId: string, startMonth: number, durationMonths: number) => {
    setActivities(prev => prev.map(act => {
      if (act.id !== activityId) return act;
      return { 
        ...act, 
        startMonth: Math.max(1, Math.min(6, startMonth)), 
        durationMonths: Math.max(1, durationMonths)
      };
    }));
  }, []);

  // Modify current project Month Index
  const updateProjectMonth = useCallback((monthIdx: number) => {
    setCurrentMonthIdx(Math.max(1, Math.min(6, monthIdx)));
  }, []);

  // Reset Project ERP store back to default simulated state
  const resetProject = useCallback(() => {
    setActivities(JSON.parse(JSON.stringify(INITIAL_ACTIVITIES)));
    setTransactions([...INITIAL_TRANSACTIONS]);
    setCurrentMonthIdx(3);
  }, []);

  return {
    activities,
    transactions,
    currentMonthIdx,
    currentMonthName,
    monthsList: PROJECT_MONTHS,
    
    // Financial aggregates (Internal Budget side)
    totalPlannedBudget,
    totalExecutedCost,
    totalPlannedValue,
    totalEarnedValue,
    costVariance,
    scheduleVariance,
    cpi,
    spi,
    
    // Customer/Client RA Billing aggregates (Revenue billing side)
    totalClientContractValue,
    totalClientBilled,
    totalClientCertified,
    billingMargin,
    netOperatingCashflow,

    // Projections
    cashflowDetails,
    resourceMetrics,
    expectedProgressMap,
    
    // Actions
    issuePO,
    issueWO,
    updateActivityProgress,
    updateActivitySchedule,
    updateProjectMonth,
    resetProject
  };
};
