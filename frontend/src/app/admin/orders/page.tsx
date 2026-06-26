'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { adminApi, ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';

const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;
type OrderStatus = (typeof statuses)[number];

interface OrderItem {
  product: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  payment: 'completed' | 'pending' | 'failed';
}

const fallbackOrders: Order[] = [
  { id: '#ORD-001', customer: 'Alice Johnson', items: [{ product: 'Wireless Headphones Pro', qty: 1, price: 349.99 }, { product: 'USB-C Hub', qty: 2, price: 49.99 }], total: 449.97, status: 'Delivered', date: '2025-06-15', payment: 'completed' },
  { id: '#ORD-002', customer: 'Bob Smith', items: [{ product: 'Smart Watch Ultra', qty: 1, price: 599.99 }], total: 599.99, status: 'Processing', date: '2025-06-18', payment: 'completed' },
  { id: '#ORD-003', customer: 'Carol White', items: [{ product: 'Bluetooth Speaker X', qty: 1, price: 129.99 }, { product: 'Laptop Stand', qty: 1, price: 79.99 }, { product: 'Mechanical Keyboard', qty: 1, price: 149.99 }], total: 359.97, status: 'Shipped', date: '2025-06-17', payment: 'completed' },
  { id: '#ORD-004', customer: 'David Lee', items: [{ product: 'Gaming Mouse Pro', qty: 2, price: 89.99 }], total: 179.98, status: 'Pending', date: '2025-06-19', payment: 'pending' },
  { id: '#ORD-005', customer: 'Eve Davis', items: [{ product: '4K Webcam Stream', qty: 1, price: 199.99 }, { product: 'Noise Canceling Earbuds', qty: 1, price: 199.99 }], total: 399.98, status: 'Delivered', date: '2025-06-14', payment: 'completed' },
  { id: '#ORD-006', customer: 'Frank Brown', items: [{ product: 'Wireless Charger Pad', qty: 3, price: 39.99 }], total: 119.97, status: 'Cancelled', date: '2025-06-16', payment: 'failed' },
  { id: '#ORD-007', customer: 'Grace Wilson', items: [{ product: 'Smart Watch Ultra', qty: 1, price: 599.99 }, { product: 'Wireless Headphones Pro', qty: 1, price: 349.99 }], total: 949.98, status: 'Processing', date: '2025-06-19', payment: 'completed' },
  { id: '#ORD-008', customer: 'Henry Taylor', items: [{ product: 'Laptop Stand Adjustable', qty: 1, price: 79.99 }], total: 79.99, status: 'Shipped', date: '2025-06-18', payment: 'completed' },
  { id: '#ORD-009', customer: 'Ivy Martinez', items: [{ product: 'Mechanical Keyboard RGB', qty: 1, price: 149.99 }, { product: 'Gaming Mouse Pro', qty: 1, price: 89.99 }], total: 239.98, status: 'Pending', date: '2025-06-20', payment: 'pending' },
  { id: '#ORD-010', customer: 'Jack Anderson', items: [{ product: 'USB-C Hub 7-in-1', qty: 2, price: 49.99 }, { product: 'Wireless Charger Pad', qty: 1, price: 39.99 }], total: 139.97, status: 'Delivered', date: '2025-06-13', payment: 'completed' },
];

const statusBadgeClass: Record<string, string> = {
  Delivered: 'bg-[#00E676]/15 text-[#00E676]',
  Shipped: 'bg-[--primary]/15 text-[--primary]',
  Processing: 'bg-[--secondary]/15 text-[--secondary]',
  Pending: 'bg-yellow-500/15 text-yellow-400',
  Cancelled: 'bg-red-500/15 text-red-400',
};

