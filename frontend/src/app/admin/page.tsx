'use client';

import { motion } from 'framer-motion';
import { Users, Package, ShoppingCart, DollarSign, Plus, BarChart3, UserCog, Eye, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { StarIcon } from '@/components/ui/emoji-icons';

const stats = [
  { label: 'Total Users', value: '24,850', icon: Users, change: '+12%', color: '#6C63FF' },
  { label: 'Total Products', value: '3,421', icon: Package, change: '+8%', color: '#00E5FF' },
  { label: 'Total Orders', value: '8,923', icon: ShoppingCart, change: '+23%', color: '#00E676' },
  { label: 'Revenue', value: '$847,290', icon: DollarSign, change: '+18%', color: '#FF6B35' },
];

const recentOrders = [
  { id: '#ORD-001', customer: 'Alice Johnson', items: 3, total: 249.99, status: 'Delivered' },
  { id: '#ORD-002', customer: 'Bob Smith', items: 1, total: 89.99, status: 'Processing' },
  { id: '#ORD-003', customer: 'Carol White', items: 5, total: 529.99, status: 'Shipped' },
  { id: '#ORD-004', customer: 'David Lee', items: 2, total: 149.99, status: 'Pending' },
  { id: '#ORD-005', customer: 'Eve Davis', items: 4, total: 389.99, status: 'Delivered' },
];

const topProducts = [
  { name: 'Wireless Headphones Pro', sales: 1245, revenue: '$186,750', rating: 4.8 },
  { name: 'Smart Watch Ultra', sales: 978, revenue: '$195,600', rating: 4.7 },
  { name: 'Bluetooth Speaker X', sales: 854, revenue: '$85,400', rating: 4.5 },
  { name: 'Laptop Stand Adjustable', sales: 723, revenue: '$57,840', rating: 4.6 },
  { name: 'Mechanical Keyboard RGB', sales: 691, revenue: '$69,100', rating: 4.4 },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-xs text-[--secondary] font-medium">Admin Panel</span>
        <h1 className="text-3xl font-extrabold mt-1 text-gradient">Dashboard Overview</h1>
        <p className="text-sm text-[--muted] mt-1">Real-time overview of your platform performance.</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} variants={item} whileHover={{ y: -4 }} className="glass rounded-xl p-5 card-3d">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon size={18} />
              </div>
              <span className="text-[11px] font-medium flex items-center gap-0.5" style={{ color: '#00E676' }}>
                {s.change} <ArrowUpRight size={12} />
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
            <h2 className="text-sm font-semibold">Revenue Overview</h2>
            <select className="text-[10px] bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[--muted] outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-48 flex items-end gap-2">
            {[40, 55, 45, 70, 60, 85, 65, 90, 75, 95, 80, 100].map((h, i) => (
              <motion.div
                key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                transition={{ delay: 0.3 + i * 0.03, type: 'spring', stiffness: 100 }}
                className="flex-1 rounded-t-lg relative group cursor-pointer"
                style={{ background: `linear-gradient(180deg, var(--primary) 0%, var(--secondary) ${h}%)` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                  ${(h * 8473).toLocaleString('en-US')}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-[--muted]">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-xl p-5 card-3d">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Quick Actions</h2>
          </div>
          <div className="space-y-2.5">
            {[
              { icon: Plus, label: 'Add Product', color: '#6C63FF' },
              { icon: BarChart3, label: 'View Reports', color: '#00E5FF' },
              { icon: UserCog, label: 'Manage Users', color: '#00E676' },
            ].map((a, i) => (
              <motion.button
                key={i} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-xs text-left"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${a.color}15`, color: a.color }}>
                  <a.icon size={15} />
                </div>
                {a.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-xl p-5 card-3d">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Recent Orders</h2>
            <button className="text-[10px] text-[--secondary] hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[--muted] border-b border-white/5">
                  <th className="text-left py-2 pr-2 font-medium">Order</th>
                  <th className="text-left py-2 pr-2 font-medium">Customer</th>
                  <th className="text-center py-2 pr-2 font-medium">Items</th>
                  <th className="text-right py-2 pr-2 font-medium">Total</th>
                  <th className="text-right py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.03 }} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2.5 pr-2 font-medium">{o.id}</td>
                    <td className="py-2.5 pr-2 text-[--muted]">{o.customer}</td>
                    <td className="py-2.5 pr-2 text-center">{o.items}</td>
                    <td className="py-2.5 pr-2 text-right">${o.total.toFixed(2)}</td>
                    <td className="py-2.5 text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        o.status === 'Delivered' ? 'bg-[#00E676]/15 text-[#00E676]' :
                        o.status === 'Shipped' ? 'bg-[#6C63FF]/15 text-[--primary]' :
                        o.status === 'Processing' ? 'bg-[#00E5FF]/15 text-[--secondary]' :
                        'bg-yellow-500/15 text-yellow-400'
                      }`}>{o.status}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-xl p-5 card-3d">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Top Products</h2>
            <button className="text-[10px] text-[--secondary] hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[--muted] border-b border-white/5">
                  <th className="text-left py-2 pr-2 font-medium">Product</th>
                  <th className="text-right py-2 pr-2 font-medium">Sales</th>
                  <th className="text-right py-2 pr-2 font-medium">Revenue</th>
                  <th className="text-right py-2 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.03 }} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2.5 pr-2 font-medium">{p.name}</td>
                    <td className="py-2.5 pr-2 text-right">{p.sales.toLocaleString('en-US')}</td>
                    <td className="py-2.5 pr-2 text-right">{p.revenue}</td>
                    <td className="py-2.5 text-right text-yellow-400"><StarIcon size={14} /> {p.rating}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
