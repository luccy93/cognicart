'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PackageIcon, SearchIcon, AlertIcon, BuildingIcon, RefreshIcon, TrendingUpIcon, ArrowRightIcon, ChartIcon } from '@/components/ui/emoji-icons';

const warehouses = [
  { id: 'w1', name: 'Main Warehouse', location: 'New York, NY', items: 12450, lowStock: 12, capacity: 78 },
  { id: 'w2', name: 'West Coast Hub', location: 'Los Angeles, CA', items: 8900, lowStock: 5, capacity: 62 },
  { id: 'w3', name: 'Central Distribution', location: 'Dallas, TX', items: 6700, lowStock: 8, capacity: 45 },
];

const inventoryItems = [
  { id: 'i1', name: 'Wireless Earbuds Pro', sku: 'SKU-001', warehouse: 'Main Warehouse', stock: 50, reserved: 12, available: 38, threshold: 20, status: 'ok' },
  { id: 'i2', name: 'Mechanical Keyboard RGB', sku: 'SKU-002', warehouse: 'Main Warehouse', stock: 100, reserved: 25, available: 75, threshold: 30, status: 'ok' },
  { id: 'i3', name: 'Smart Watch Ultra', sku: 'SKU-003', warehouse: 'West Coast Hub', stock: 15, reserved: 8, available: 7, threshold: 20, status: 'low' },
  { id: 'i4', name: 'Gaming Mouse X', sku: 'SKU-004', warehouse: 'Main Warehouse', stock: 131, reserved: 30, available: 101, threshold: 25, status: 'ok' },
  { id: 'i5', name: 'Noise Cancelling Headphones', sku: 'SKU-005', warehouse: 'Central Distribution', stock: 8, reserved: 5, available: 3, threshold: 15, status: 'low' },
  { id: 'i6', name: 'USB-C Hub 7-in-1', sku: 'SKU-006', warehouse: 'West Coast Hub', stock: 74, reserved: 15, available: 59, threshold: 20, status: 'ok' },
  { id: 'i7', name: 'Portable SSD 1TB', sku: 'SKU-007', warehouse: 'Main Warehouse', stock: 3, reserved: 2, available: 1, threshold: 10, status: 'critical' },
  { id: 'i8', name: 'Smart Home Hub', sku: 'SKU-008', warehouse: 'Central Distribution', stock: 17, reserved: 5, available: 12, threshold: 15, status: 'low' },
];

const transactions = [
  { id: 't1', type: 'inbound', product: 'Wireless Earbuds Pro', qty: 100, date: 'Dec 15, 2025', from: 'Supplier #SUP-001', status: 'completed' },
  { id: 't2', type: 'outbound', product: 'Mechanical Keyboard RGB', qty: 25, date: 'Dec 15, 2025', to: 'Order #ORD-7843', status: 'completed' },
  { id: 't3', type: 'transfer', product: 'Smart Watch Ultra', qty: 30, date: 'Dec 14, 2025', from: 'Main Warehouse', to: 'West Coast Hub', status: 'in_transit' },
  { id: 't4', type: 'inbound', product: 'Gaming Mouse X', qty: 200, date: 'Dec 14, 2025', from: 'Supplier #SUP-002', status: 'pending' },
  { id: 't5', type: 'outbound', product: 'USB-C Hub 7-in-1', qty: 10, date: 'Dec 14, 2025', to: 'Order #ORD-7844', status: 'completed' },
];

