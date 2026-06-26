'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, FileText, Calendar, TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';

const reportTypes = [
  { id: 'sales', label: 'Sales Report', desc: 'Detailed breakdown of all sales transactions', icon: DollarSign },
  { id: 'users', label: 'User Analytics', desc: 'User growth, retention, and demographics', icon: Users },
  { id: 'products', label: 'Product Performance', desc: 'Best sellers, categories, and trends', icon: ShoppingCart },
  { id: 'revenue', label: 'Revenue Summary', desc: 'Monthly, quarterly, and yearly revenue', icon: TrendingUp },
];

const sampleReports = [
  { name: 'Monthly Sales Summary - Dec 2025', type: 'sales', date: 'Jan 1, 2026', size: '2.4 MB', status: 'Ready' },
  { name: 'User Growth Report - Q4 2025', type: 'users', date: 'Dec 31, 2025', size: '1.8 MB', status: 'Ready' },
  { name: 'Top Products - Holiday Season', type: 'products', date: 'Dec 28, 2025', size: '3.2 MB', status: 'Generating' },
  { name: 'Annual Revenue Report - 2025', type: 'revenue', date: 'Dec 31, 2025', size: '4.1 MB', status: 'Ready' },
  { name: 'Customer Retention Analysis', type: 'users', date: 'Dec 15, 2025', size: '1.2 MB', status: 'Ready' },
];

export default function AdminReportsPage() {
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState('30');

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-xs text-[--secondary] font-medium">Admin Panel</span>
        <h1 className="text-3xl font-extrabold mt-1 text-gradient">Reports</h1>
        <p className="text-sm text-[--muted] mt-1">Generate and download platform reports.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((r, i) => (
          <motion.button
            key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => setActiveReport(r.id)}
            className={`glass rounded-xl p-4 text-left card-3d transition-all ${
              activeReport === r.id ? 'ring-1 ring-[--primary] bg-[--primary]/5' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-[--primary]/15 flex items-center justify-center mb-3" style={{ color: 'var(--primary)' }}>
              <r.icon size={16} />
            </div>
            <h3 className="text-sm font-semibold">{r.label}</h3>
            <p className="text-[10px] text-[--muted] mt-1">{r.desc}</p>
          </motion.button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-5 card-3d">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-[--muted]" />
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}
              className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none">
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last Quarter</option>
              <option value="365">Last Year</option>
            </select>
          </div>
          <button className="btn-primary text-xs px-4 py-2 flex items-center gap-2">
            <FileText size={14} /> Generate Report
          </button>
        </div>

        <div className="h-48 flex items-end gap-2 mb-4">
          {[45, 52, 38, 65, 48, 72, 58, 80, 62, 88, 75, 95].map((h, i) => (
            <motion.div
              key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
              transition={{ delay: 0.1 + i * 0.02 }}
              className="flex-1 rounded-t-lg"
              style={{ background: `linear-gradient(180deg, var(--primary), var(--secondary))` }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-sm font-semibold mb-4">Generated Reports</h2>
        <div className="space-y-2">
          {sampleReports.map((r, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center justify-between card-3d">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-[--muted]" />
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-[10px] text-[--muted]">{r.date} · {r.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  r.status === 'Ready' ? 'bg-[--secondary]/15 text-[--secondary]' : 'bg-yellow-500/15 text-yellow-400'
                }`}>{r.status}</span>
                {r.status === 'Ready' && (
                  <button className="p-1.5 glass rounded-lg hover:text-[--secondary]">
                    <Download size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
