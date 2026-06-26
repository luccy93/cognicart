'use client';

import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';
import { BellIcon, ChartDownIcon, GearIcon, LockIcon, PackageIcon, PartyIcon, StarIcon, TagIcon, TargetIcon } from '@/components/ui/emoji-icons';

type NotificationType = 'order_update' | 'promotion' | 'recommendation' | 'price_drop' | 'system';

interface Notification {
  id: number;
  type: NotificationType;
  icon: React.ReactNode;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const fallbackNotifications: Notification[] = [
  { id: 1, type: 'order_update', icon: <PackageIcon size={14} />, title: 'Order Shipped', message: 'Your order #COG-4821 has been shipped and is on its way.', timestamp: '2 min ago', read: false },
  { id: 2, type: 'recommendation', icon: <InfinityLoopIcon size={14} />, title: 'Based on Your Style', message: 'We found 5 new items that match your fashion preferences.', timestamp: '15 min ago', read: false },
  { id: 3, type: 'promotion', icon: <TagIcon size={14} />, title: 'Flash Sale: 40% Off', message: 'Limited time offer on electronics. Grab your deal now!', timestamp: '1 hour ago', read: false },
  { id: 4, type: 'price_drop', icon: <ChartDownIcon size={14} />, title: 'Price Drop Alert', message: 'Sony WH-1000XM5 dropped from $349 to $278.', timestamp: '2 hours ago', read: true },
  { id: 5, type: 'system', icon: <LockIcon size={14} />, title: 'Security Update', message: 'Your account security was enhanced. Review your settings.', timestamp: '5 hours ago', read: false },
  { id: 6, type: 'order_update', icon: <PackageIcon size={14} />, title: 'Order Delivered', message: 'Your order #COG-4789 was delivered successfully. Rate your experience!', timestamp: '1 day ago', read: true },
  { id: 7, type: 'recommendation', icon: <StarIcon size={14} />, title: 'New for You', message: 'Weekly picks curated by CogniCart AI just for you.', timestamp: '1 day ago', read: true },
  { id: 8, type: 'promotion', icon: <PartyIcon size={14} />, title: 'Birthday Bonus', message: 'Happy Birthday! Enjoy 25% off your next purchase.', timestamp: '2 days ago', read: true },
  { id: 9, type: 'price_drop', icon: <ChartDownIcon size={14} />, title: 'Price Drop: Nike Air Max', message: 'Nike Air Max 270 dropped from $150 to $109.', timestamp: '3 days ago', read: true },
  { id: 10, type: 'system', icon: <GearIcon size={14} />, title: 'Feature Update', message: 'CogniCart AI recommendations are now more personalized. Check them out!', timestamp: '4 days ago', read: false },
  { id: 11, type: 'order_update', icon: <PackageIcon size={14} />, title: 'Order Confirmed', message: 'Your order #COG-4932 has been confirmed. Estimated delivery: Jun 25.', timestamp: '5 days ago', read: true },
  { id: 12, type: 'recommendation', icon: <TargetIcon size={14} />, title: 'Trending in Gaming', message: 'Gaming accessories are trending. Explore the latest picks.', timestamp: '6 days ago', read: true },
];

const typeIcons: Record<string, React.ReactNode> = {
  order_update: <PackageIcon size={14} />,
  promotion: <TagIcon size={14} />,
  recommendation: <InfinityLoopIcon size={14} />,
  price_drop: <ChartDownIcon size={14} />,
  system: <GearIcon size={14} />,
};

function toRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return new Date(isoString).toLocaleDateString();
}

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'order_update', label: 'Order Updates' },
  { id: 'promotion', label: 'Promotions' },
  { id: 'recommendation', label: 'Recommendations' },
];

