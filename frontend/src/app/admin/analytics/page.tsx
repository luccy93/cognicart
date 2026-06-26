'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Download, Activity } from 'lucide-react';
import { MoneyIcon, PackageIcon, StarIcon, TagIcon, UserIcon } from '@/components/ui/emoji-icons';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

const fallbackStats = [
  { label: 'Total Revenue', value: '$847,290', change: '+18.2%', up: true, icon: DollarSign, color: '#6C63FF' },
  { label: 'Total Orders', value: '8,923', change: '+12.5%', up: true, icon: ShoppingCart, color: '#00E5FF' },
  { label: 'Total Users', value: '24,850', change: '+8.7%', up: true, icon: Users, color: '#00E676' },
  { label: 'Conversion Rate', value: '3.42%', change: '-0.8%', up: false, icon: TrendingUp, color: '#FF6B35' },
];

const recentActivity = [
  { action: 'New user registered', detail: 'Alice Johnson created an account', time: '2 min ago', icon: <UserIcon size={14} /> },
  { action: 'Order completed', detail: 'Order #ORD-005 was delivered', time: '15 min ago', icon: <PackageIcon size={14} /> },
  { action: 'Product added', detail: 'Wireless Headphones Pro added to catalog', time: '1 hour ago', icon: <TagIcon size={14} /> },
  { action: 'Payment received', detail: '$599.99 from Bob Smith', time: '2 hours ago', icon: <MoneyIcon size={14} /> },
  { action: 'Review submitted', detail: '5-star review for Smart Watch Ultra', time: '3 hours ago', icon: <StarIcon size={14} /> },
  { action: 'Refund processed', detail: 'Order #ORD-006 refunded $119.97', time: '5 hours ago', icon: '↩️' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminAnalytics() {
  const [stats, setStats] = useState(fallbackStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi.analyticsOverview()
      .then((res) => {
        const data = res.data;
        setStats([
          { label: 'Total Revenue', value: data.total_revenue ?? '$847,290', change: data.revenue_change ?? '+18.2%', up: data.revenue_up ?? true, icon: DollarSign, color: '#6C63FF' },
          { label: 'Total Orders', value: data.total_orders ?? '8,923', change: data.orders_change ?? '+12.5%', up: data.orders_up ?? true, icon: ShoppingCart, color: '#00E5FF' },
          { label: 'Total Users', value: data.total_users ?? '24,850', change: data.users_change ?? '+8.7%', up: data.users_up ?? true, icon: Users, color: '#00E676' },
          { label: 'Conversion Rate', value: data.conversion_rate ?? '3.42%', change: data.conversion_change ?? '-0.8%', up: data.conversion_up ?? false, icon: TrendingUp, color: '#FF6B35' },
        ]);
      })
      .catch(() => {
        setStats(fallbackStats);
        toast.error('Failed to load analytics, showing cached data');
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-5 w-24 rounded bg-white/5 animate-pulse" />
        <div className="h-8 w-48 rounded bg-white/5 animate-pulse" />
        <div className="h-4 w-72 rounded bg-white/5 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
        </div>
        <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-[--secondary] font-medium">Admin Panel</span>
          <h1 className="text-3xl font-extrabold mt-1 text-gradient">Analytics</h1>
          <p className="text-sm text-[--muted] mt-1">Platform performance metrics and insights.</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5 text-xs w-fit">
          <Download size={14} /> Export Report
        </button>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} variants={item} whileHover={{ y: -4 }} className="glass rounded-xl p-5 card-3d">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon size={18} />
              </div>
              <span className={`text-[11px] font-medium flex items-center gap-0.5 ${s.up ? 'text-[#00E676]' : 'text-red-400'}`}>
                {s.change} {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </span>
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-[11px] text-[--muted] mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass rounded-xl p-5 card-3d">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Revenue Trend</h2>
            <select className="text-[10px] bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[--muted] outline-none">
              <option>This Year</option>
              <option>This Quarter</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-52 flex items-end gap-1.5">
            {[30, 42, 38, 55, 48, 62, 58, 72, 65, 80, 75, 95].map((h, i) => (
              <motion.div
                key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                transition={{ delay: 0.3 + i * 0.03, type: 'spring', stiffness: 100 }}
                className="flex-1 rounded-t-md relative group cursor-pointer"
                style={{
                  background: `linear-gradient(180deg, var(--primary) 0%, var(--secondary) ${h}%)`,
                  opacity: 0.7 + h / 200,
                }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                  ${(h * 10000).toLocaleString('en-US')}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-[--muted]">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-xl p-5 card-3d">
          <h2 className="text-sm font-semibold mb-4">Top Categories</h2>
          <div className="space-y-3">
            {[
              { name: 'Electronics', percent: 38, color: '#6C63FF', value: '$322K' },
              { name: 'Audio', percent: 24, color: '#00E5FF', value: '$203K' },
              { name: 'Accessories', percent: 18, color: '#00E676', value: '$152K' },
              { name: 'Gaming', percent: 12, color: '#FF6B35', value: '$102K' },
              { name: 'Wearables', percent: 8, color: '#FFD700', value: '$68K' },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>{c.name}</span>
                  <span className="text-[--muted]">{c.percent}% ({c.value})</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${c.percent}%` }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: c.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-center gap-3 text-[10px] text-[--muted]">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: '#6C63FF' }} /> Electronics</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: '#00E5FF' }} /> Audio</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: '#00E676' }} /> Accessories</div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Activity size={16} className="text-[--primary]" /> Recent Activity
          </h2>
          <button className="text-[10px] text-[--secondary] hover:underline">View All</button>
        </div>
        <div className="glass rounded-xl p-5 card-3d">
          <div className="space-y-0">
            {recentActivity.map((a, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.03 }}
                className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0"
              >
                <span className="text-base mt-0.5">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium">{a.action}</div>
                  <div className="text-[10px] text-[--muted] truncate">{a.detail}</div>
                </div>
                <span className="text-[10px] text-[--muted] whitespace-nowrap">{a.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
