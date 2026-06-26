'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';
import { TargetIcon, GiftIcon, DiamondIcon, TrendingUpIcon, ClockIcon, CheckIcon, CloseIcon, TrashIcon, PlusIcon, BellIcon, SettingsIcon, RefreshIcon, SearchIcon, ChartUpIcon } from '@/components/ui/emoji-icons';
import type { AITask, TrackedProduct, AutoBuyRule, PricePrediction, GiftRecommendation } from '@/types';

const tabs = [
  { id: 'tasks', label: 'AI Tasks', icon: <InfinityLoopIcon size={16} /> },
  { id: 'tracked', label: 'Tracked Products', icon: <TargetIcon size={16} /> },
  { id: 'autobuy', label: 'Auto-Buy Rules', icon: <InfinityLoopIcon size={16} /> },
  { id: 'predictions', label: 'Price Predictions', icon: <TrendingUpIcon size={16} /> },
  { id: 'gifts', label: 'Gift Finder', icon: <GiftIcon size={16} /> },
];

const sampleTasks: AITask[] = [
  { id: 't1', task_type: 'track_price', title: 'Track Sony Headphones', description: 'Notify when price drops below ₹25,000', status: 'active', params: { product_id: 'p1', target_price: 25000 }, result: {}, progress: 0, scheduled_at: null, completed_at: null, created_at: new Date().toISOString() },
  { id: 't2', task_type: 'search', title: 'Search Gaming Laptops', description: 'Find gaming laptops under ₹1,50,000 with RTX 4060', status: 'completed', params: { query: 'gaming laptop', max_price: 150000, category: 'laptops' }, result: { count: 12 }, progress: 100, scheduled_at: null, completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 't3', task_type: 'notify', title: 'Notify MacBook Air M3', description: 'Notify me when MacBook Air M3 is back in stock', status: 'active', params: { product_id: 'p3', condition: 'back_in_stock' }, result: {}, progress: 0, scheduled_at: null, completed_at: null, created_at: new Date().toISOString() },
  { id: 't4', task_type: 'compare', title: 'Compare iPhone 15 vs S24', description: 'Compare specs and prices', status: 'failed', params: { product_ids: ['p4', 'p5'] }, result: { error: 'Product data unavailable' }, progress: 45, scheduled_at: null, completed_at: null, created_at: new Date().toISOString() },
];

