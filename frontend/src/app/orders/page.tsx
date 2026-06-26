'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { PackageIcon } from '@/components/ui/emoji-icons';

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
type FilterTab = 'All' | 'Active' | 'Completed' | 'Cancelled';

interface DisplayItem {
  name: string;
  price: number;
  qty: number;
  image: string;
}

interface DisplayOrder {
  id: string;
  date: string;
  status: OrderStatus;
  items: DisplayItem[];
  shippingAddress: string;
  paymentMethod: string;
  total: number;
}

const statusColors: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/20',
  Processing: 'bg-blue-400/15 text-blue-400 border-blue-400/20',
  Shipped: 'bg-purple-400/15 text-purple-400 border-purple-400/20',
  Delivered: 'bg-[--accent]/15 text-[--accent] border-[--accent]/20',
  Cancelled: 'bg-red-400/15 text-red-400 border-red-400/20',
};

function mapStatus(status: string): OrderStatus {
  const m: Record<string, OrderStatus> = {
    pending: 'Pending',
    confirmed: 'Processing',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Cancelled',
  };
  return m[status] ?? 'Pending';
}

function mapItem(item: any): DisplayItem {
  if (item && item.product) {
    return {
      name: item.product.name ?? item.name ?? '',
      price: item.price ?? item.product.price ?? 0,
      qty: item.quantity ?? item.qty ?? 1,
      image: item.product.thumbnail_url ?? item.product.images?.[0]?.url ?? item.image ?? '',
    };
  }
  return {
    name: item?.name ?? '',
    price: item?.price ?? 0,
    qty: item?.qty ?? 1,
    image: item?.image ?? '',
  };
}

function mapOrder(o: any): DisplayOrder {
  return {
    id: o.order_number ?? o.id ?? '',
    date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-CA') : o.date ?? '',
    status: mapStatus(o.status),
    items: (o.items ?? []).map(mapItem),
    shippingAddress: o.shipping_address ?? o.shippingAddress ?? '',
    paymentMethod: o.payment_method ?? o.payment_status ?? 'Card',
    total: o.total ?? 0,
  };
}

const filters: FilterTab[] = ['All', 'Active', 'Completed', 'Cancelled'];

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass rounded-xl overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <div className="w-28 h-4 rounded bg-white/5 animate-pulse" />
                <div className="w-20 h-3 rounded bg-white/5 animate-pulse" />
              </div>
              <div className="w-16 h-5 rounded-full bg-white/5 animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-2 text-right">
                <div className="w-12 h-3 rounded bg-white/5 animate-pulse ml-auto" />
                <div className="w-16 h-4 rounded bg-white/5 animate-pulse ml-auto" />
              </div>
              <div className="w-4 h-4 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchOrders() {
      try {
        setIsLoading(true);
        const res = await ordersApi.list();
        const data = res.data;
        let list: Order[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data?.items) {
          list = data.items;
        }
        if (!cancelled) setOrders(list.map(mapOrder));
      } catch (err: any) {
        if (!cancelled) {
          toast.error(err?.response?.data?.detail || 'Failed to load orders');
          setOrders([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchOrders();
    return () => { cancelled = true; };
  }, []);

  const filtered = orders.filter((o) => {
    switch (activeFilter) {
      case 'Active': return ['Pending', 'Processing', 'Shipped'].includes(o.status);
      case 'Completed': return o.status === 'Delivered';
      case 'Cancelled': return o.status === 'Cancelled';
      default: return true;
    }
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">MY ORDERS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/products" className="text-xs text-[--muted] hover:text-white">Shop</Link>
            <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-xs text-[--muted] mt-1">{isLoading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'order' : 'orders'} found`}</p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {filters.map((f) => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === f
                  ? 'bg-[--primary] text-black'
                  : 'glass text-[--muted] hover:text-white'
              }`}
            >
              {f}
            </motion.button>
          ))}
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-xl p-16 text-center">
            <div className="text-6xl mb-4 opacity-20"><PackageIcon size={14} /></div>
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-sm text-[--muted] mb-6">Start shopping to see your orders here</p>
            <Link href="/products"><Button variant="primary">Browse Products</Button></Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((order, i) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass rounded-xl card-3d overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm font-bold">{order.id}</span>
                        <p className="text-[10px] text-[--muted] mt-0.5">{order.date}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                        <p className="text-xs text-[--muted]">${order.total.toFixed(2)}</p>
                      </div>
                      <motion.svg
                        animate={{ rotate: expandedId === order.id ? 180 : 0 }}
                        className="w-4 h-4 text-[--muted]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedId === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/5 px-4 py-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-semibold text-[--primary] uppercase tracking-wider mb-2">Items</h4>
                              <div className="space-y-2">
                                {order.items.map((item, j) => (
                                  <div key={j} className="flex items-center gap-3 text-sm">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 shrink-0">
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs truncate">{item.name}</p>
                                      <p className="text-[10px] text-[--muted]">${item.price} × {item.qty}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold text-[--secondary] uppercase tracking-wider mb-1">Shipping Address</h4>
                                <p className="text-xs text-[--muted]">{order.shippingAddress}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-[--secondary] uppercase tracking-wider mb-1">Payment</h4>
                                <p className="text-xs text-[--muted]">{order.paymentMethod}</p>
                              </div>
                              <div className="mt-3 pt-3 border-t border-white/5 flex justify-between">
                                <span className="text-xs text-[--muted]">Total</span>
                                <span className="text-sm font-bold text-[--secondary]">${order.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                              <Link href={`/orders/${encodeURIComponent(order.id.replace('#', ''))}`}>
                                <Button variant="primary" size="sm">Track Order</Button>
                              </Link>
                            )}
                            <Link href={`/orders/${encodeURIComponent(order.id.replace('#', ''))}`}>
                              <Button variant="ghost" size="sm">View Details</Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
