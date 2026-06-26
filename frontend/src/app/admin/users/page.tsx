'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit3, Ban, Trash2, ChevronLeft, ChevronRight, Shield, User } from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface FallbackUser { id: number; name: string; email: string; role: string; status: string; orders: number; joined: string; avatar: string }

const fallbackUsers: FallbackUser[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', status: 'active', orders: 42, joined: 'Jan 15, 2024', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'customer', status: 'active', orders: 18, joined: 'Mar 8, 2024', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'customer', status: 'blocked', orders: 3, joined: 'Jun 22, 2024', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop' },
  { id: 4, name: 'David Lee', email: 'david@example.com', role: 'customer', status: 'active', orders: 27, joined: 'Feb 10, 2024', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'admin', status: 'active', orders: 56, joined: 'Dec 1, 2023', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop' },
  { id: 6, name: 'Frank Brown', email: 'frank@example.com', role: 'customer', status: 'active', orders: 9, joined: 'Aug 14, 2024', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop' },
  { id: 7, name: 'Grace Wilson', email: 'grace@example.com', role: 'customer', status: 'blocked', orders: 0, joined: 'Oct 30, 2024', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop' },
  { id: 8, name: 'Henry Taylor', email: 'henry@example.com', role: 'admin', status: 'active', orders: 71, joined: 'Sep 5, 2023', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop' },
  { id: 9, name: 'Ivy Martinez', email: 'ivy@example.com', role: 'customer', status: 'active', orders: 14, joined: 'Nov 19, 2024', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop' },
  { id: 10, name: 'Jack Anderson', email: 'jack@example.com', role: 'customer', status: 'active', orders: 5, joined: 'Jan 2, 2025', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop' },
];

const tabs = ['All', 'Customers', 'Admins'] as const;

function mapUser(item: any) {
  return {
    id: item.id,
    name: item.name || item.full_name || item.username || 'Unknown',
    email: item.email || '',
    role: item.role === 'admin' ? 'admin' : 'customer',
    status: item.is_blocked ? 'blocked' : 'active',
    orders: item.orders ?? item.order_count ?? 0,
    joined: item.joined || item.created_at ? new Date(item.created_at || item.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
    avatar: item.avatar || item.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop',
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState(fallbackUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleTab, setRoleTab] = useState<(typeof tabs)[number]>('All');
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const { data } = await adminApi.listUsers();
        const items = Array.isArray(data) ? data : data?.users || data?.items || [];
        setUsers(items.length > 0 ? items.map(mapUser) : fallbackUsers);
      } catch {
        toast.error('Failed to load users, showing sample data');
        setUsers(fallbackUsers);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function changeRole(userId: number, newRole: string) {
    try {
      await adminApi.updateUserRole(String(userId), newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated');
    } catch {
      toast.error('Failed to update user role');
    }
  }

  async function toggleStatus(userId: number) {
    try {
      await adminApi.toggleUserStatus(String(userId));
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u));
      toast.success('User status toggled');
    } catch {
      toast.error('Failed to toggle user status');
    }
  }

  const filtered = users.filter((u) => {
    if (roleTab === 'Customers' && u.role !== 'customer') return false;
    if (roleTab === 'Admins' && u.role !== 'admin') return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-xs text-[--secondary] font-medium">Admin Panel</span>
        <h1 className="text-3xl font-extrabold mt-1 text-gradient">Users</h1>
        <p className="text-sm text-[--muted] mt-1">Manage platform users and their permissions.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="input-glass pl-9 text-xs" />
        </div>
        <div className="flex glass rounded-lg overflow-hidden">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => { setRoleTab(tab); setPage(1); }} className={`px-4 py-2 text-xs transition-all ${roleTab === tab ? 'bg-[--primary]/20 text-white font-medium' : 'text-[--muted] hover:text-white'}`}>{tab}</button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="glass rounded-xl overflow-hidden card-3d">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[--muted]">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Orders</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" /><div className="space-y-1"><div className="h-3 w-28 bg-white/5 rounded animate-pulse" /><div className="h-3 w-36 bg-white/5 rounded animate-pulse" /></div></div></td>
                    <td className="py-3 px-4"><div className="h-4 w-14 bg-white/5 rounded-full animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-12 bg-white/5 rounded-full animate-pulse" /></td>
                    <td className="py-3 px-4 text-right"><div className="h-4 w-8 bg-white/5 rounded animate-pulse ml-auto" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-20 bg-white/5 rounded animate-pulse" /></td>
                    <td className="py-3 px-4 text-right"><div className="h-4 w-16 bg-white/5 rounded animate-pulse ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl overflow-hidden card-3d">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[--muted]">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Orders</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-[10px] text-[--muted]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${
                        u.role === 'admin' ? 'bg-[--primary]/15 text-[--primary] border border-[--primary]/20' : 'bg-white/5 text-[--muted]'
                      }`}>
                        {u.role === 'admin' && <Shield size={10} />}
                        {u.role === 'customer' && <User size={10} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        u.status === 'active' ? 'bg-[#00E676]/15 text-[#00E676]' : 'bg-red-500/15 text-red-400'
                      }`}>{u.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{u.orders}</td>
                    <td className="py-3 px-4 text-[--muted]">{u.joined}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => changeRole(u.id, u.role === 'admin' ? 'customer' : 'admin')} className="p-1.5 rounded-lg hover:bg-white/10 text-[--muted] hover:text-[--secondary]"><Edit3 size={14} /></button>
                        <button onClick={() => toggleStatus(u.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-[--muted] hover:text-yellow-400"><Ban size={14} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-[--muted] hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <span className="text-[11px] text-[--muted]">Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
        <div className="flex items-center gap-1">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg hover:bg-white/5 text-[--muted] disabled:opacity-30"><ChevronLeft size={15} /></button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs ${page === i + 1 ? 'bg-[--primary] text-black font-medium' : 'hover:bg-white/5 text-[--muted]'}`}>{i + 1}</button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-2 rounded-lg hover:bg-white/5 text-[--muted] disabled:opacity-30"><ChevronRight size={15} /></button>
        </div>
      </motion.div>
    </div>
  );
}
