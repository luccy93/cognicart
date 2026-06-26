'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TruckIcon, SearchIcon, PackageIcon, MapPinIcon, ClockIcon, CheckCircleIcon, RefreshIcon } from '@/components/ui/emoji-icons';

const shipments = [
  { id: 'SH-001', order: '#ORD-7842', status: 'in_transit', carrier: 'FedEx', tracking: '1Z999AA10123456784', estimated: 'Dec 17, 2025', origin: 'New York, NY', destination: 'San Francisco, CA', lastUpdate: 'Arrived at regional hub', time: '2h ago', items: 2 },
  { id: 'SH-002', order: '#ORD-7841', status: 'out_for_delivery', carrier: 'UPS', tracking: '1Z555BB20234567890', estimated: 'Dec 16, 2025', origin: 'Los Angeles, CA', destination: 'San Francisco, CA', lastUpdate: 'Out for delivery', time: '30m ago', items: 1 },
  { id: 'SH-003', order: '#ORD-7840', status: 'processing', carrier: 'USPS', tracking: '940011189922345678', estimated: 'Dec 18, 2025', origin: 'Dallas, TX', destination: 'Austin, TX', lastUpdate: 'Label created', time: '4h ago', items: 3 },
  { id: 'SH-004', order: '#ORD-7839', status: 'delivered', carrier: 'FedEx', tracking: '1Z888CC30345678901', estimated: 'Dec 14, 2025', origin: 'Chicago, IL', destination: 'San Francisco, CA', lastUpdate: 'Delivered', time: '1d ago', items: 1 },
  { id: 'SH-005', order: '#ORD-7837', status: 'delivered', carrier: 'UPS', tracking: '1Z777DD40456789012', estimated: 'Dec 10, 2025', origin: 'Seattle, WA', destination: 'San Francisco, CA', lastUpdate: 'Delivered', time: '5d ago', items: 3 },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  processing: { label: 'Processing', color: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/20', icon: <PackageIcon size={12} /> },
  in_transit: { label: 'In Transit', color: 'bg-blue-400/15 text-blue-400 border-blue-400/20', icon: <TruckIcon size={12} /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-400/15 text-purple-400 border-purple-400/20', icon: <MapPinIcon size={12} /> },
  delivered: { label: 'Delivered', color: 'bg-[--secondary]/15 text-[--secondary] border-[--secondary]/20', icon: <CheckCircleIcon size={12} /> },
};

const timelineSteps = ['Order Placed', 'Processing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function DeliveryPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = shipments.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false;
    const q = search.toLowerCase();
    return s.order.toLowerCase().includes(q) || s.tracking.includes(q) || s.carrier.toLowerCase().includes(q);
  });

  const activeShipments = shipments.filter(s => s.status !== 'delivered').length;

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">DELIVERY TRACKING</span>
          </div>
          <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold font-space">Delivery Tracking</h1>
          <p className="text-xs text-[--muted] mt-1">{activeShipments} active shipments</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active', value: activeShipments, color: 'from-blue-500/20 to-purple-500/20' },
            { label: 'In Transit', value: shipments.filter(s => s.status === 'in_transit').length, color: 'from-yellow-500/20 to-amber-500/20' },
            { label: 'Out for Delivery', value: shipments.filter(s => s.status === 'out_for_delivery').length, color: 'from-purple-500/20 to-pink-500/20' },
            { label: 'Delivered', value: shipments.filter(s => s.status === 'delivered').length, color: 'from-[--secondary]/20 to-[--primary]/20' },
          ].map((s, i) => (
            <motion.div key={i} variants={itemVariants} className={`glass-card rounded-xl p-4 bg-gradient-to-br ${s.color}`}>
              <p className="text-[10px] text-[--muted]">{s.label}</p>
              <p className="text-xl font-bold font-space mt-1">{s.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1 max-w-xs">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order or tracking..." className="glass-input pl-9 text-sm" />
          </div>
          {['all', 'processing', 'in_transit', 'out_for_delivery', 'delivered'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${filter === f ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'glass text-[--muted] hover:text-white'}`}>{f.replace('_', ' ')}</button>
          ))}
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {filtered.map((ship, i) => {
            const config = statusConfig[ship.status] || statusConfig.processing;
            const currentStepIndex = timelineSteps.findIndex(s => s.toLowerCase() === ship.status.replace('_', ' ')) + 1;
            return (
              <motion.div key={ship.id} variants={itemVariants} className="glass-card rounded-2xl overflow-hidden">
                <div className="p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === ship.id ? null : ship.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{ship.order}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${config.color}`}>{config.icon}{config.label}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[10px] text-[--muted]">
                        <span>{ship.carrier}</span>
                        <span className="font-mono">{ship.tracking}</span>
                        <span>Est. {ship.estimated}</span>
                      </div>
                      <p className="text-xs mt-2">{ship.lastUpdate} <span className="text-[10px] text-[--muted]">({ship.time})</span></p>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === ship.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="border-t border-white/5 px-4 py-4 space-y-4">
                        <div><h4 className="text-[10px] font-semibold text-[--muted] uppercase tracking-wider mb-2">Tracking Timeline</h4>
                          <div className="flex items-center gap-0">
                            {timelineSteps.map((step, idx) => (
                              <div key={idx} className="flex items-center flex-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${idx < currentStepIndex ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'bg-white/5 text-[--muted]'}`}>
                                  {idx < currentStepIndex ? <CheckCircleIcon size={10} /> : idx + 1}
                                </div>
                                {idx < timelineSteps.length - 1 && <div className={`flex-1 h-px mx-1 ${idx < currentStepIndex - 1 ? 'bg-[--primary]' : 'bg-white/10'}`} />}
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between text-[8px] text-[--muted] mt-1">
                            {timelineSteps.map((s, idx) => <span key={idx} className="text-center w-12">{s}</span>)}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div><span className="text-[10px] text-[--muted]">Origin</span><p>{ship.origin}</p></div>
                          <div><span className="text-[10px] text-[--muted]">Destination</span><p>{ship.destination}</p></div>
                          <div><span className="text-[10px] text-[--muted]">Carrier</span><p>{ship.carrier}</p></div>
                          <div><span className="text-[10px] text-[--muted]">Items</span><p>{ship.items}</p></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
