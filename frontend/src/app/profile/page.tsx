'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';
import { TrophyIcon, StarIcon, DiamondIcon, CheckCircleIcon, GiftIcon, MedalGoldIcon, MedalSilverIcon, MedalBronzeIcon } from '@/components/ui/emoji-icons';
import { cn } from '@/lib/utils';
import type { ShoppingDNA, XPLevel, Achievement, AchievementBadge } from '@/types';

export const dynamic = 'force-dynamic';

const sampleProfile = {
  fullName: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '+1 (555) 123-4567',
  dob: '1995-03-14',
  gender: 'male',
  bio: 'Tech enthusiast and AI hobbyist. Love exploring new gadgets and building things that make life easier.',
};

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

const sampleAchievements: Achievement[] = [
  { id: 'a1', achievement_key: 'first_purchase', title: 'First Purchase', description: 'Completed your first order', category: 'purchase', icon: '🎉', xp_reward: 100, progress_current: 1, progress_target: 1, is_earned: true, earned_at: new Date().toISOString() },
  { id: 'a2', achievement_key: 'early_bird', title: 'Early Bird', description: 'Joined CogniCart within first month', category: 'milestone', icon: '🌟', xp_reward: 200, progress_current: 1, progress_target: 1, is_earned: true, earned_at: new Date().toISOString() },
  { id: 'a3', achievement_key: 'review_star', title: 'Review Star', description: 'Wrote 5 product reviews', category: 'review', icon: '⭐', xp_reward: 150, progress_current: 3, progress_target: 5, is_earned: false, earned_at: null },
  { id: 'a4', achievement_key: 'shopaholic', title: 'Shopaholic', description: 'Place 10 orders', category: 'purchase', icon: '🛍️', xp_reward: 300, progress_current: 8, progress_target: 10, is_earned: false, earned_at: null },
  { id: 'a5', achievement_key: 'streak_master', title: 'Streak Master', description: 'Maintain a 7-day streak', category: 'streak', icon: '🔥', xp_reward: 250, progress_current: 5, progress_target: 7, is_earned: false, earned_at: null },
  { id: 'a6', achievement_key: 'deal_hunter', title: 'Deal Hunter', description: 'Buy 3 discounted items', category: 'deal', icon: '💎', xp_reward: 100, progress_current: 3, progress_target: 3, is_earned: true, earned_at: new Date().toISOString() },
  { id: 'a7', achievement_key: 'big_spender', title: 'Big Spender', description: 'Spend over ₹50,000 total', category: 'spending', icon: '💰', xp_reward: 500, progress_current: 42000, progress_target: 50000, is_earned: false, earned_at: null },
  { id: 'a8', achievement_key: 'social_butterfly', title: 'Social Butterfly', description: 'Share 3 products with friends', category: 'social', icon: '🦋', xp_reward: 100, progress_current: 2, progress_target: 3, is_earned: false, earned_at: null },
];

const sampleDNA: ShoppingDNA = {
  persona_type: 'tech_enthusiast',
  persona_label: 'Tech Enthusiast',
  confidence: 0.88,
  preferred_brands: ['Sony', 'Samsung', 'Apple', 'LG'],
  preferred_categories: ['Electronics', 'Gaming', 'Wearables', 'Smart Home'],
  average_monthly_spend: 24500,
  shopping_pattern: 'research_before_buy',
  style_preferences: {},
  price_sensitivity: 'moderate',
  brand_loyalty_score: 0.72,
  category_affinity_scores: { electronics: 0.95, gaming: 0.88, wearables: 0.76 },
  purchase_frequency: 'monthly',
  average_cart_value: 8500,
  favorite_features: ['Noise Cancellation', 'Wireless', 'USB-C', 'OLED'],
  features: {},
  last_analyzed: new Date().toISOString(),
};

const sampleXP: XPLevel = {
  current_xp: 1250,
  total_xp_earned: 1250,
  level: 4,
  xp_to_next_level: 750,
  level_title: 'Bronze Explorer',
};

type ProfileTab = 'profile' | 'addresses' | 'payments' | 'notifications' | 'privacy';