const paymentBadgeClass: Record<string, string> = {
  completed: 'bg-[#00E676]/15 text-[#00E676]',
  pending: 'bg-yellow-500/15 text-yellow-400',
  failed: 'bg-red-500/15 text-red-400',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<OrderStatus>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const perPage = 5;

  useEffect(() => {
    adminApi.listOrders()
      .then((res) => setOrders(res.data.orders ?? res.data))
      .catch(() => { setOrders(fallbackOrders); toast.error('Failed to load orders, showing cached data'); })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    if (statusTab !== 'All' && o.status !== statusTab) return false;
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.customer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(id, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus as OrderStatus } : o)));
      toast.success(`Order ${id} updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update order status');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-24 rounded bg-white/5 animate-pulse" />
        <div className="h-8 w-48 rounded bg-white/5 animate-pulse" />
        <div className="h-4 w-72 rounded bg-white/5 animate-pulse" />
        <div className="h-10 rounded-xl bg-white/5 animate-pulse" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-xs text-[--secondary] font-medium">Admin Panel</span>
        <h1 className="text-3xl font-extrabold mt-1 text-gradient">Orders</h1>
        <p className="text-sm text-[--muted] mt-1">Track and manage all orders.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search orders..." className="input-glass pl-9 text-xs" />
        </div>
        <div className="flex glass rounded-lg overflow-hidden flex-wrap">
          {statuses.map((s) => (
            <button key={s} onClick={() => { setStatusTab(s); setPage(1); }} className={`px-3 py-2 text-xs transition-all whitespace-nowrap ${statusTab === s ? 'bg-[--primary]/20 text-white font-medium' : 'text-[--muted] hover:text-white'}`}>{s}</button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl overflow-hidden card-3d">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[--muted]">
                <th className="text-left py-3 px-4 font-medium">Order</th>
                <th className="text-left py-3 px-4 font-medium">Customer</th>
                <th className="text-center py-3 px-4 font-medium">Items</th>
                <th className="text-right py-3 px-4 font-medium">Total</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Payment</th>
                <th className="text-center py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((o, i) => (
                <>
                  <motion.tr key={o.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                    <td className="py-3 px-4 font-medium">{o.id}</td>
                    <td className="py-3 px-4 text-[--muted]">{o.customer}</td>
                    <td className="py-3 px-4 text-center">{o.items.length}</td>
                    <td className="py-3 px-4 text-right font-medium">${o.total.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusBadgeClass[o.status]}`}>{o.status}</span>
                    </td>
                    <td className="py-3 px-4 text-[--muted]">{o.date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${paymentBadgeClass[o.payment]}`}>{o.payment}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-[--muted] hover:text-[--secondary]"><Eye size={14} /></button>
                        {o.status === 'Pending' && <button onClick={() => handleStatusUpdate(o.id, 'Processing')} className="p-1.5 rounded-lg hover:bg-white/10 text-yellow-400 hover:text-[--secondary] text-[10px] font-medium" title="Mark Processing">→P</button>}
                        {o.status === 'Processing' && <button onClick={() => handleStatusUpdate(o.id, 'Shipped')} className="p-1.5 rounded-lg hover:bg-white/10 text-[--secondary] hover:text-[--primary] text-[10px] font-medium" title="Mark Shipped">→S</button>}
                        {o.status === 'Shipped' && <button onClick={() => handleStatusUpdate(o.id, 'Delivered')} className="p-1.5 rounded-lg hover:bg-white/10 text-[#00E676] hover:text-white text-[10px] font-medium" title="Mark Delivered">→D</button>}
                        <motion.div animate={{ rotate: expanded === o.id ? 180 : 0 }} className="text-[--muted]">
                          <ChevronDown size={14} />
                        </motion.div>
                      </div>
                    </td>
                  </motion.tr>
                  <AnimatePresence>
                    {expanded === o.id && (
                      <motion.tr key={`${o.id}-expanded`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <td colSpan={8} className="bg-white/5 px-4 py-3">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] text-[--muted] font-medium uppercase tracking-wider">Order Items</span>
                            {o.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-[--muted]">{item.product} × {item.qty}</span>
                                <span>${(item.price * item.qty).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="flex items-center justify-between text-xs font-medium border-t border-white/5 pt-1.5 mt-1">
                              <span>Total</span>
                              <span>${o.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

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
