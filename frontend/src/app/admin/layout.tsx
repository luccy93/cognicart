'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Package, Users, ShoppingCart, BarChart3, Flag, TestTube, ScrollText, Menu, X, LogOut } from 'lucide-react';
import { ShootingStars } from '@/components/ui/shooting-stars';
import { VoiceSearch } from '@/components/ui/voice-search';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/feature-flags', label: 'Feature Flags', icon: Flag },
  { href: '/admin/ab-tests', label: 'A/B Tests', icon: TestTube },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleVoiceResult = (text: string) => {
    if (text.toLowerCase().includes('product')) { router.push('/admin/products'); }
    else if (text.toLowerCase().includes('order')) { router.push('/admin/orders'); }
    else if (text.toLowerCase().includes('user')) { router.push('/admin/users'); }
    else if (text.toLowerCase().includes('analytics')) { router.push('/admin/analytics'); }
    else { toast.success('Voice search: ' + text); }
  };

  return (
    <div className="min-h-screen mesh-bg">
      <ShootingStars count={6} />

      {/* Mobile header */}
      <div className="lg:hidden nav-blur h-14 flex items-center justify-between px-4 sticky top-0 z-40">
        <button onClick={() => setSidebarOpen(true)} className="p-2 glass rounded-lg">
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-[8px] text-black font-bold">C</div>
          <span className="font-bold text-sm">Admin</span>
        </div>
        <VoiceSearch onResult={handleVoiceResult} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-64 h-full glass border-r border-white/10 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-[10px] text-black font-bold">C</div>
                  <span className="font-bold text-sm">CogniCart</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 glass rounded-lg">
                  <X size={16} />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all ${
                        isActive ? 'bg-[--primary]/15 text-[--primary]' : 'text-[--muted] hover:text-white hover:bg-white/5'
                      }`}>
                        <item.icon size={16} />
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-6 pt-6 border-t border-white/10">
                <Link href="/">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[--muted] hover:text-white hover:bg-white/5 transition-all">
                    <LogOut size={16} />
                    Back to Site
                  </div>
                </Link>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-4 flex-col z-30">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-[11px] text-black font-bold">C</div>
          <div>
            <span className="font-bold text-sm">CogniCart</span>
            <span className="block text-[9px] text-[--muted]">Admin Panel</span>
          </div>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all ${
                  isActive ? 'bg-[--primary]/15 text-[--primary]' : 'text-[--muted] hover:text-white hover:bg-white/5'
                }`}>
                  <item.icon size={16} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <VoiceSearch onResult={handleVoiceResult} />
          <Link href="/">
            <span className="text-[10px] text-[--muted] hover:text-white transition-colors">Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
