'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StoreIcon, SearchIcon, CheckIcon, CloseIcon, ShieldIcon, TrendingUpIcon, ArrowLeftIcon } from '@/components/ui/emoji-icons';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const mockSellers = [
  { id: 's1', name: 'TechPro Electronics', email: 'contact@techpro.com', products: 342, sales: 15230, revenue: 284500, status: 'verified', joined: 'Jan 2023', rating: 4.8 },
  { id: 's2', name: 'SmartGear Official', email: 'info@smartgear.com', products: 189, sales: 8940, revenue: 167800, status: 'verified', joined: 'Mar 2023', rating: 4.6 },
  { id: 's3', name: 'NewStore Inc', email: 'hello@newstore.com', products: 12, sales: 89, revenue: 3200, status: 'pending', joined: 'Dec 2025', rating: 4.0 },
  { id: 's4', name: 'FreshStart Co', email: 'team@freshstart.co', products: 5, sales: 12, revenue: 450, status: 'pending', joined: 'Dec 2025', rating: 0 },
  { id: 's5', name: 'EliteBrand Store', email: 'contact@elitebrand.com', products: 512, sales: 23100, revenue: 421000, status: 'verified', joined: 'Feb 2023', rating: 4.9 },
];

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function AdminMarketplacePage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [sellerList, setSellerList] = useState(mockSellers);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/marketplace/sellers');
        if (data?.items && Array.isArray(data.items)) {
          setSellerList(data.items.map((s: any) => ({
            id: s.id,
            name: s.store_name || 'Unknown Store',
            email: s.store_slug ? `${s.store_slug}@marketplace.com` : 'unknown@marketplace.com',
            products: s.total_products || 0,
            sales: s.total_orders || 0,
            revenue: s.total_revenue || 0,
            status: s.is_verified ? 'verified' : 'pending',
            joined: s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A',
            rating: s.rating || 0,
          })));
        }
      } catch {
        setSellerList(mockSellers);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filtered = sellerList.filter(s => {
    if (filter === 'verified' && s.status !== 'verified') return false;
    if (filter === 'pending' && s.status !== 'pending') return false;
    return s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
  });

  const toggleStatus = async (id: string) => {
    const seller = sellerList.find(s => s.id === id);
    if (!seller) return;
    const newVerified = seller.status !== 'verified';
    const prev = sellerList;
    setSellerList(prev => prev.map(s => s.id === id ? { ...s, status: newVerified ? 'verified' : 'pending' } : s));
    try {
      await api.put(`/marketplace/sellers/${id}`, { is_verified: newVerified });
      toast.success(`Seller ${newVerified ? 'verified' : 'unverified'} successfully`);
    } catch {
      setSellerList(prev);
      toast.error('Failed to update seller status');
    }
  };

  const totalRevenue = sellerList.reduce((sum, s) => sum + s.revenue, 0);
  const totalSales = sellerList.reduce((sum, s) => sum + s.sales, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <nav className="nav-blur">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
              <span className="font-bold tracking-widest text-sm">ADMIN · MARKETPLACE</span>
            </div>
            <Link href="/admin" className="text-xs text-[--muted] hover:text-white flex items-center gap-1"><ArrowLeftIcon size={12} /> Admin</Link>
          </div>
        </nav>
        <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-bold font-space">Marketplace Management</h1>
            <p className="text-xs text-[--muted] mt-1">Manage sellers, verify accounts, and monitor performance</p>
          </motion.div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1,2,3].map(i => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse"><div className="h-3 w-24 bg-white/10 rounded mb-2" /><div className="h-7 w-16 bg-white/10 rounded" /></div>
            ))}
          </div>
          <div className="glass-card rounded-2xl overflow-hidden animate-pulse p-8"><div className="h-4 w-full bg-white/10 rounded" /></div>
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
            <span className="font-bold tracking-widest text-sm">ADMIN · MARKETPLACE</span>
          </div>
          <Link href="/admin" className="text-xs text-[--muted] hover:text-white flex items-center gap-1"><ArrowLeftIcon size={12} /> Admin</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold font-space">Marketplace Management</h1>
          <p className="text-xs text-[--muted] mt-1">Manage sellers, verify accounts, and monitor performance</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Sellers', value: sellerList.length, icon: <StoreIcon size={16} />, color: 'from-[--primary]/20 to-[--secondary]/20' },
            { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, icon: <TrendingUpIcon size={16} />, color: 'from-[--secondary]/20 to-[--accent]/20' },
            { label: 'Pending Verification', value: sellerList.filter(s => s.status === 'pending').length, icon: <ShieldIcon size={16} />, color: 'from-yellow-500/20 to-amber-500/20' },
          ].map((s, i) => (
            <motion.div key={i} variants={itemVariants} className={`glass-card rounded-xl p-4 bg-gradient-to-br ${s.color}`}>
              <div className="flex items-center gap-2 mb-1 text-[--muted] text-xs">{s.icon}{s.label}</div>
              <p className="text-2xl font-bold font-space">{s.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-xs"><SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sellers..." className="glass-input pl-9 text-sm" /></div>
          {(['all', 'verified', 'pending'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'glass text-[--muted] hover:text-white'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-white/5 text-[--muted]">
                <th className="text-left p-4 font-medium">Seller</th><th className="text-left p-4 font-medium">Products</th><th className="text-left p-4 font-medium">Sales</th><th className="text-left p-4 font-medium">Revenue</th><th className="text-left p-4 font-medium">Rating</th><th className="text-left p-4 font-medium">Status</th><th className="text-left p-4 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((seller, i) => (
                  <motion.tr key={seller.id} variants={itemVariants} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-[9px] font-bold">{seller.name.charAt(0)}</div><div><p className="font-medium">{seller.name}</p><p className="text-[10px] text-[--muted]">{seller.email}</p></div></div></td>
                    <td className="p-4">{seller.products}</td>
                    <td className="p-4">{seller.sales.toLocaleString('en-US')}</td>
                    <td className="p-4">${(seller.revenue / 1000).toFixed(1)}K</td>
                    <td className="p-4">{seller.rating > 0 ? seller.rating : '-'}</td>
                    <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${seller.status === 'verified' ? 'bg-[--secondary]/15 text-[--secondary] border border-[--secondary]/20' : 'bg-yellow-400/15 text-yellow-400 border border-yellow-400/20'}`}>{seller.status}</span></td>
                    <td className="p-4"><div className="flex gap-1"><Button variant={seller.status === 'verified' ? 'ghost' : 'primary'} size="sm" onClick={() => toggleStatus(seller.id)}>{seller.status === 'verified' ? <CloseIcon size={10} /> : <CheckIcon size={10} />}{seller.status === 'verified' ? 'Revoke' : 'Verify'}</Button></div></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
