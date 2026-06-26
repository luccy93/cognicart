'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChartDownIcon, BellIcon, TagIcon, PlusIcon, TrashIcon, ArrowLeftIcon, TrendingUpIcon, ClockIcon, CheckCircleIcon } from '@/components/ui/emoji-icons';

const activeAlerts = [
  { id: 'a1', product: 'Sony WH-1000XM5', currentPrice: 278, targetPrice: 250, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', percent: 10 },
  { id: 'a2', product: 'MacBook Air M3', currentPrice: 1299, targetPrice: 1199, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop', percent: 8 },
  { id: 'a3', product: 'Samsung Galaxy Watch 6', currentPrice: 329, targetPrice: 299, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', percent: 9 },
  { id: 'a4', product: 'Bose QC Earbuds II', currentPrice: 199, targetPrice: 179, image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=300&fit=crop', percent: 10 },
];

const triggeredAlerts = [
  { id: 't1', product: 'Nike Air Max 270', price: 109, alertPrice: 120, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop', triggeredAt: 'Dec 12, 2025' },
  { id: 't2', product: 'Dyson V15 Detect', price: 499, alertPrice: 550, image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=300&fit=crop', triggeredAt: 'Dec 8, 2025' },
  { id: 't3', product: 'Kindle Paperwhite', price: 89, alertPrice: 99, image: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=300&fit=crop', triggeredAt: 'Dec 5, 2025' },
];

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function PriceTrackingPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'triggered'>('active');
  const [alerts, setAlerts] = useState(activeAlerts);
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">PRICE TRACKER</span>
          </div>
          <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-space">Price Alerts</h1>
            <p className="text-xs text-[--muted] mt-1">Get notified when prices drop on your favorite products</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}><PlusIcon size={14} /> New Alert</Button>
        </motion.div>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold">Create Price Alert</h3>
                <input value={newProduct} onChange={e => setNewProduct(e.target.value)} className="glass-input text-sm" placeholder="Product name or URL" />
                <input value={newTarget} onChange={e => setNewTarget(e.target.value)} className="glass-input text-sm" placeholder="Target price ($)" type="number" />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setNewProduct(''); setNewTarget(''); }}>Cancel</Button>
                  <Button variant="primary" size="sm" disabled={!newProduct || !newTarget}>Create Alert</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mb-6">
          {(['active', 'triggered'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'glass text-[--muted] hover:text-white'}`}>
              {tab === 'active' ? `Active (${alerts.length})` : `Triggered (${triggeredAlerts.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'active' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            {alerts.length === 0 ? (
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-12 text-center">
                <BellIcon size={24} className="mx-auto mb-3 text-[--muted]" />
                <h3 className="text-lg font-semibold mb-1">No active alerts</h3>
                <p className="text-xs text-[--muted] mb-4">Create a price alert to track products</p>
                <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}><PlusIcon size={14} /> Create Alert</Button>
              </motion.div>
            ) : (
              alerts.map((alert, i) => (
                <motion.div key={alert.id} variants={itemVariants} className="glass-card rounded-xl p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[--surface] overflow-hidden shrink-0">
                    <img src={alert.image} alt={alert.product} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{alert.product}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-[--muted]">Current: <span className="text-white font-medium">${alert.currentPrice}</span></span>
                      <span className="text-[--muted]">Target: <span className="text-[--accent] font-medium">${alert.targetPrice}</span></span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[--secondary]/15 text-[--secondary]">{alert.percent}% drop needed</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${((alert.currentPrice - alert.targetPrice) / alert.currentPrice) * 100}%` }}
                        className="h-full bg-gradient-to-r from-[--accent] to-[--secondary] rounded-full" transition={{ duration: 1, delay: i * 0.1 }} />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => deleteAlert(alert.id)}><TrashIcon size={12} /></Button>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'triggered' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            {triggeredAlerts.map((alert, i) => (
              <motion.div key={alert.id} variants={itemVariants} className="glass-card rounded-xl p-4 flex items-center gap-4 border border-[--secondary]/20">
                <div className="w-16 h-16 rounded-xl bg-[--surface] overflow-hidden shrink-0">
                  <img src={alert.image} alt={alert.product} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{alert.product}</h3>
                    <CheckCircleIcon size={14} className="text-[--secondary]" />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-[--secondary] font-medium">${alert.price}</span>
                    <span className="text-[--muted] line-through">${alert.alertPrice}</span>
                    <span className="text-[10px] text-[--muted] flex items-center gap-1"><ClockIcon size={10} /> {alert.triggeredAt}</span>
                  </div>
                </div>
                <Button variant="primary" size="sm">Shop Now</Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
