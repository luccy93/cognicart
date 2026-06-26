'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, ShoppingCart, Users } from 'lucide-react';

const stats = [
  { label: 'Total Revenue', value: '$48,290', icon: DollarSign, change: '+18%', color: '#6C63FF', up: true },
  { label: 'Monthly Revenue', value: '$8,423', icon: TrendingUp, change: '+12%', color: '#00E5FF', up: true },
  { label: 'Total Orders', value: '892', icon: ShoppingCart, change: '+23%', color: '#00E676', up: true },
  { label: 'Avg Order Value', value: '$54.12', icon: Users, change: '-3%', color: '#FF6B35', up: false },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthlyData = [3200, 4800, 5100, 5800, 7200, 6800, 7900, 8500, 7800, 9200, 8800, 9600];

const transactions = [
  { id: '#8921', product: 'Wireless Headphones Pro', amount: 249.99, fee: 7.50, net: 242.49, date: 'Dec 20', status: 'Completed' },
  { id: '#8920', product: 'Smart Watch Ultra', amount: 199.99, fee: 6.00, net: 193.99, date: 'Dec 19', status: 'Completed' },
  { id: '#8919', product: 'Bluetooth Speaker X (x3)', amount: 149.97, fee: 4.50, net: 145.47, date: 'Dec 18', status: 'Pending' },
  { id: '#8918', product: 'Laptop Stand Adjustable', amount: 79.99, fee: 2.40, net: 77.59, date: 'Dec 17', status: 'Completed' },
  { id: '#8917', product: 'Mechanical Keyboard RGB (x2)', amount: 199.98, fee: 6.00, net: 193.98, date: 'Dec 16', status: 'Completed' },
];

export default function SellerRevenuePage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
        <p className="text-sm text-[--muted]">Monitor your earnings and sales performance</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} className="glass rounded-xl p-4 card-3d">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}><s.icon size={16} /></div>
              <span className={`text-[10px] font-medium flex items-center gap-0.5 ${s.up ? 'text-[--secondary]' : 'text-red-400'}`}>
                {s.change} {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              </span>
            </div>
            <div className="text-lg font-bold">{s.value}</div>
            <div className="text-[10px] text-[--muted]">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-5 card-3d">
        <h2 className="text-sm font-semibold mb-4">Monthly Revenue</h2>
        <div className="h-40 flex items-end gap-2">
          {monthlyData.map((h, i) => (
            <motion.div
              key={i} initial={{ height: 0 }} animate={{ height: `${(h / 9600) * 100}%` }}
              transition={{ delay: 0.2 + i * 0.03, type: 'spring', stiffness: 100 }}
              className="flex-1 rounded-t-lg relative group cursor-pointer"
              style={{ background: `linear-gradient(180deg, var(--primary) 0%, var(--secondary) ${(h / 9600) * 100}%)` }}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">${h.toLocaleString()}</div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-[--muted]">
          {months.map((m, i) => <span key={i} className={i % 2 === 0 ? '' : 'hidden sm:block'}>{m}</span>)}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-xl p-5 card-3d">
        <h2 className="text-sm font-semibold mb-4">Recent Transactions</h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/6 text-left text-[--muted]">
              <th className="pb-3 font-medium">Order</th>
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium text-right">Amount</th>
              <th className="pb-3 font-medium text-right">Fee</th>
              <th className="pb-3 font-medium text-right">Net</th>
              <th className="pb-3 font-medium text-right">Date</th>
              <th className="pb-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} className="border-b border-white/6">
                <td className="py-3 text-white font-medium">{t.id}</td>
                <td className="py-3 text-[--muted]">{t.product}</td>
                <td className="py-3 text-right">${t.amount.toFixed(2)}</td>
                <td className="py-3 text-right text-[--muted]">-${t.fee.toFixed(2)}</td>
                <td className="py-3 text-right font-medium text-[--secondary]">${t.net.toFixed(2)}</td>
                <td className="py-3 text-right text-[--muted]">{t.date}</td>
                <td className="py-3 text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    t.status === 'Completed' ? 'bg-[--secondary]/15 text-[--secondary]' : 'bg-yellow-500/15 text-yellow-400'
                  }`}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