function SkeletonCard() {
  return (
    <div className="glass rounded-xl p-4 mb-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-white/10 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="h-4 w-32 rounded bg-white/10" />
            <div className="h-3 w-16 rounded bg-white/10 shrink-0" />
          </div>
          <div className="h-3 w-full rounded bg-white/10 mt-2" />
          <div className="h-3 w-3/4 rounded bg-white/10 mt-1.5" />
          <div className="flex items-center gap-2 mt-2">
            <div className="h-3 w-20 rounded-full bg-white/10" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function mapApiNotification(item: Record<string, unknown>): Notification {
  const rawType = String(item.type || 'system') as NotificationType;
  const type: NotificationType = ['order_update', 'promotion', 'recommendation', 'price_drop', 'system'].includes(rawType)
    ? rawType
    : 'system';
  return {
    id: Number(item.id),
    type,
    icon: typeIcons[type] || <GearIcon size={14} />,
    title: String(item.title || ''),
    message: String(item.message || ''),
    timestamp: item.timestamp
      ? toRelativeTime(String(item.timestamp))
      : item.created_at
        ? toRelativeTime(String(item.created_at))
        : String(item.time_ago || ''),
    read: item.is_read === true || item.read === true,
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(fallbackNotifications);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/notifications');
        if (cancelled) return;
        const data = res.data;
        let items: Record<string, unknown>[] = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data.items && Array.isArray(data.items)) {
          items = data.items;
        } else if (data.data && Array.isArray(data.data)) {
          items = data.data;
        }
        if (items.length > 0) {
          setNotifications(items.map(mapApiNotification));
        }
      } catch {
        if (!cancelled) {
          setNotifications(fallbackNotifications);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = [...notifications];
    if (activeFilter === 'unread') list = list.filter((n) => !n.read);
    else if (activeFilter !== 'all') list = list.filter((n) => n.type === activeFilter);
    return list;
  }, [notifications, activeFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.put('/notifications/read-all');
    } catch {
      // silently fail
    }
  };

  const toggleRead = async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
    try {
      await api.put(`/notifications/${id}/read`);
    } catch {
      // silently fail
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">NOTIFICATIONS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
            <Link href="/settings" className="text-xs text-[--muted] hover:text-white">Settings</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-xs text-[--muted] mt-1">{isLoading ? 'Loading...' : `${unreadCount} unread notifications`}</p>
          </div>
          {!isLoading && unreadCount > 0 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={markAllRead} className="btn-ghost text-xs">
              Mark all as read
            </motion.button>
          )}
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveFilter(tab.id); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${activeFilter === tab.id
                ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black'
                : 'glass text-[--muted] hover:text-white'
                }`}
            >
              {tab.label}
              {tab.id === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-white/20">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <SkeletonCard />
              </motion.div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-xl p-12 text-center">
            <div className="text-5xl mb-4 opacity-30"><BellIcon size={14} /></div>
            <h3 className="text-lg font-semibold mb-1">All caught up!</h3>
            <p className="text-xs text-[--muted]">{activeFilter === 'unread' ? 'No unread notifications' : 'No notifications in this category'}</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {paginated.map((notification, i) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => toggleRead(notification.id)}
                className={`glass rounded-xl p-4 mb-3 cursor-pointer transition-all duration-300 card-3d ${!notification.read
                  ? 'border-l-2 border-l-[--primary] bg-[--primary]/4'
                  : 'opacity-70 hover:opacity-100'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{notification.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm font-medium truncate ${!notification.read ? 'text-white' : 'text-[--muted]'}`}>{notification.title}</h3>
                      <span className="text-[10px] text-[--muted] shrink-0">{notification.timestamp}</span>
                    </div>
                    <p className="text-xs text-[--muted] mt-0.5 line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-[--muted]">{notification.type.replace('_', ' ')}</span>
                      {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-[--primary]" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 glass rounded-lg text-xs disabled:opacity-30">Previous</button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${page === i + 1 ? 'bg-[--primary] text-black' : 'glass text-[--muted] hover:text-white'}`}>{i + 1}</button>
              ))}
            </div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 glass rounded-lg text-xs disabled:opacity-30">Next</button>
          </div>
        )}
      </main>
    </div>
  );
}
