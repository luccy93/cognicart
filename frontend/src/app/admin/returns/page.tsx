'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PackageIcon, SearchIcon, CheckIcon, CloseIcon, TruckIcon, RefreshIcon, ArrowLeftIcon } from '@/components/ui/emoji-icons';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const mockReturns = [
  { id: 'RT-001', order: '#ORD-7842', customer: 'John Doe', product: 'Sony WH-1000XM5', reason: 'Defective product', status: 'pending', date: 'Dec 15, 2025', amount: 278 },
  { id: 'RT-002', order: '#ORD-7841', customer: 'Jane Smith', product: 'Nike Air Max 270', reason: 'Wrong size', status: 'approved', date: 'Dec 14, 2025', amount: 109 },
  { id: 'RT-003', order: '#ORD-7840', customer: 'Mike Johnson', product: 'MacBook Air M3', reason: 'Changed mind', status: 'rejected', date: 'Dec 12, 2025', amount: 1299 },
  { id: 'RT-004', order: '#ORD-7839', customer: 'Emma Wilson', product: 'Bose QC Earbuds II', reason: 'Not as described', status: 'pending', date: 'Dec 11, 2025', amount: 199 },
  { id: 'RT-005', order: '#ORD-7838', customer: 'David Brown', product: 'Samsung Watch 6', reason: 'Damaged in transit', status: 'approved', date: 'Dec 10, 2025', amount: 329 },
  { id: 'RT-006', order: '#ORD-7837', customer: 'Sarah Davis', product: 'Dyson V15', reason: 'Missing parts', status: 'pickup_scheduled', date: 'Dec 9, 2025', amount: 499 },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/20',
  approved: 'bg-[--secondary]/15 text-[--secondary] border-[--secondary]/20',
  rejected: 'bg-red-400/15 text-red-400 border-red-400/20',
  pickup_scheduled: 'bg-blue-400/15 text-blue-400 border-blue-400/20',
};

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function AdminReturnsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [returnsList, setReturnsList] = useState(mockReturns);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/features/returns');
        if (Array.isArray(data) && data.length > 0) {
          setReturnsList(data.map((r: any, i: number) => ({
            id: r.id?.slice(0, 6).toUpperCase() || `RT-${String(i + 1).padStart(3, '0')}`,
            order: r.order_id ? `#ORD-${r.order_id.slice(0, 4).toUpperCase()}` : `#ORD-${7000 + i}`,
            customer: r.user_id?.slice(0, 8) || 'Customer',
            product: r.product_id?.slice(0, 8) || 'Product',
            reason: r.reason || 'N/A',
            status: r.status || 'pending',
            date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
            amount: r.refund_amount || Math.floor(Math.random() * 500) + 50,
          })));
        }
      } catch {
        setReturnsList(mockReturns);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filtered = returnsList.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    return r.customer.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
  });

  const updateStatus = async (id: string, status: string) => {
    const prev = returnsList;
    setReturnsList(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    try {
      await api.put(`/orders/returns/${id}/status`, null, { params: { status } });
      toast.success(`Return ${status.replace('_', ' ')} successfully`);
    } catch {
      setReturnsList(prev);
      toast.error('Failed to update return status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <nav className="nav-blur">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
              <span className="font-bold tracking-widest text-sm">ADMIN · RETURNS</span>
            </div>
            <Link href="/admin" className="text-xs text-[--muted] hover:text-white flex items-center gap-1"><ArrowLeftIcon size={12} /> Admin</Link>
          </div>
        </nav>
        <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-bold font-space">Returns Management</h1>
            <p className="text-xs text-[--muted] mt-1">Process return requests, approve/reject, schedule pickups</p>
          </motion.div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse"><div className="h-3 w-20 bg-white/10 rounded mb-2" /><div className="h-6 w-12 bg-white/10 rounded" /></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse"><div className="h-4 w-40 bg-white/10 rounded mb-3" /><div className="h-3 w-full bg-white/10 rounded" /></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">ADMIN · RETURNS</span>
          </div>
          <Link href="/admin" className="text-xs text-[--muted] hover:text-white flex items-center gap-1"><ArrowLeftIcon size={12} /> Admin</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold font-space">Returns Management</h1>
          <p className="text-xs text-[--muted] mt-1">Process return requests, approve/reject, schedule pickups</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Requests', value: returnsList.length, icon: <PackageIcon size={14} /> },
            { label: 'Pending', value: returnsList.filter(r => r.status === 'pending').length, icon: <RefreshIcon size={14} /> },
            { label: 'Approved', value: returnsList.filter(r => r.status === 'approved' || r.status === 'pickup_scheduled').length, icon: <CheckIcon size={14} /> },
            { label: 'Rejected', value: returnsList.filter(r => r.status === 'rejected').length, icon: <CloseIcon size={14} /> },
          ].map((s, i) => (
            <motion.div key={i} variants={itemVariants} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 text-[--muted] text-[10px] mb-1">{s.icon}{s.label}</div>
              <p className="text-xl font-bold font-space">{s.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-xs"><SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search returns..." className="glass-input pl-9 text-sm" /></div>
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'glass text-[--muted] hover:text-white'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {filtered.map((ret, i) => (
            <motion.div key={ret.id} variants={itemVariants} className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{ret.id}</h3><span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColors[ret.status] || statusColors.pending}`}>{ret.status.replace('_', ' ')}</span></div>
                  <div className="grid sm:grid-cols-2 gap-2 mt-2 text-xs text-[--muted]">
                    <div><span className="text-[10px] font-medium text-white">Order:</span> {ret.order}</div>
                    <div><span className="text-[10px] font-medium text-white">Customer:</span> {ret.customer}</div>
                    <div><span className="text-[10px] font-medium text-white">Product:</span> {ret.product}</div>
                    <div><span className="text-[10px] font-medium text-white">Amount:</span> ${ret.amount}</div>
                    <div className="sm:col-span-2"><span className="text-[10px] font-medium text-white">Reason:</span> {ret.reason}</div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                  {ret.status === 'pending' && (<><Button variant="primary" size="sm" onClick={() => updateStatus(ret.id, 'approved')}><CheckIcon size={10} /> Approve</Button><Button variant="danger" size="sm" onClick={() => updateStatus(ret.id, 'rejected')}><CloseIcon size={10} /> Reject</Button></>)}
                  {ret.status === 'approved' && <Button variant="secondary" size="sm" onClick={() => updateStatus(ret.id, 'pickup_scheduled')}><TruckIcon size={10} /> Schedule Pickup</Button>}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