const sampleAddresses = [
  { id: 'a1', label: 'Home', street: '123 Main St, Apt 4B', city: 'New York', state: 'NY', zip: '10001', country: 'United States', isDefault: true },
  { id: 'a2', label: 'Work', street: '456 AI Innovation Dr, Suite 200', city: 'San Francisco', state: 'CA', zip: '94105', country: 'United States', isDefault: false },
];

const samplePaymentMethods = [
  { id: 'p1', brand: 'Visa', last4: '4242', name: 'Alex Johnson', expiry: '12/28', isDefault: true, color: 'from-blue-600 to-blue-800' },
  { id: 'p2', brand: 'Mastercard', last4: '5678', name: 'Alex Johnson', expiry: '09/27', isDefault: false, color: 'from-orange-500 to-red-500' },
];

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [form, setForm] = useState(sampleProfile);
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const { data: dnaData } = useQuery({
    queryKey: ['profile-dna'],
    queryFn: () => aiApi.getShoppingDNA(),
    enabled: !!user,
  });

  const { data: xpData } = useQuery({
    queryKey: ['profile-xp'],
    queryFn: () => aiApi.getXP(),
    enabled: !!user,
  });

  const { data: achievementsData } = useQuery({
    queryKey: ['profile-achievements'],
    queryFn: () => aiApi.getAchievements(),
    enabled: !!user,
  });

  const dna = dnaData?.data as ShoppingDNA | undefined;
  const xp = xpData?.data as XPLevel | undefined;
  const achievements = achievementsData?.data?.items as Achievement[] | undefined;

  const displayDNA = dna || sampleDNA;
  const displayXP = xp || sampleXP;
  const displayAchievements = (achievements || sampleAchievements).filter(a => !a.is_earned || true);
  const earnedAchievements = (achievements || sampleAchievements).filter(a => a.is_earned);
  const inProgressAchievements = (achievements || sampleAchievements).filter(a => !a.is_earned);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <nav className="nav-blur">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
            <div className="w-8 h-8 skeleton rounded-full" />
            <div className="h-4 skeleton w-28 ml-2.5" />
          </div>
        </nav>
        <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 skeleton rounded-full mb-4" />
            <div className="h-5 skeleton w-40 mb-2" />
            <div className="h-3 skeleton w-52" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}><div className="h-3 skeleton w-20 mb-1.5" /><div className="h-10 skeleton w-full rounded-lg" /></div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="glass rounded-xl p-5 h-40 skeleton" />
              <div className="glass rounded-xl p-5 h-48 skeleton" />
            </div>
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
            <span className="font-bold tracking-widest text-sm">PROFILE</span>
          </div>
          <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-600 ring-2 ring-[--primary]/30">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[--primary]">
                  {form.fullName.charAt(0)}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[--primary] text-black flex items-center justify-center hover:scale-110 transition-transform"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <h1 className="text-2xl font-bold text-gradient">{form.fullName}</h1>
          <p className="text-xs text-[--muted] mt-1">Manage your personal information and view AI insights</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 overflow-x-auto pb-2 mb-6 justify-center">
          {([
            { id: 'profile' as const, label: 'Profile' },
            { id: 'addresses' as const, label: 'Addresses' },
            { id: 'payments' as const, label: 'Payments' },
            { id: 'notifications' as const, label: 'Notifications' },
            { id: 'privacy' as const, label: 'Privacy' },
          ]).map(tab => (
            <button
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black shadow-lg shadow-[--primary]/20'
                  : 'glass text-[--muted] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Profile Form */}
              <div className="space-y-6">
                <div className="glass rounded-xl p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-[--muted] mb-1.5">Full Name</label>
                    <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-glass" placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[--muted] mb-1.5">Email</label>
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-glass" placeholder="Enter your email" type="email" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[--muted] mb-1.5">Phone</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-glass" placeholder="Enter your phone number" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[--muted] mb-1.5">Date of Birth</label>
                    <input value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="input-glass" type="date" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[--muted] mb-1.5">Gender</label>
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-glass">
                      {genderOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[--surface]">{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[--muted] mb-1.5">Bio</label>
                    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-glass resize-none h-24" placeholder="Tell us about yourself..." />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                      {saving ? (
                        <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</>
                      ) : saved ? (
                        <><CheckCircleIcon size={14} />Saved Successfully</>
                      ) : 'Save Changes'}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-ghost">Cancel</motion.button>
                  </div>
                </div>

                {/* XP Level Card */}
                <motion.div className="glass rounded-xl p-5 relative overflow-hidden hover-glow-primary">
                  <div className="absolute inset-0 bg-gradient-to-br from-[--accent]/10 via-transparent to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[--accent] to-amber-500 flex items-center justify-center text-black">
                        <TrophyIcon size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Level {displayXP.level} — {displayXP.level_title}</h3>
                        <p className="text-[10px] text-[--muted]">Total XP: {displayXP.total_xp_earned.toLocaleString('en-US')}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[--muted] mb-1">
                      <span>{displayXP.current_xp.toLocaleString('en-US')} XP</span>
                      <span>{displayXP.xp_to_next_level.toLocaleString('en-US')} XP to Level {displayXP.level + 1}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (displayXP.current_xp / (displayXP.current_xp + displayXP.xp_to_next_level)) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-[--accent] via-amber-400 to-yellow-300 rounded-full" transition={{ duration: 1.5, ease: 'easeOut' }} />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - AI Insights & Achievements */}
              <div className="space-y-6">
                {/* Shopping DNA Summary */}
                <div className="glass rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[--primary]/10 via-purple-500/5 to-[--secondary]/10" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black">
                        <InfinityLoopIcon size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Shopping DNA</h3>
                        <p className="text-[10px] text-[--muted]">Your AI shopping profile</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-[--muted]">Persona</p>
                        <p className="text-xs font-semibold flex items-center gap-1">
                          <InfinityLoopIcon size={12} />
                          {displayDNA.persona_label}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[--muted]">Pattern</p>
                        <p className="text-xs font-semibold capitalize">{displayDNA.shopping_pattern?.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[--muted]">Price Sensitivity</p>
                        <p className="text-xs font-semibold capitalize">{displayDNA.price_sensitivity}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[--muted]">Brand Loyalty</p>
                        <p className="text-xs font-semibold">{Math.round((displayDNA.brand_loyalty_score || 0) * 100)}%</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-[10px] text-[--muted] mb-1.5">Top Brands</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(displayDNA.preferred_brands || []).map((brand: string, i: number) => (
                          <span key={i} className="text-[10px] px-2 py-1 rounded-full glass-pill text-white border border-white/10">{brand}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-[10px] text-[--muted] mb-1.5">AI Confidence</p>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((displayDNA.confidence || 0) * 100)}%` }}
                          className="h-full bg-gradient-to-r from-[--primary] to-[--secondary] rounded-full" transition={{ duration: 1 }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements Section */}
                <div className="glass rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MedalGoldIcon size={16} className="text-[--accent]" />
                      <h3 className="text-sm font-semibold">Achievements</h3>
                    </div>
                    <span className="text-[10px] text-[--muted]">{earnedAchievements.length}/{displayAchievements.length} earned</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {earnedAchievements.map((a: Achievement) => (
                      <motion.div key={a.id} whileHover={{ scale: 1.1 }} className="relative group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[--accent]/20 to-amber-500/20 border border-[--accent]/30 flex items-center justify-center text-sm cursor-help">
                          {a.icon || <StarIcon size={14} className="text-[--accent]" />}
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg glass-strong text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <p className="font-semibold">{a.title}</p>
                          <p className="text-[--muted]">+{a.xp_reward} XP</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {inProgressAchievements.slice(0, 4).map((a: Achievement) => {
                      const progress = a.progress_target > 0 ? Math.min(100, (a.progress_current / a.progress_target) * 100) : 0;
                      return (
                        <div key={a.id}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{a.icon || <DiamondIcon size={10} />}</span>
                              <span className="text-xs font-medium">{a.title}</span>
                            </div>
                            <span className="text-[10px] text-[--muted]">{a.progress_current}/{a.progress_target}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-[--primary] to-[--secondary]" transition={{ duration: 1 }} />
                          </div>
                          <p className="text-[9px] text-[--muted] mt-0.5">+{a.xp_reward} XP &middot; {a.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'addresses' && (
            <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Saved Addresses</h2>
                <button className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Add Address
                </button>
              </div>
              {sampleAddresses.map((addr, i) => (
                <div key={addr.id} className="glass rounded-xl p-5 card-3d">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${addr.isDefault ? 'bg-[--primary]/15 text-[--primary]' : 'glass'}`}>
                        {addr.label.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">{addr.label}</h3>
                          {addr.isDefault && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[--primary]/15 text-[--primary]">Default</span>}
                        </div>
                        <p className="text-xs text-[--muted] mt-0.5">{addr.street}</p>
                        <p className="text-xs text-[--muted]">{addr.city}, {addr.state} {addr.zip}</p>
                        <p className="text-xs text-[--muted]">{addr.country}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1.5 glass rounded-lg text-[10px] text-[--muted] hover:text-white">Edit</button>
                      <button className="p-1.5 glass rounded-lg text-[10px] text-red-400 hover:text-red-300">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Saved Payment Methods</h2>
                <button className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Add Card
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {samplePaymentMethods.map((card, i) => (
                  <div key={card.id} className={`rounded-xl p-5 bg-gradient-to-br ${card.color} relative overflow-hidden card-3d`}>
                    <div className="absolute top-3 right-3">
                      {card.isDefault && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 text-white">Default</span>}
                    </div>
                    <div className="text-white/80 text-xs font-medium mb-6">{card.brand}</div>
                    <div className="text-white text-lg font-mono tracking-wider mb-3">**** **** **** {card.last4}</div>
                    <div className="flex justify-between items-center text-white/70 text-xs">
                      <span>{card.name}</span>
                      <span>{card.expiry}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-end gap-2">
                      <button className="text-[10px] text-white/60 hover:text-white">Edit</button>
                      <button className="text-[10px] text-white/60 hover:text-red-300">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="glass rounded-xl p-5 text-center">
                <p className="text-xs text-[--muted]">Your payment information is stored securely and PCI-DSS compliant.</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-lg font-semibold">Notification Settings</h2>
              {[
                { id: 'n1', label: 'Order Updates', desc: 'Receive updates about your order status and delivery' },
                { id: 'n2', label: 'Price Alerts', desc: 'Get notified when items in your wishlist go on sale' },
                { id: 'n3', label: 'Recommendations', desc: 'Weekly personalized product recommendations' },
                { id: 'n4', label: 'Promotions & Deals', desc: 'Exclusive offers, discounts, and flash sale alerts' },
                { id: 'n5', label: 'Reviews & Community', desc: 'Notifications about reviews, ratings, and community activity' },
                { id: 'n6', label: 'Security Alerts', desc: 'Login notifications and account security updates' },
              ].map((notif, i) => (
                <div key={notif.id} className="glass rounded-xl p-4 card-3d flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{notif.label}</h3>
                    <p className="text-xs text-[--muted] mt-0.5">{notif.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={i < 4} className="sr-only peer" />
                    <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:bg-[--primary] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
              <button className="btn-primary text-sm px-6 py-2.5">Save Preferences</button>
            </motion.div>
          )}

          {activeTab === 'privacy' && (
            <motion.div key="privacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-lg font-semibold">Privacy Settings</h2>
              {[
                { id: 'p1', label: 'AI Personalization', desc: 'Allow AI to personalize recommendations based on your behavior', default: true },
                { id: 'p2', label: 'Share Usage Data', desc: 'Help improve our AI by sharing anonymized browsing data', default: true },
                { id: 'p3', label: 'Profile Visibility', desc: 'Make your profile visible to other users in the community', default: false },
                { id: 'p4', label: 'Email Marketing', desc: 'Receive marketing emails about new features and offers', default: false },
              ].map((setting, i) => (
                <div key={setting.id} className="glass rounded-xl p-4 card-3d flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{setting.label}</h3>
                    <p className="text-xs text-[--muted] mt-0.5">{setting.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={setting.default} className="sr-only peer" />
                    <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:bg-[--secondary] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
              <div className="glass rounded-xl p-5 mt-6">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
                <p className="text-xs text-[--muted] mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button className="btn-ghost text-xs px-4 py-2 text-red-400 border-red-400/30 hover:bg-red-500/10">Delete Account</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