const statusStyles: Record<string, string> = {
  ok: 'text-[--secondary]',
  low: 'text-yellow-400',
  critical: 'text-red-400',
};

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'transactions'>('overview');
  const [search, setSearch] = useState('');

  const filteredItems = inventoryItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">INVENTORY</span>
          </div>
          <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold font-space">Inventory Dashboard</h1>
          <p className="text-xs text-[--muted] mt-1">Monitor stock levels, manage warehouses, track transactions</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Items', value: inventoryItems.reduce((s, i) => s + i.stock, 0).toLocaleString('en-US'), icon: <PackageIcon size={14} />, color: 'from-[--primary]/20 to-[--secondary]/10' },
            { label: 'Warehouses', value: warehouses.length, icon: <BuildingIcon size={14} />, color: 'from-[--secondary]/20 to-[--accent]/10' },
            { label: 'Low Stock Items', value: inventoryItems.filter(i => i.status !== 'ok').length, icon: <AlertIcon size={14} />, color: 'from-yellow-500/20 to-amber-500/10' },
            { label: 'Critical', value: inventoryItems.filter(i => i.status === 'critical').length, icon: <AlertIcon size={14} />, color: 'from-red-500/20 to-pink-500/10' },
          ].map((s, i) => (
            <motion.div key={i} variants={itemVariants} className={`glass-card rounded-xl p-4 bg-gradient-to-br ${s.color}`}>
              <div className="flex items-center gap-2 text-[10px] text-[--muted] mb-1">{s.icon}{s.label}</div>
              <p className="text-xl font-bold font-space">{s.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex gap-2 mb-6">
          {(['overview', 'items', 'transactions'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'glass text-[--muted] hover:text-white'}`}>
              {tab === 'overview' ? 'Warehouses' : tab === 'items' ? 'Inventory Items' : 'Transactions'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-3 gap-6">
            {warehouses.map((wh, i) => (
              <motion.div key={wh.id} variants={itemVariants} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <BuildingIcon size={20} className="text-[--secondary]" />
                  <span className="text-[10px] text-[--muted]">{wh.items.toLocaleString('en-US')} items</span>
                </div>
                <h3 className="text-sm font-semibold">{wh.name}</h3>
                <p className="text-[10px] text-[--muted]">{wh.location}</p>
                <div className="mt-3"><div className="flex justify-between text-[10px] text-[--muted] mb-1"><span>Capacity</span><span>{wh.capacity}%</span></div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${wh.capacity}%` }} className="h-full bg-gradient-to-r from-[--primary] to-[--secondary] rounded-full" transition={{ duration: 1, delay: i * 0.1 }} /></div></div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-yellow-400 flex items-center gap-1"><AlertIcon size={10} /> {wh.lowStock} low stock</span>
                  <Button variant="ghost" size="sm">View <ArrowRightIcon size={10} /></Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'items' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="relative max-w-xs mb-4"><SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="glass-input pl-9 text-sm" /></div>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-white/5 text-[--muted]">
                    <th className="text-left p-4 font-medium">Product</th><th className="text-left p-4 font-medium">SKU</th><th className="text-left p-4 font-medium">Warehouse</th><th className="text-left p-4 font-medium">Stock</th><th className="text-left p-4 font-medium">Reserved</th><th className="text-left p-4 font-medium">Available</th><th className="text-left p-4 font-medium">Threshold</th><th className="text-left p-4 font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {filteredItems.map((item, i) => (
                      <motion.tr key={item.id} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.03 }} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-medium">{item.name}</td>
                        <td className="p-4 text-[--muted] font-mono text-[10px]">{item.sku}</td>
                        <td className="p-4 text-[--muted]">{item.warehouse}</td>
                        <td className="p-4">{item.stock}</td>
                        <td className="p-4 text-[--muted]">{item.reserved}</td>
                        <td className="p-4 font-medium">{item.available}</td>
                        <td className="p-4 text-[--muted]">{item.threshold}</td>
                        <td className="p-4"><span className={statusStyles[item.status]}>{item.status}</span></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            {transactions.map((tx, i) => (
              <motion.div key={tx.id} variants={itemVariants} className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${tx.type === 'inbound' ? 'bg-[--secondary]/15 text-[--secondary]' : tx.type === 'outbound' ? 'bg-[--accent]/15 text-[--accent]' : 'bg-blue-400/15 text-blue-400'}`}>
                    {tx.type === 'inbound' ? 'IN' : tx.type === 'outbound' ? 'OUT' : 'TR'}
                  </div>
                  <div><p className="text-xs font-medium">{tx.product}</p>
                    <p className="text-[10px] text-[--muted]">{tx.qty} units · {tx.date} {tx.type === 'transfer' ? `· ${tx.from} → ${tx.to}` : tx.type === 'inbound' ? `· ${tx.from}` : `· ${tx.to}`}</p></div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${tx.status === 'completed' ? 'bg-[--secondary]/15 text-[--secondary] border-[--secondary]/20' : 'bg-yellow-400/15 text-yellow-400 border-yellow-400/20'}`}>{tx.status}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
