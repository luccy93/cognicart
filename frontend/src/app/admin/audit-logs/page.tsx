'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DocumentIcon, SearchIcon, FilterIcon, ArrowLeftIcon, RefreshIcon, UserIcon, ClockIcon } from '@/components/ui/emoji-icons';
import { featuresApi } from '@/lib/api';
import toast from 'react-hot-toast';

const fallbackLogs = [
  { id: '1', user: 'Admin', action: 'user.role.update', entity: 'User #USR-1234', detail: 'Changed role from customer to admin', ip: '192.168.1.1', time: '2 min ago' },
  { id: '2', user: 'System', action: 'product.create', entity: 'Product #PRD-5678', detail: 'Created new product: Sony WH-1000XM5', ip: 'System', time: '15 min ago' },
  { id: '3', user: 'Admin', action: 'order.status.update', entity: 'Order #ORD-7842', detail: 'Changed status from pending to confirmed', ip: '192.168.1.1', time: '1h ago' },
  { id: '4', user: 'User #USR-5678', action: 'auth.login', entity: 'User Account', detail: 'Successful login from new device', ip: '203.0.113.42', time: '2h ago' },
  { id: '5', user: 'Admin', action: 'seller.verify', entity: 'Seller #SEL-001', detail: 'Verified seller: TechPro Electronics', ip: '192.168.1.1', time: '3h ago' },
  { id: '6', user: 'System', action: 'payment.process', entity: 'Payment #PAY-9012', detail: 'Payment of $278.00 processed for Order #ORD-7842', ip: 'System', time: '4h ago' },
  { id: '7', user: 'Admin', action: 'flag.toggle', entity: 'Feature Flag #f1', detail: 'Disabled feature: price_alerts', ip: '192.168.1.1', time: '5h ago' },
  { id: '8', user: 'User #USR-9012', action: 'password.reset', entity: 'User Account', detail: 'Password reset requested via email', ip: '198.51.100.7', time: '6h ago' },
  { id: '9', user: 'Admin', action: 'refund.process', entity: 'Refund #REF-003', detail: 'Refund of $1299.00 processed to customer', ip: '192.168.1.1', time: '8h ago' },
  { id: '10', user: 'System', action: 'cleanup.job', entity: 'Scheduled Task', detail: 'Database cleanup completed: 245 stale sessions removed', ip: 'System', time: '12h ago' },
];

const actionColors: Record<string, string> = {
  'user.role.update': 'bg-purple-400/15 text-purple-400',
  'product.create': 'bg-[--secondary]/15 text-[--secondary]',
  'order.status.update': 'bg-blue-400/15 text-blue-400',
  'auth.login': 'bg-[--primary]/15 text-[--primary]',
  'seller.verify': 'bg-amber-400/15 text-amber-400',
  'payment.process': 'bg-[--accent]/15 text-[--accent]',
  'flag.toggle': 'bg-yellow-400/15 text-yellow-400',
  'password.reset': 'bg-red-400/15 text-red-400',
  'refund.process': 'bg-pink-400/15 text-pink-400',
  'cleanup.job': 'bg-white/10 text-[--muted]',
};

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState(fallbackLogs);
  const [isLoading, setIsLoading] = useState(true);
  const perPage = 8;

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await featuresApi.getAuditLogs();
        setLogs(res.data ?? fallbackLogs);
      } catch {
        toast.error('Failed to load audit logs, using fallback');
        setLogs(fallbackLogs);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);
  
  useEffect(() => {
    setPage(1);
  }, [search, activeFilter]);

  const uniqueActions = Array.from(new Set(fallbackLogs.map(l => l.action)));

  const filtered = logs.filter(l => {
    if (activeFilter !== 'all' && l.action !== activeFilter) return false;
    const q = search.toLowerCase();
    return l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.entity.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">ADMIN · AUDIT LOGS</span>
          </div>
          <Link href="/admin" className="text-xs text-[--muted] hover:text-white flex items-center gap-1"><ArrowLeftIcon size={12} /> Admin</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold font-space">Audit Logs</h1>
          <p className="text-xs text-[--muted] mt-1">Track all administrative actions and system events</p>
        </motion.div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-xs"><SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="glass-input pl-9 text-sm" /></div>
          <Button variant="ghost" size="sm"><FilterIcon size={12} /> Filters</Button>
          <Button variant="ghost" size="sm"><RefreshIcon size={12} /> Refresh</Button>
        </div>

        <div className="flex gap-1 flex-wrap mb-6">
          <button onClick={() => { setActiveFilter('all'); setPage(1); }} className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-all ${activeFilter === 'all' ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'glass text-[--muted] hover:text-white'}`}>All</button>
          {uniqueActions.map(action => (
            <button key={action} onClick={() => { setActiveFilter(action); setPage(1); }} className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-all ${activeFilter === action ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'glass text-[--muted] hover:text-white'}`}>{action}</button>
          ))}
        </div>

        {isLoading ? (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="space-y-0">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-[52px] border-b border-white/5 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-white/5 text-[--muted]">
                <th className="text-left p-4 font-medium">Time</th><th className="text-left p-4 font-medium">User</th><th className="text-left p-4 font-medium">Action</th><th className="text-left p-4 font-medium">Entity</th><th className="text-left p-4 font-medium">Details</th><th className="text-left p-4 font-medium">IP</th>
              </tr></thead>
              <tbody>
                {paginated.map((log, i) => (
                  <motion.tr key={log.id} variants={itemVariants} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 whitespace-nowrap"><div className="flex items-center gap-1"><ClockIcon size={10} className="text-[--muted]" /><span>{log.time}</span></div></td>
                    <td className="p-4"><div className="flex items-center gap-1"><UserIcon size={10} className="text-[--muted]" />{log.user}</div></td>
                    <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] font-medium ${actionColors[log.action] || 'bg-white/10 text-[--muted]'}`}>{log.action}</span></td>
                    <td className="p-4 text-[--muted]">{log.entity}</td>
                    <td className="p-4 text-[--muted] max-w-xs truncate">{log.detail}</td>
                    <td className="p-4 text-[--muted] font-mono text-[10px]">{log.ip}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 glass rounded-lg text-xs disabled:opacity-30">Previous</button>
            <span className="text-xs text-[--muted]">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 glass rounded-lg text-xs disabled:opacity-30">Next</button>
          </div>
        )}
      </main>
    </div>
  );
}
