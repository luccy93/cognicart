'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { recommendationsApi, productsApi, featuresApi, aiApi, dashboardApi } from '@/lib/api';
import Link from 'next/link';
import { VoiceSearch } from '@/components/ui/voice-search';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import {
  LayoutDashboard, ShoppingBag, Package, Heart, ShoppingCart, Bell, Award,
  Users, Bot, User, Settings, LogOut, Menu, X, Search, Sun, Moon, ChevronDown,
  TrendingUp, Star, Clock, Flame, Sparkles, Zap, Gift, Target, Wallet,
  BarChart3, TrendingDown, Activity, Shield, CreditCard, Truck, CheckCircle,
  AlertCircle, ChevronRight, Eye, Plus, RefreshCw, Home,
} from 'lucide-react';

const COLORS = ['#FF5C00', '#00E5FF', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#6366F1', '#EC4899'];
const tierColors: Record<string, string> = { Bronze: 'from-amber-700/20 to-amber-700/5', Silver: 'from-slate-400/20 to-slate-400/5', Gold: 'from-yellow-500/20 to-yellow-500/5', Platinum: 'from-cyan-400/20 to-cyan-400/5', Diamond: 'from-blue-400/20 to-purple-400/5' };

function AnimatedCounter({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplay(value); clearInterval(timer); }
      else { setDisplay(Math.floor(current)); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  if (decimals > 0) return <>{display.toFixed(decimals)}{suffix}</>;
  return <>{display.toLocaleString('en-US')}{suffix}</>;
}

function CountdownTimer({ target }: { target: string }) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    const parts = target.split(':').map(Number);
    const tick = () => {
      let total = parts[0] * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
      if (total <= 0) { setDisplay('Ended'); return; }
      total -= 1;
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      setDisplay(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);
  return <span className="font-mono font-bold tabular-nums">{display}</span>;
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { addItem } = useCartStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMsg, setAssistantMsg] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: 'Hi! I\'m CogniBot. Ask me about products, orders, or deals!' }
  ]);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary().then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: recsData, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => dashboardApi.getRecommendations(8).then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: () => dashboardApi.getOrders(5).then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: notifData } = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: () => dashboardApi.getNotifications(10).then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: loyaltyData } = useQuery({
    queryKey: ['dashboard-loyalty'],
    queryFn: () => dashboardApi.getLoyalty().then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => dashboardApi.getAnalytics(30).then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: personaData } = useQuery({
    queryKey: ['persona'],
    queryFn: () => featuresApi.getPersona().then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: trendingData } = useQuery({
    queryKey: ['trending'],
    queryFn: () => recommendationsApi.trending(8).then(r => r.data),
    enabled: isAuthenticated,
  });

  const persona = summaryData?.persona || personaData;
  const stats = summaryData?.stats;
  const loyalty = summaryData?.loyalty || loyaltyData;
  const recommendations = recsData?.recommendations || recsData || [];
  const trending = trendingData?.data || trendingData || [];
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const notifications = notifData?.notifications || [];
  const unreadNotifCount = notifData?.unread_count || summaryData?.unread_notifications || 0;

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: <LayoutDashboard size={16} />, href: '/dashboard' },
    { id: 'products', label: 'Products', icon: <ShoppingBag size={16} />, href: '/products' },
    { id: 'orders', label: 'Orders', icon: <Package size={16} />, href: '/orders' },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={16} />, href: '/wishlist' },
    { id: 'cart', label: 'Cart', icon: <ShoppingCart size={16} />, href: '/cart' },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} />, href: '/notifications' },
    { id: 'loyalty', label: 'Loyalty Rewards', icon: <Award size={16} />, href: '/loyalty' },
    { id: 'community', label: 'Community', icon: <Users size={16} />, href: '/community' },
    { id: 'ai-assistant', label: 'AI Shopper', icon: <Bot size={16} />, href: '/ai-shopper' },
    { id: 'profile', label: 'Profile', icon: <User size={16} />, href: '/profile' },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} />, href: '/settings' },
  ];

  const statCards = [
    { label: 'Total Orders', value: stats?.total_orders || 0, icon: <ShoppingBag size={18} />, color: 'from-[--primary]/20 to-orange-500/10', iconColor: 'text-[--primary]', link: '/orders' },
    { label: 'Wishlist', value: stats?.wishlist_count || 0, icon: <Heart size={18} />, color: 'from-red-500/20 to-pink-500/10', iconColor: 'text-red-400', link: '/wishlist' },
    { label: 'Reward Points', value: stats?.reward_points || 0, icon: <Award size={18} />, color: 'from-amber-500/20 to-yellow-500/10', iconColor: 'text-amber-400', link: '/loyalty' },
    { label: 'Savings', value: stats?.total_savings || 0, icon: <Wallet size={18} />, color: 'from-[--secondary]/20 to-cyan-500/10', iconColor: 'text-[--secondary]', link: '/deals' },
    { label: 'AI Match', value: Math.round((stats?.ai_match_accuracy || 0) * 100), icon: <Target size={18} />, color: 'from-purple-500/20 to-indigo-500/10', iconColor: 'text-purple-400', link: '/ai-shopper', suffix: '%' },
    { label: 'Pending', value: stats?.pending_orders || 0, icon: <Clock size={18} />, color: 'from-yellow-500/20 to-amber-500/10', iconColor: 'text-yellow-400', link: '/orders' },
  ];

  const flashDeals = [
    { id: 'f1', name: 'Sony WH-1000XM5', price: 24999, original: 39990, discount: 37, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', ends: '2:15:30', sold: 68 },
    { id: 'f2', name: 'MacBook Air M3', price: 84999, original: 114990, discount: 26, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop', ends: '5:30:00', sold: 42 },
    { id: 'f3', name: 'Galaxy Watch 6', price: 24999, original: 35999, discount: 30, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', ends: '1:45:00', sold: 55 },
    { id: 'f4', name: 'AirPods Pro 2', price: 18999, original: 24999, discount: 24, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b3e2?w=400&h=300&fit=crop', ends: '3:00:00', sold: 81 },
  ];

  const handleVoiceResult = useCallback((text: string) => {
    setSearchQuery(text);
    router.push(`/search?q=${encodeURIComponent(text)}`);
  }, [router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleAddToCart = async (product: any) => {
    try {
      await addItem(product.id || product.product_id, 1);
    } catch {}
  };

  const handleAssistantSend = async () => {
    if (!assistantMsg.trim()) return;
    const newMsg = { role: 'user' as const, content: assistantMsg };
    setChatMessages(prev => [...prev, newMsg]);
    setAssistantMsg('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `I'm analyzing your shopping patterns. Your persona is "${persona?.persona_label || 'Shopping Enthusiast'}". I can help find the best products for you!` }]);
    }, 800);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-[#F5F5F5] flex">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 220 : 64 }}
        className="fixed left-0 top-0 h-screen z-40 bg-[#15151D] border-r border-white/[0.06] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 h-16 shrink-0 border-b border-white/[0.06]">
          {sidebarOpen && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF5C00] to-[#00E5FF] flex items-center justify-center text-black text-[10px] font-bold">C</div>
              <span className="font-bold text-sm tracking-wider">CogniCart</span>
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/5 text-[--muted]">
            {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
          {sidebarItems.map(item => (
            <Link key={item.id} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
                ${item.id === 'home' ? 'bg-gradient-to-r from-[#FF5C00]/15 to-[#FF5C00]/5 text-[#FF5C00] shadow-[inset_0_0_0_1px_rgba(255,92,0,0.2)]' : 'text-[#F5F5F5]/60 hover:bg-white/5 hover:text-white'}`}
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <Link href="/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400/60 hover:bg-red-500/5 hover:text-red-400 transition-all"
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-[220px]' : 'ml-16'} transition-all duration-300`}>
        {/* Top Nav */}
        <header className="sticky top-0 z-30 h-16 bg-[#0C0C0E]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-8 gap-4">
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 text-[--muted] pointer-events-none" />
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products, deals..."
              className="w-full bg-white/5 border border-white/[0.08] rounded-xl pl-10 pr-12 py-2 text-xs text-white placeholder-[--muted] focus:outline-none focus:border-[#FF5C00]/30 focus:bg-white/[0.08] transition-all"
            />
          </form>

          <div className="flex items-center gap-2">
            <VoiceSearch onResult={handleVoiceResult} />

            <button onClick={() => setNotifPanelOpen(!notifPanelOpen)} className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Bell size={16} />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF5C00] text-[8px] font-bold flex items-center justify-center text-white">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </button>

            <Link href="/wishlist" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Heart size={16} />
            </Link>

            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ShoppingCart size={16} />
            </Link>

            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF5C00] to-[#8B5CF6] flex items-center justify-center text-black text-[10px] font-bold">
                  {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <span className="text-xs hidden lg:block">{user?.full_name || user?.email?.split('@')[0] || 'User'}</span>
                <ChevronDown size={12} className="text-[--muted] hidden lg:block" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-2xl p-2 shadow-xl border border-white/[0.08] z-50"
                  >
                    <Link href="/profile" className="block px-3 py-2 rounded-xl text-xs hover:bg-white/5" onClick={() => setProfileOpen(false)}>Profile</Link>
                    <Link href="/settings" className="block px-3 py-2 rounded-xl text-xs hover:bg-white/5" onClick={() => setProfileOpen(false)}>Settings</Link>
                    <Link href="/orders" className="block px-3 py-2 rounded-xl text-xs hover:bg-white/5" onClick={() => setProfileOpen(false)}>My Orders</Link>
                    <hr className="my-1 border-white/[0.06]" />
                    <Link href="/logout" className="block px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/5">Logout</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 lg:p-8 space-y-8">
          {/* Hero Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#15151D] via-[#1a1a2e] to-[#15151D] border border-white/[0.06] p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,92,0,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(0,229,255,0.08),transparent_50%)]" />
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-[#FF5C00]/5 blur-3xl animate-pulse" />
            <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[#00E5FF]/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs px-3 py-1 rounded-full bg-[#FF5C00]/10 text-[#FF5C00] border border-[#FF5C00]/20 font-medium">
                  <Sparkles size={10} className="inline mr-1" />AI-Powered Dashboard
                </span>
                {persona && (
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                    {persona.persona_label}
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-4xl font-bold mt-4 font-space">
                Welcome back, <span className="bg-gradient-to-r from-[#FF5C00] to-[#8B5CF6] bg-clip-text text-transparent">{summaryData?.user_name || user?.full_name || user?.email?.split('@')[0] || 'Shopper'}</span>
              </h1>
              <p className="text-sm text-[--muted] mt-2 max-w-xl">
                Your AI-powered shopping universe is ready. Discover personalized recommendations, track orders, and unlock rewards.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/products"><Button variant="primary" size="sm" className="gap-2"><Sparkles size={14} /> Explore Recommendations</Button></Link>
                <Link href="/cart"><Button variant="secondary" size="sm" className="gap-2"><ShoppingCart size={14} /> Continue Shopping</Button></Link>
                <Link href="/orders"><Button variant="ghost" size="sm" className="gap-2"><Package size={14} /> Track Orders</Button></Link>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            {statCards.map((card, i) => (
              <Link key={i} href={card.link}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className={`relative rounded-2xl p-4 bg-gradient-to-br ${card.color} border border-white/[0.06] overflow-hidden group cursor-pointer`}
                >
                  <div className="absolute top-2 right-2 opacity-40 group-hover:opacity-100 transition-opacity">{card.icon}</div>
                  <p className="text-[10px] text-[--muted] font-medium mb-1">{card.label}</p>
                  <p className="text-lg font-bold font-space">
                    {card.label === 'AI Match' ? (
                      <><AnimatedCounter value={card.value as number} />{card.suffix}</>
                    ) : card.label === 'Savings' ? (
                      <>₹<AnimatedCounter value={card.value as number} /></>
                    ) : (
                      <AnimatedCounter value={card.value as number} />
                    )}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </Link>
            ))}
          </motion.div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left - Recommendations */}
            <div className="lg:col-span-2 space-y-6">

              {/* AI Recommendations */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold flex items-center gap-2"><Sparkles size={14} className="text-[#FF5C00]" /> Recommended For You</h2>
                  {recommendations.length > 0 && <Link href="/products" className="text-[10px] text-[--muted] hover:text-white flex items-center gap-1">View All <ChevronRight size={10} /></Link>}
                </div>
                {recsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-2xl bg-white/[0.03] animate-pulse p-3 space-y-2">
                        <div className="aspect-square rounded-xl bg-white/[0.05]" />
                        <div className="h-3 rounded bg-white/[0.05]" />
                        <div className="h-3 w-2/3 rounded bg-white/[0.05]" />
                      </div>
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {recommendations.slice(0, 8).map((product: any, i: number) => (
                      <motion.div key={product.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -6 }}
                        className="group rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:bg-white/[0.06] hover:border-[#FF5C00]/20 transition-all duration-300"
                      >
                        <Link href={`/products/${product.id || product.product_id}`}>
                          <div className="relative aspect-square overflow-hidden">
                            <img src={product.thumbnail_url || product.image || 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=300&fit=crop'}
                              alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=300&fit=crop'; }}
                            />
                            {(product.ai_match_score || product.match_score) && (
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#8B5CF6]/80 text-[8px] font-bold text-white backdrop-blur-sm">
                                {Math.round((product.ai_match_score || product.match_score || 0) * 100)}% Match
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="p-3">
                          <Link href={`/products/${product.id || product.product_id}`}>
                            <h3 className="text-[11px] font-medium truncate">{product.name}</h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-[#00E5FF]">₹{(product.price || product.sale_price || 0).toLocaleString('en-US')}</span>
                            {product.original_price && <span className="text-[9px] text-[--muted] line-through">₹{product.original_price.toLocaleString('en-US')}</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex items-center gap-0.5 text-[8px] text-amber-400">
                              <Star size={8} fill="currentColor" />
                              <span>{product.average_rating || product.rating || 4.0}</span>
                            </div>
                            <button onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                              className="ml-auto w-6 h-6 rounded-lg bg-[#FF5C00]/10 hover:bg-[#FF5C00]/20 text-[#FF5C00] flex items-center justify-center transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 text-center">
                    <Sparkles size={24} className="mx-auto text-[--muted] mb-2" />
                    <p className="text-xs text-[--muted]">Browse products to get personalized recommendations</p>
                    <Link href="/products"><Button variant="primary" size="sm" className="mt-3">Browse Products</Button></Link>
                  </div>
                )}
              </motion.section>

              {/* Trending Products */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold flex items-center gap-2"><TrendingUp size={14} className="text-[--secondary]" /> Trending Now</h2>
                  <Link href="/products" className="text-[10px] text-[--muted] hover:text-white flex items-center gap-1">View All <ChevronRight size={10} /></Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(trending.length > 0 ? trending : Array.from({ length: 4 })).slice(0, 4).map((product: any, i: number) => (
                    <div key={product.id || i} className="group rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:border-[--secondary]/20 transition-all">
                      <Link href={`/products/${product.id || product.product_id}`}>
                        <div className="relative aspect-square overflow-hidden">
                          <img src={product.thumbnail_url || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'}
                            alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'; }}
                          />
                          {product.discount && <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#FF5C00] text-[8px] font-bold">-{product.discount}%</div>}
                        </div>
                      </Link>
                      <div className="p-3">
                        <h3 className="text-[11px] font-medium truncate">{product.name || 'Trending Product'}</h3>
                        <p className="text-xs font-bold text-[--secondary] mt-1">₹{(product.price || product.sale_price || 0).toLocaleString('en-US')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Flash Deals */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold flex items-center gap-2"><Zap size={14} className="text-[#FF5C00]" /> Lightning Deals</h2>
                  <Link href="/deals" className="text-[10px] text-[--muted] hover:text-white flex items-center gap-1">All Deals <ChevronRight size={10} /></Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {flashDeals.map((deal, i) => (
                    <motion.div key={deal.id} whileHover={{ y: -4 }}
                      className="relative rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/10 overflow-hidden group"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={deal.image} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#FF5C00] text-[8px] font-bold">-{deal.discount}%</div>
                      </div>
                      <div className="p-3 space-y-1.5">
                        <h3 className="text-[11px] font-medium truncate">{deal.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#FF5C00]">₹{deal.price.toLocaleString('en-US')}</span>
                          <span className="text-[9px] text-[--muted] line-through">₹{deal.original.toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="flex items-center gap-1 text-red-400"><Clock size={8} /><CountdownTimer target={deal.ends} /></span>
                          <span className="text-[--muted]">{deal.sold}% sold</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Analytics Charts */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <h2 className="text-sm font-bold flex items-center gap-2 mb-4"><BarChart3 size={14} className="text-purple-400" /> Analytics</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                    <p className="text-[10px] text-[--muted] font-medium mb-3">Monthly Spending</p>
                    {(analyticsData?.monthly_spending && analyticsData.monthly_spending.length > 0) ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={analyticsData.monthly_spending}>
                          <defs>
                            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#FF5C00" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#FF5C00" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#666' }} tickFormatter={v => v?.slice(0, 7) || ''} />
                          <YAxis tick={{ fontSize: 9, fill: '#666' }} />
                          <Tooltip contentStyle={{ background: '#15151D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                          <Area type="monotone" dataKey="amount" stroke="#FF5C00" fill="url(#spendGrad)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[180px] flex items-center justify-center text-[10px] text-[--muted]">No spending data yet</div>
                    )}
                  </div>
                  <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                    <p className="text-[10px] text-[--muted] font-medium mb-3">Category Breakdown</p>
                    {(analyticsData?.category_spending && analyticsData.category_spending.length > 0) ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={analyticsData.category_spending} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="amount" nameKey="category">
                            {analyticsData.category_spending.map((_: any, i: number) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#15151D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[180px] flex items-center justify-center text-[10px] text-[--muted]">No category data yet</div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(analyticsData?.category_spending || []).slice(0, 4).map((cat: any, i: number) => (
                        <span key={i} className="text-[8px] px-2 py-0.5 rounded-full" style={{ background: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length] }}>
                          {cat.category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Orders Summary */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold flex items-center gap-2"><Package size={14} className="text-[--secondary]" /> Recent Orders</h2>
                  <Link href="/orders" className="text-[10px] text-[--muted] hover:text-white flex items-center gap-1">View All <ChevronRight size={10} /></Link>
                </div>
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                  {orders.length > 0 ? (
                    <div className="divide-y divide-white/[0.06]">
                      {orders.slice(0, 4).map((order: any, i: number) => {
                        const statusColor: Record<string, string> = { pending: 'text-yellow-400', processing: 'text-blue-400', shipped: 'text-purple-400', delivered: 'text-[--secondary]', cancelled: 'text-red-400' };
                        const statusIcon: Record<string, React.ReactNode> = { pending: <Clock size={10} />, processing: <RefreshCw size={10} />, shipped: <Truck size={10} />, delivered: <CheckCircle size={10} />, cancelled: <AlertCircle size={10} /> };
                        return (
                          <Link key={order.id || i} href={`/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center">
                                <Package size={14} className="text-[--muted]" />
                              </div>
                              <div>
                                <p className="text-xs font-medium">Order #{order.id?.slice(0, 8) || `ORD-${i}`}</p>
                                <p className="text-[10px] text-[--muted]">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold">₹{(order.total || 0).toLocaleString('en-US')}</span>
                              <span className={`flex items-center gap-1 text-[10px] ${statusColor[order.status] || 'text-[--muted]'}`}>
                                {statusIcon[order.status]} {order.status}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Package size={20} className="mx-auto text-[--muted] mb-2" />
                      <p className="text-xs text-[--muted]">No orders yet</p>
                      <Link href="/products"><Button variant="primary" size="sm" className="mt-3">Start Shopping</Button></Link>
                    </div>
                  )}
                </div>
              </motion.section>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">

              {/* AI Insights Panel */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-[#15151D] border border-purple-500/10 p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-purple-500/5 blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot size={14} className="text-purple-400" />
                    <h3 className="text-xs font-bold">AI Insights</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-[--muted]">Shopping Persona</p>
                      <p className="text-sm font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        {persona?.persona_label || 'Analyzing...'}
                      </p>
                      <div className="mt-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${Math.round((persona?.confidence || 0) * 100)}%` }} />
                      </div>
                      <p className="text-[9px] text-[--muted] mt-0.5">Confidence: {Math.round((persona?.confidence || 0) * 100)}%</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white/[0.04] p-2.5">
                        <p className="text-[18px] font-bold font-space">{analyticsData?.total_spent_30d ? `₹${(analyticsData.total_spent_30d).toLocaleString('en-US')}` : '₹0'}</p>
                        <p className="text-[9px] text-[--muted]">30 Day Spend</p>
                      </div>
                      <div className="rounded-xl bg-white/[0.04] p-2.5">
                        <p className="text-[18px] font-bold font-space">{analyticsData?.average_order_value ? `₹${Math.round(analyticsData.average_order_value).toLocaleString('en-US')}` : '₹0'}</p>
                        <p className="text-[9px] text-[--muted]">Avg Order Value</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[9px] text-[--muted]">Lifetime Value</p>
                        <span className="text-[9px] text-[--secondary] font-bold">{analyticsData?.clv ? `₹${Math.round(analyticsData.clv).toLocaleString('en-US')}` : 'Calculating...'}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[--secondary] to-cyan-400" style={{ width: `${Math.min((analyticsData?.clv || 0) / 1000, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Loyalty Widget */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-[#15151D] border border-amber-500/10 p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-500/5 blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-amber-400" />
                      <h3 className="text-xs font-bold">{loyalty?.tier || 'Bronze'} Member</h3>
                    </div>
                    <Link href="/loyalty" className="text-[9px] text-amber-400 hover:underline">View All</Link>
                  </div>
                  <div className="text-center mb-3">
                    <p className="text-2xl font-bold font-space text-amber-400">{(loyalty?.points || 0).toLocaleString('en-US')}</p>
                    <p className="text-[9px] text-[--muted]">Reward Points</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-amber-400">{loyalty?.tier || 'Bronze'}</span>
                      <span className="text-[--muted]">{loyalty?.next_tier || 'Silver'}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400" style={{ width: `${(loyalty?.progress || 0) * 100}%` }} />
                    </div>
                    <p className="text-[9px] text-[--muted] text-center">{(loyalty?.points_to_next || 0).toLocaleString('en-US')} points to {loyalty?.next_tier || 'Silver'}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 flex items-center gap-1.5 rounded-xl bg-white/[0.04] px-3 py-1.5">
                      <Flame size={10} className="text-orange-400" />
                      <span className="text-[9px]"><strong className="text-orange-400">{loyalty?.streak || 0}</strong> day streak</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Order Status */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5"
              >
                <h3 className="text-xs font-bold mb-3 flex items-center gap-2"><Activity size={14} className="text-[--muted]" /> Order Summary</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Pending', value: stats?.pending_orders || 0, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                    { label: 'Delivered', value: stats?.delivered_orders || 0, color: 'text-[--secondary]', bg: 'bg-[--secondary]/10' },
                    { label: 'Cancelled', value: stats?.cancelled_orders || 0, color: 'text-red-400', bg: 'bg-red-400/10' },
                    { label: 'Total', value: stats?.total_orders || 0, color: 'text-white', bg: 'bg-white/5' },
                  ].map((item, i) => (
                    <div key={i} className={`rounded-xl ${item.bg} p-2.5`}>
                      <p className={`text-lg font-bold font-space ${item.color}`}>{item.value}</p>
                      <p className="text-[9px] text-[--muted] mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
                <Link href="/orders">
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-[10px]">View All Orders <ChevronRight size={10} className="ml-1" /></Button>
                </Link>
              </motion.div>

              {/* Notifications */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold flex items-center gap-2"><Bell size={14} className="text-[--muted]" /> Notifications</h3>
                  <Link href="/notifications" className="text-[9px] text-[--muted] hover:text-white">View All</Link>
                </div>
                {notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.slice(0, 4).map((n: any, i: number) => (
                      <Link key={n.id || i} href={n.link || '/notifications'}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-colors ${!n.is_read ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${!n.is_read ? 'bg-[#FF5C00]/10 text-[#FF5C00]' : 'bg-white/[0.05] text-[--muted]'}`}>
                          <Bell size={10} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] truncate ${!n.is_read ? 'font-medium text-white' : 'text-[--muted]'}`}>
                            {n.title || n.message}
                          </p>
                          <p className="text-[8px] text-[--muted] mt-0.5">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</p>
                        </div>
                        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00] shrink-0 mt-1.5" />}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Bell size={16} className="mx-auto text-[--muted] mb-1" />
                    <p className="text-[10px] text-[--muted]">No notifications</p>
                  </div>
                )}
              </motion.div>

              {/* Quick Links */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5"
              >
                <h3 className="text-xs font-bold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Browse', icon: <ShoppingBag size={12} />, href: '/products' },
                    { label: 'Deals', icon: <Zap size={12} />, href: '/deals' },
                    { label: 'Wishlist', icon: <Heart size={12} />, href: '/wishlist' },
                    { label: 'AI Shopper', icon: <Bot size={12} />, href: '/ai-shopper' },
                  ].map((action, i) => (
                    <Link key={i} href={action.href}
                      className="flex items-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] p-2.5 transition-colors"
                    >
                      <span className="text-[--muted]">{action.icon}</span>
                      <span className="text-[10px] font-medium">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {notifPanelOpen && (
          <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-80 z-50 bg-[#15151D] border-l border-white/[0.06] shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-bold">Notifications</h3>
              <button onClick={() => setNotifPanelOpen(false)} className="p-1 rounded-lg hover:bg-white/5">
                <X size={14} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {notifications.length > 0 ? notifications.map((n: any, i: number) => (
                <div key={n.id || i} className={`p-3 rounded-xl ${!n.is_read ? 'bg-white/[0.04] border border-white/[0.06]' : 'hover:bg-white/[0.02]'}`}>
                  <p className="text-xs font-medium">{n.title || n.message}</p>
                  <p className="text-[10px] text-[--muted] mt-0.5">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</p>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Bell size={20} className="mx-auto text-[--muted] mb-2" />
                  <p className="text-xs text-[--muted]">No notifications yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Assistant */}
      <AnimatePresence>
        {assistantOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 h-96 rounded-2xl bg-[#15151D] border border-white/[0.08] shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-3 border-b border-white/[0.06] bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-purple-400" />
                <span className="text-xs font-bold">CogniBot</span>
              </div>
              <button onClick={() => setAssistantOpen(false)} className="p-1 rounded-lg hover:bg-white/5">
                <X size={12} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${msg.role === 'user' ? 'bg-[#FF5C00] text-white' : 'bg-white/[0.06] text-white/80'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-white/[0.06]">
              <div className="flex gap-2">
                <input
                  value={assistantMsg} onChange={e => setAssistantMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAssistantSend()}
                  placeholder="Ask CogniBot..."
                  className="flex-1 bg-white/5 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-[--muted] focus:outline-none focus:border-purple-500/30"
                />
                <button onClick={handleAssistantSend} className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors">
                  <SendIcon />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant FAB */}
      <button
        onClick={() => setAssistantOpen(!assistantOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20 flex items-center justify-center z-50 hover:scale-105 transition-transform"
      >
        <Bot size={20} />
      </button>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
