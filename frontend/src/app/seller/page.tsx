'use client';

import { motion } from 'framer-motion';
import { DollarSign, Package, ShoppingCart, TrendingUp, Eye, StarIcon } from 'lucide-react';

const stats = [
  { label: 'Total Sales', value: '$48,290', icon: DollarSign, change: '+12%', color: '#6C63FF' },
  { label: 'Products Listed', value: '156', icon: Package, change: '+5%', color: '#00E5FF' },
  { label: 'Orders Fulfilled', value: '892', icon: ShoppingCart, change: '+18%', color: '#00E676' },
  { label: 'Conversion Rate', value: '4.8%', icon: TrendingUp, change: '+2.3%', color: '#FF6B35' },
];

const recentOrders = [
  { id: '#ORD-8921', product: 'Wireless Headphones Pro', qty: 2, total: 249.99, status: 'Delivered', date: '2 hours ago' },
  { id: '#ORD-8920', product: 'Smart Watch Ultra', qty: 1, total: 199.99, status: 'Shipped', date: '5 hours ago' },
  { id: '#ORD-8919', product: 'Bluetooth Speaker X', qty: 3, total: 149.97, status: 'Processing', date: '1 day ago' },
  { id: '#ORD-8918', product: 'Laptop Stand Adjustable', qty: 1, total: 79.99, status: 'Pending', date: '2 days ago' },
  { id: '#ORD-8917', product: 'Mechanical Keyboard RGB', qty: 2, total: 199.98, status: 'Delivered', date: '2 days ago' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SellerDashboard() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-xs text-[--secondary] font-medium">Seller Dashboard</span>
        <h1 className="text-3xl font-extrabold mt-1 text-gradient">Store Overview</h1>
        <p className="text-sm text-[--muted] mt-1">Track your sales, inventory, and performance metrics.</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} variants={item} whileHover={{ y: -4 }} className="glass rounded-xl p-5 card-3d">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon size={18} />
              </div>
              <span className="text-[11px] font-medium flex items-center gap-0.5 text-[--secondary]">{s.change} <TrendingUp size={12} /></span>
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-[11px] text-[--muted] mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2 glass rounded-xl p-5 card-3d">
          <h2 className="text-sm font-semibold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/6 text-left text-[--muted]">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Qty</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o, i) => (
                  <tr key={i} className="border-b border-white/6">
                    <td className="py-3 text-white font-medium">{o.id}</td>
                    <td className="py-3 text-[--muted]">{o.product}</td>
                    <td className="py-3">{o.qty}</td>
                    <td className="py-3">${o.total.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        o.status === 'Delivered' ? 'bg-[--secondary]/15 text-[--secondary]' :
                        o.status === 'Shipped' ? 'bg-[--primary]/15 text-[--primary]' :
                        o.status === 'Processing' ? 'bg-yellow-500/15 text-yellow-400' :
                        'bg-white/10 text-[--muted]'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-[--muted]">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-5 card-3d">
          <h2 className="text-sm font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full glass rounded-lg p-3 text-left text-xs hover:bg-white/5 transition-colors flex items-center gap-3">
              <Package size={16} className="text-[--primary]" />
              Add New Product
            </button>
            <button className="w-full glass rounded-lg p-3 text-left text-xs hover:bg-white/5 transition-colors flex items-center gap-3">
              <Eye size={16} className="text-[--secondary]" />
              Update Stock
            </button>
            <button className="w-full glass rounded-lg p-3 text-left text-xs hover:bg-white/5 transition-colors flex items-center gap-3">
              <DollarSign size={16} className="text-yellow-400" />
              View Payouts
            </button>
          </div>

          <h2 className="text-sm font-semibold mt-6 mb-3">Top Products</h2>
          <div className="space-y-3">
            {[
              { name: 'Wireless Headphones', sales: 234, rating: 4.8 },
              { name: 'Smart Watch Ultra', sales: 189, rating: 4.7 },
              { name: 'Bluetooth Speaker', sales: 156, rating: 4.5 },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">{p.name}</p>
                  <p className="text-[10px] text-[--muted]">{p.sales} sold</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-yellow-400">
                  <StarIcon size={14} /> {p.rating}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