const sampleTracked: TrackedProduct[] = [
  { id: 'tp1', product_id: 'p1', product_name: 'Sony WH-1000XM5', product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', current_price: 29999, target_price: 25000, price_drop_threshold: 10, notify_on_price_drop: true, notify_on_stock: false, auto_buy_enabled: false, auto_buy_max_price: null, is_active: true, last_checked_price: 29999, lowest_price_seen: 27999, highest_price_seen: 34999, price_history: [], created_at: new Date().toISOString() },
  { id: 'tp2', product_id: 'p2', product_name: 'MacBook Air M3', product_image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop', current_price: 114999, target_price: 99999, price_drop_threshold: 15, notify_on_price_drop: true, notify_on_stock: true, auto_buy_enabled: true, auto_buy_max_price: 105000, is_active: true, last_checked_price: 114999, lowest_price_seen: 109999, highest_price_seen: 129999, price_history: [], created_at: new Date().toISOString() },
];

const sampleRules: AutoBuyRule[] = [
  { id: 'r1', name: 'Auto-Buy Sony Headphones', product_id: 'p1', category_id: null, condition_type: 'price_below', condition_value: 25000, max_price: 26000, quantity: 1, payment_method: 'card_visa', shipping_address_id: 'addr1', is_active: true, last_triggered_at: null, total_executions: 0, created_at: new Date().toISOString() },
  { id: 'r2', name: 'Buy Coffee Beans when low', product_id: 'p2', category_id: null, condition_type: 'reorder', condition_value: 21, max_price: 1500, quantity: 2, payment_method: null, shipping_address_id: null, is_active: false, last_triggered_at: '2026-05-12T10:00:00Z', total_executions: 3, created_at: new Date().toISOString() },
];

const samplePredictions: PricePrediction[] = [
  { id: 'pp1', product_id: 'p1', product_name: 'Sony WH-1000XM5', product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', current_price: 29999, predicted_price: 24999, predicted_price_range_min: 23999, predicted_price_range_max: 25999, expected_drop_amount: 5000, expected_drop_percentage: 16.7, confidence: 87, predicted_drop_date: '2026-07-15', prediction_horizon_days: 21, factors: { season: 'summer_sale', competitor_pricing: true }, created_at: new Date().toISOString() },
  { id: 'pp2', product_id: 'p2', product_name: 'MacBook Air M3', product_image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop', current_price: 114999, predicted_price: 99999, predicted_price_range_min: 94999, predicted_price_range_max: 104999, expected_drop_amount: 15000, expected_drop_percentage: 13.0, confidence: 72, predicted_drop_date: '2026-08-01', prediction_horizon_days: 38, factors: { new_model_release: 'M4_expected' }, created_at: new Date().toISOString() },
];

const sampleGifts: GiftRecommendation[] = [
  { id: 'g1', recipient_name: 'Mom', occasion: 'Birthday', budget: 5000, recommended_products: [], bundle_products: [], total_bundle_price: 4750, reasoning: 'Based on Mom\'s interest in home decor and wellness, we recommend a curated gift bundle.', created_at: new Date().toISOString() },
];

function createTaskForm(taskType: string) {
  switch (taskType) {
    case 'search': return { query: '', max_price: '', category: '' };
    case 'track_price': return { product_id: '', target_price: '' };
    case 'auto_buy': return { product_id: '', max_price: '', condition: 'price_below' };
    case 'compare': return { product_ids: '' };
    case 'notify': return { product_id: '', condition: 'back_in_stock' };
    default: return {};
  }
}

export default function AIShopperPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTrackForm, setShowTrackForm] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [newTask, setNewTask] = useState<{ task_type: string; title: string; description: string; params: Record<string, string> }>({ task_type: 'search', title: '', description: '', params: { query: '', max_price: '', category: '' } });
  const [newTrack, setNewTrack] = useState({ product_id: '', target_price: '', notify_price_drop: true, auto_buy: false });
  const [newRule, setNewRule] = useState({ name: '', product_id: '', condition_type: 'price_below', condition_value: '', max_price: '' });
  const [giftForm, setGiftForm] = useState({ recipient_name: '', age_group: '', relationship: '', occasion: 'Birthday', budget: '', interests: '' });
  const [predictionInput, setPredictionInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['ai-tasks'],
    queryFn: () => aiApi.getTasks(),
    enabled: isAuthenticated,
  });

  const { data: trackedData } = useQuery({
    queryKey: ['ai-tracked'],
    queryFn: () => aiApi.getTrackedProducts(),
    enabled: isAuthenticated,
  });

  const { data: rulesData } = useQuery({
    queryKey: ['ai-rules'],
    queryFn: () => aiApi.getAutoBuyRules(),
    enabled: isAuthenticated,
  });

  const { data: predictionsData } = useQuery({
    queryKey: ['ai-predictions'],
    queryFn: () => aiApi.getPricePredictions(),
    enabled: isAuthenticated,
  });

  const { data: giftsData } = useQuery({
    queryKey: ['ai-gifts'],
    queryFn: () => aiApi.getGiftRecommendations(),
    enabled: isAuthenticated,
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => aiApi.createTask(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ai-tasks'] }); setShowTaskForm(false); },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => aiApi.deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-tasks'] }),
  });

  const executeTaskMutation = useMutation({
    mutationFn: (id: string) => aiApi.executeTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-tasks'] }),
  });

  const generateGiftMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => aiApi.generateGiftRecommendation(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ai-gifts'] }); setShowGiftForm(false); },
  });

  const tasks = tasksData?.data?.items || sampleTasks;
  const tracked = trackedData?.data?.items || sampleTracked;
  const rules = rulesData?.data?.items || sampleRules;
  const predictions = predictionsData?.data?.items || samplePredictions;
  const gifts = giftsData?.data?.items || sampleGifts;

  if (!isAuthenticated || !user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-9 h-9 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black">
              <InfinityLoopIcon size={16} />
            </Link>
            <span className="font-space text-sm font-bold tracking-widest">AI SHOPPER</span>
          </div>
          <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white transition-colors">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl glass-strong p-6 sm:p-8 mb-6 neural-grid">
          <div className="absolute inset-0 bg-gradient-to-br from-[--primary]/15 via-purple-500/5 to-[--secondary]/10" />
          <div className="absolute -top-16 right-10 w-40 h-40 rounded-full bg-[--primary]/5 blur-[80px] animate-breathe" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black flex-shrink-0">
              <InfinityLoopIcon size={24} variant="avatar" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-space font-bold text-gradient-primary">{user.full_name?.split(' ')[0] || 'Alex'}'s AI Shopper</h1>
              <p className="text-sm text-[--muted] mt-1 max-w-xl">Your personal shopping agent — track prices, auto-buy, predict deals, and find perfect gifts.</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none" variants={containerVariants} initial="hidden" animate="visible">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              variants={itemVariants}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'glass-pill px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-2',
                activeTab === tab.id
                  ? 'glow-primary bg-gradient-to-r from-[--primary] to-[--secondary] text-black shadow-lg shadow-[--primary]/20'
                  : 'text-[--muted] hover:text-white hover:border-white/20 border border-transparent'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {activeTab === 'tasks' && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold font-space text-gradient-primary">AI Tasks</h2>
                <p className="text-xs text-[--muted]">Manage your automated shopping tasks</p>
              </div>
              <button onClick={() => setShowTaskForm(true)} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                <PlusIcon size={14} />
                New Task
              </button>
            </motion.div>

            <AnimatePresence>
              {showTaskForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="glass-card rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Create New Task</h3>
                      <button onClick={() => setShowTaskForm(false)} className="p-1 rounded-lg text-[--muted] hover:text-white hover:bg-white/5"><CloseIcon size={14} /></button>
                    </div>
                    <select value={newTask.task_type} onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value, params: createTaskForm(e.target.value) as Record<string, string> })}
                      className="glass-input w-full text-xs py-2.5 px-3 rounded-xl">
                      <option value="search" className="bg-[--surface]">Search Products</option>
                      <option value="track_price" className="bg-[--surface]">Track Price</option>
                      <option value="auto_buy" className="bg-[--surface]">Auto Buy</option>
                      <option value="compare" className="bg-[--surface]">Compare</option>
                      <option value="notify" className="bg-[--surface]">Notify Me</option>
                    </select>
                    <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Task title" className="glass-input w-full text-xs py-2.5 px-3 rounded-xl" />
                    <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Description" className="glass-input w-full text-xs py-2.5 px-3 rounded-xl resize-none h-20" />
                    {newTask.task_type === 'search' && (
                      <div className="grid grid-cols-2 gap-3">
                        <input value={(newTask.params as any).query} onChange={(e) => setNewTask({ ...newTask, params: { ...(newTask.params as any), query: e.target.value } })}
                          placeholder="Search query" className="glass-input text-xs py-2 px-3 rounded-xl" />
                        <input value={(newTask.params as any).max_price} onChange={(e) => setNewTask({ ...newTask, params: { ...(newTask.params as any), max_price: e.target.value } })}
                          placeholder="Max price" type="number" className="glass-input text-xs py-2 px-3 rounded-xl" />
                      </div>
                    )}
                    {(newTask.task_type === 'track_price' || newTask.task_type === 'auto_buy' || newTask.task_type === 'notify') && (
                      <div className="grid grid-cols-2 gap-3">
                        <input value={(newTask.params as any).product_id} onChange={(e) => setNewTask({ ...newTask, params: { ...(newTask.params as any), product_id: e.target.value } })}
                          placeholder="Product ID" className="glass-input text-xs py-2 px-3 rounded-xl" />
                        {newTask.task_type === 'track_price' && (
                          <input value={(newTask.params as any).target_price} onChange={(e) => setNewTask({ ...newTask, params: { ...(newTask.params as any), target_price: e.target.value } })}
                            placeholder="Target price" type="number" className="glass-input text-xs py-2 px-3 rounded-xl" />
                        )}
                        {newTask.task_type === 'auto_buy' && (
                          <input value={(newTask.params as any).max_price} onChange={(e) => setNewTask({ ...newTask, params: { ...(newTask.params as any), max_price: e.target.value } })}
                            placeholder="Max price" type="number" className="glass-input text-xs py-2 px-3 rounded-xl" />
                        )}
                      </div>
                    )}
                    {newTask.task_type === 'compare' && (
                      <input value={(newTask.params as any).product_ids} onChange={(e) => setNewTask({ ...newTask, params: { ...(newTask.params as any), product_ids: e.target.value } })}
                        placeholder="Product IDs (comma separated)" className="glass-input w-full text-xs py-2 px-3 rounded-xl" />
                    )}
                    <button onClick={() => createTaskMutation.mutate({ task_type: newTask.task_type, title: newTask.title, description: newTask.description, params: newTask.params })}
                      disabled={!newTask.title} className="btn-primary text-xs px-4 py-2 w-full flex items-center justify-center gap-1.5">
                      <SearchIcon size={12} />
                      Create Task
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {tasksLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card rounded-xl p-5"><div className="h-4 skeleton w-3/4 mb-2" /><div className="h-3 skeleton w-1/2" /></div>)}</div>
            ) : (
              <motion.div variants={containerVariants} className="space-y-3">
                {tasks.map((task: AITask) => (
                  <motion.div key={task.id} variants={itemVariants} className="glass-card rounded-xl p-5 relative overflow-hidden group hover-glow-primary">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold">{task.title}</h3>
                          <span className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-medium',
                            task.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                            task.status === 'completed' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/20' :
                            'bg-red-500/20 text-red-400 border border-red-500/20'
                          )}>
                            {task.status}
                          </span>
                        </div>
                        {task.description && <p className="text-xs text-[--muted]">{task.description}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-[--muted] font-mono">{task.task_type.replace('_', ' ')}</span>
                          {task.progress > 0 && task.progress < 100 && (
                            <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${task.progress}%` }}
                                className="h-full bg-gradient-to-r from-[--primary] to-[--secondary] rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {task.status === 'active' && (
                          <button onClick={() => executeTaskMutation.mutate(task.id)}
                            className="p-1.5 rounded-lg bg-[--primary]/10 text-[--primary] hover:bg-[--primary]/20 transition-all">
                            <RefreshIcon size={12} />
                          </button>
                        )}
                        <button onClick={() => deleteTaskMutation.mutate(task.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
                          <TrashIcon size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'tracked' && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold font-space text-gradient-primary">Tracked Products</h2>
                <p className="text-xs text-[--muted]">Monitor prices and get alerts</p>
              </div>
              <button onClick={() => setShowTrackForm(true)} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                <PlusIcon size={14} />
                Track New Product
              </button>
            </motion.div>

            <AnimatePresence>
              {showTrackForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="glass-card rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Track a Product</h3>
                      <button onClick={() => setShowTrackForm(false)} className="p-1 rounded-lg text-[--muted] hover:text-white hover:bg-white/5"><CloseIcon size={14} /></button>
                    </div>
                    <input value={newTrack.product_id} onChange={(e) => setNewTrack({ ...newTrack, product_id: e.target.value })}
                      placeholder="Product ID" className="glass-input w-full text-xs py-2 px-3 rounded-xl" />
                    <input value={newTrack.target_price} onChange={(e) => setNewTrack({ ...newTrack, target_price: e.target.value })}
                      placeholder="Target price" type="number" className="glass-input w-full text-xs py-2 px-3 rounded-xl" />
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={newTrack.notify_price_drop} onChange={(e) => setNewTrack({ ...newTrack, notify_price_drop: e.target.checked })} className="rounded" />
                      Notify on price drop
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={newTrack.auto_buy} onChange={(e) => setNewTrack({ ...newTrack, auto_buy: e.target.checked })} className="rounded" />
                      Enable auto-buy
                    </label>
                    <button onClick={() => aiApi.trackProduct(newTrack).then(() => { queryClient.invalidateQueries({ queryKey: ['ai-tracked'] }); setShowTrackForm(false); })}
                      className="btn-primary text-xs px-4 py-2 w-full">
                      Start Tracking
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracked.map((tp: TrackedProduct) => (
                <motion.div key={tp.id} variants={itemVariants} className="glass-card rounded-2xl overflow-hidden group hover-glow-primary">
                  <div className="relative aspect-[4/3] bg-[--surface]">
                    {tp.product_image ? <img src={tp.product_image} alt={tp.product_name || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : (
                      <div className="w-full h-full flex items-center justify-center text-[--muted]"><TargetIcon size={32} /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-2 left-2 flex gap-1">
                      {tp.notify_on_price_drop && <span className="glass-pill px-2 py-0.5 text-[10px] bg-[--accent]/20 text-[--accent] border border-[--accent]/30">Price Alert</span>}
                      {tp.auto_buy_enabled && <span className="glass-pill px-2 py-0.5 text-[10px] bg-[--primary]/20 text-[--primary] border border-[--primary]/30">Auto-Buy</span>}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-white">₹{tp.current_price?.toLocaleString('en-US') || 'N/A'}</span>
                        {tp.target_price && <span className="text-[10px] text-[--muted] ml-2 line-through">₹{tp.target_price.toLocaleString('en-US')}</span>}
                      </div>
                      {tp.lowest_price_seen && <span className="text-[10px] text-green-400">Low: ₹{tp.lowest_price_seen.toLocaleString('en-US')}</span>}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold truncate">{tp.product_name || `Product #${tp.product_id}`}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        {tp.target_price && tp.current_price && (
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (tp.target_price / tp.current_price) * 100)}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-green-400 to-[--secondary]" transition={{ duration: 1 }} />
                        )}
                      </div>
                      <span className="text-[10px] text-[--muted]">{tp.price_history?.length || 0} updates</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                      <button onClick={() => aiApi.deleteTrackedProduct(tp.id).then(() => queryClient.invalidateQueries({ queryKey: ['ai-tracked'] }))}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"><TrashIcon size={12} /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'autobuy' && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold font-space text-gradient-primary">Auto-Buy Rules</h2>
                <p className="text-xs text-[--muted]">Set rules to automatically purchase products</p>
              </div>
              <button onClick={() => setShowRuleForm(true)} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                <PlusIcon size={14} />
                New Rule
              </button>
            </motion.div>

            <AnimatePresence>
              {showRuleForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="glass-card rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">New Auto-Buy Rule</h3>
                      <button onClick={() => setShowRuleForm(false)} className="p-1 rounded-lg text-[--muted] hover:text-white hover:bg-white/5"><CloseIcon size={14} /></button>
                    </div>
                    <input value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      placeholder="Rule name" className="glass-input w-full text-xs py-2 px-3 rounded-xl" />
                    <input value={newRule.product_id} onChange={(e) => setNewRule({ ...newRule, product_id: e.target.value })}
                      placeholder="Product ID" className="glass-input w-full text-xs py-2 px-3 rounded-xl" />
                    <select value={newRule.condition_type} onChange={(e) => setNewRule({ ...newRule, condition_type: e.target.value })}
                      className="glass-input w-full text-xs py-2.5 px-3 rounded-xl">
                      <option value="price_below" className="bg-[--surface]">Price Below</option>
                      <option value="reorder" className="bg-[--surface]">Reorder After Days</option>
                      <option value="stock_available" className="bg-[--surface]">Stock Available</option>
                    </select>
                    <input value={newRule.condition_value} onChange={(e) => setNewRule({ ...newRule, condition_value: e.target.value })}
                      placeholder={newRule.condition_type === 'reorder' ? 'Days since last purchase' : 'Price threshold'} type="number"
                      className="glass-input w-full text-xs py-2 px-3 rounded-xl" />
                    <input value={newRule.max_price} onChange={(e) => setNewRule({ ...newRule, max_price: e.target.value })}
                      placeholder="Max price (optional)" type="number" className="glass-input w-full text-xs py-2 px-3 rounded-xl" />
                    <button onClick={() => aiApi.createAutoBuyRule(newRule).then(() => { queryClient.invalidateQueries({ queryKey: ['ai-rules'] }); setShowRuleForm(false); })}
                      disabled={!newRule.name} className="btn-primary text-xs px-4 py-2 w-full">
                      Create Rule
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={containerVariants} className="space-y-3">
              {rules.map((rule: AutoBuyRule) => (
                <motion.div key={rule.id} variants={itemVariants} className="glass-card rounded-xl p-5 relative overflow-hidden group hover-glow-primary">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold">{rule.name}</h3>
                        <span className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full font-medium',
                          rule.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        )}>{rule.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                      <p className="text-xs text-[--muted] capitalize">
                        {rule.condition_type === 'price_below' ? 'Price below' : rule.condition_type === 'reorder' ? 'Reorder after' : 'Stock available'}
                        {rule.condition_value ? <span className="text-white font-mono ml-1">₹{rule.condition_value.toLocaleString('en-US')}</span> : ''}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-[--muted]">Qty: {rule.quantity}</span>
                        {rule.max_price && <span className="text-[10px] text-[--muted]">Max: ₹{rule.max_price.toLocaleString('en-US')}</span>}
                        <span className="text-[10px] text-[--muted]">Executed: {rule.total_executions}x</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        onClick={() => aiApi.updateAutoBuyRule(rule.id, { is_active: !rule.is_active }).then(() => queryClient.invalidateQueries({ queryKey: ['ai-rules'] }))}
                        className={cn('w-10 h-5 rounded-full transition-colors relative cursor-pointer', rule.is_active ? 'bg-[--primary]' : 'bg-white/20')}
                      >
                        <div className={cn('w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform', rule.is_active ? 'translate-x-5' : 'translate-x-0.5')} />
                      </div>
                      <button onClick={() => aiApi.deleteAutoBuyRule(rule.id).then(() => queryClient.invalidateQueries({ queryKey: ['ai-rules'] }))}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"><TrashIcon size={12} /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'predictions' && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold font-space text-gradient-primary">Price Predictions</h2>
                <p className="text-xs text-[--muted]">AI predicts when prices will drop</p>
              </div>
              <button onClick={() => setShowPredictionForm(true)} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                <ChartUpIcon size={14} />
                Generate Prediction
              </button>
            </motion.div>

            <AnimatePresence>
              {showPredictionForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="glass-card rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Generate Price Prediction</h3>
                      <button onClick={() => setShowPredictionForm(false)} className="p-1 rounded-lg text-[--muted] hover:text-white hover:bg-white/5"><CloseIcon size={14} /></button>
                    </div>
                    <input value={predictionInput} onChange={(e) => setPredictionInput(e.target.value)}
                      placeholder="Enter Product ID" className="glass-input w-full text-xs py-2 px-3 rounded-xl" />
                    <button onClick={() => aiApi.generatePrediction(predictionInput).then(() => { queryClient.invalidateQueries({ queryKey: ['ai-predictions'] }); setShowPredictionForm(false); })}
                      disabled={!predictionInput} className="btn-primary text-xs px-4 py-2 w-full">
                      Predict Price
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {predictions.map((pred: PricePrediction) => {
                const savings = pred.current_price - pred.predicted_price;
                return (
                  <motion.div key={pred.id} variants={itemVariants} className="glass-card rounded-2xl overflow-hidden group hover-glow-primary">
                    <div className="flex">
                      <div className="w-24 h-24 bg-[--surface] flex-shrink-0">
                        {pred.product_image ? <img src={pred.product_image} alt={pred.product_name || ''} className="w-full h-full object-cover" /> : (
                          <div className="w-full h-full flex items-center justify-center"><DiamondIcon size={24} className="text-[--muted]" /></div>
                        )}
                      </div>
                      <div className="flex-1 p-4">
                        <h3 className="text-sm font-semibold truncate">{pred.product_name || `Product #${pred.product_id}`}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold text-[--secondary]">₹{pred.current_price.toLocaleString('en-US')}</span>
                          <span className="text-sm text-green-400 line-through">₹{pred.predicted_price.toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">Save ₹{savings.toLocaleString('en-US')}</span>
                          <span className="text-[10px] text-[--muted]">-{pred.expected_drop_percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-2 text-xs text-[--muted] mb-2">
                        <span>Confidence:</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pred.confidence}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-[--primary] to-[--secondary]" transition={{ duration: 1 }} />
                        </div>
                        <span className="font-mono">{pred.confidence}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        {pred.predicted_drop_date && (
                          <span className="text-[10px] text-[--muted] flex items-center gap-1">
                            <ClockIcon size={10} />
                            Predicted: {new Date(pred.predicted_drop_date).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-[10px] text-[--muted]">{pred.prediction_horizon_days}d horizon</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'gifts' && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold font-space text-gradient-primary">Gift Finder</h2>
                <p className="text-xs text-[--muted]">AI-powered gift recommendations</p>
              </div>
              <button onClick={() => setShowGiftForm(true)} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                <GiftIcon size={14} />
                Find a Gift
              </button>
            </motion.div>

            <AnimatePresence>
              {showGiftForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="glass-card rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Gift Recommendation</h3>
                      <button onClick={() => setShowGiftForm(false)} className="p-1 rounded-lg text-[--muted] hover:text-white hover:bg-white/5"><CloseIcon size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={giftForm.recipient_name} onChange={(e) => setGiftForm({ ...giftForm, recipient_name: e.target.value })}
                        placeholder="Recipient name" className="glass-input text-xs py-2 px-3 rounded-xl" />
                      <select value={giftForm.age_group} onChange={(e) => setGiftForm({ ...giftForm, age_group: e.target.value })}
                        className="glass-input text-xs py-2.5 px-3 rounded-xl">
                        <option value="" className="bg-[--surface]">Age Group</option>
                        <option value="child" className="bg-[--surface]">Child (0-12)</option>
                        <option value="teen" className="bg-[--surface]">Teen (13-19)</option>
                        <option value="young_adult" className="bg-[--surface]">Young Adult (20-30)</option>
                        <option value="adult" className="bg-[--surface]">Adult (31-50)</option>
                        <option value="senior" className="bg-[--surface]">Senior (50+)</option>
                      </select>
                      <select value={giftForm.relationship} onChange={(e) => setGiftForm({ ...giftForm, relationship: e.target.value })}
                        className="glass-input text-xs py-2.5 px-3 rounded-xl">
                        <option value="" className="bg-[--surface]">Relationship</option>
                        <option value="spouse" className="bg-[--surface]">Spouse</option>
                        <option value="parent" className="bg-[--surface]">Parent</option>
                        <option value="sibling" className="bg-[--surface]">Sibling</option>
                        <option value="friend" className="bg-[--surface]">Friend</option>
                        <option value="colleague" className="bg-[--surface]">Colleague</option>
                      </select>
                      <select value={giftForm.occasion} onChange={(e) => setGiftForm({ ...giftForm, occasion: e.target.value })}
                        className="glass-input text-xs py-2.5 px-3 rounded-xl">
                        <option value="Birthday" className="bg-[--surface]">Birthday</option>
                        <option value="Anniversary" className="bg-[--surface]">Anniversary</option>
                        <option value="Wedding" className="bg-[--surface]">Wedding</option>
                        <option value="Christmas" className="bg-[--surface]">Christmas</option>
                        <option value="Graduation" className="bg-[--surface]">Graduation</option>
                        <option value="Diwali" className="bg-[--surface]">Diwali</option>
                      </select>
                      <input value={giftForm.budget} onChange={(e) => setGiftForm({ ...giftForm, budget: e.target.value })}
                        placeholder="Budget (₹)" type="number" className="glass-input text-xs py-2 px-3 rounded-xl" />
                    </div>
                    <textarea value={giftForm.interests} onChange={(e) => setGiftForm({ ...giftForm, interests: e.target.value })}
                      placeholder="Interests (comma separated)" className="glass-input w-full text-xs py-2 px-3 rounded-xl resize-none h-16" />
                    <button onClick={() => generateGiftMutation.mutate({
                      recipient_name: giftForm.recipient_name,
                      recipient_age_group: giftForm.age_group,
                      relationship: giftForm.relationship,
                      occasion: giftForm.occasion,
                      budget: parseFloat(giftForm.budget) || 0,
                      interests: giftForm.interests.split(',').map(s => s.trim()).filter(Boolean),
                    })}
                      disabled={!giftForm.budget} className="btn-primary text-xs px-4 py-2 w-full">
                      Generate Gift Ideas
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={containerVariants} className="space-y-4">
              {gifts.map((gift: GiftRecommendation) => (
                <motion.div key={gift.id} variants={itemVariants} className="glass-card rounded-2xl p-5 relative overflow-hidden group hover-glow-primary">
                  <div className="absolute inset-0 bg-gradient-to-r from-[--accent]/5 via-transparent to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[--accent]/20 flex items-center justify-center text-[--accent]"><GiftIcon size={14} /></div>
                      <div>
                        <h3 className="text-sm font-semibold">Gift for {gift.recipient_name || 'Someone Special'}</h3>
                        <p className="text-xs text-[--muted] capitalize">{gift.occasion} &middot; Budget: ₹{gift.budget.toLocaleString('en-US')}</p>
                      </div>
                    </div>
                    {gift.reasoning && <p className="text-xs text-[--muted] mt-2 leading-relaxed">{gift.reasoning}</p>}
                    {gift.total_bundle_price && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs font-semibold">Bundle Price:</span>
                        <span className="text-sm font-bold text-[--secondary]">₹{gift.total_bundle_price.toLocaleString('en-US')}</span>
                        <span className="text-[10px] text-green-400">Under budget!</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
