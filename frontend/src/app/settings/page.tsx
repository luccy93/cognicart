'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChatIcon, EmailIcon, LaptopIcon, MobileIcon, MoonIcon, SunIcon } from '@/components/ui/emoji-icons';

type TabId = 'profile' | 'notifications' | 'privacy' | 'appearance';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}

const ToggleSwitch = ({ checked, onChange, label, description }: ToggleSwitchProps) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <div className="text-sm font-medium">{label}</div>
      {description && <div className="text-[10px] text-[--muted] mt-0.5">{description}</div>}
    </div>
    <button
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-all duration-300 ${checked ? 'bg-[--primary]' : 'bg-white/10'}`}
    >
      <motion.div
        animate={{ x: checked ? 18 : 2 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
      />
    </button>
  </div>
);

const tabs: { id: TabId; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'appearance', label: 'Appearance' },
];

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

const themeOptions = [
  { id: 'dark', label: 'Dark', icon: <MoonIcon size={14} /> },
  { id: 'light', label: 'Light', icon: <SunIcon size={14} /> },
  { id: 'system', label: 'System', icon: <LaptopIcon size={14} /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [saving, setSaving] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    fullName: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Tech enthusiast and AI hobbyist.',
  });

  // Notification toggles
  const [notif, setNotif] = useState({
    emailOrders: true,
    emailPromos: true,
    emailRecommendations: false,
    pushOrders: true,
    pushPromos: false,
    pushRecommendations: true,
    smsOrders: false,
    smsPromos: false,
    smsRecommendations: false,
  });

  // Privacy checkboxes
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showWishlist: false,
    showOrderHistory: true,
    personalizedAds: false,
    dataForResearch: true,
    shareAnalytics: false,
  });

  // Appearance
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState('medium');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const toggleNotif = (key: keyof typeof notif) => setNotif((prev) => ({ ...prev, [key]: !prev[key] }));
  const togglePrivacy = (key: keyof typeof privacy) => setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[--muted] mb-1.5">Full Name</label>
              <input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[--muted] mb-1.5">Email</label>
              <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="input-glass" type="email" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[--muted] mb-1.5">Phone</label>
              <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[--muted] mb-1.5">Gender</label>
              <select className="input-glass">
                {genderOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[--surface]">{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[--muted] mb-1.5">Bio</label>
              <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="input-glass resize-none h-24" />
            </div>
            <button onClick={handleSave} className="btn-primary">{saving ? 'Saving...' : 'Save Profile'}</button>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><EmailIcon size={14} /> Email Notifications</h3>
              <div className="glass rounded-xl px-4 divide-y divide-white/5">
                <ToggleSwitch checked={notif.emailOrders} onChange={() => toggleNotif('emailOrders')} label="Order Updates" description="Shipping, delivery, and order confirmations" />
                <ToggleSwitch checked={notif.emailPromos} onChange={() => toggleNotif('emailPromos')} label="Promotions & Deals" description="Sales, discounts, and promotional offers" />
                <ToggleSwitch checked={notif.emailRecommendations} onChange={() => toggleNotif('emailRecommendations')} label="Recommendations" description="Personalized product suggestions" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><MobileIcon size={14} /> Push Notifications</h3>
              <div className="glass rounded-xl px-4 divide-y divide-white/5">
                <ToggleSwitch checked={notif.pushOrders} onChange={() => toggleNotif('pushOrders')} label="Order Updates" />
                <ToggleSwitch checked={notif.pushPromos} onChange={() => toggleNotif('pushPromos')} label="Promotions & Deals" />
                <ToggleSwitch checked={notif.pushRecommendations} onChange={() => toggleNotif('pushRecommendations')} label="Recommendations" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><ChatIcon size={14} /> SMS Notifications</h3>
              <div className="glass rounded-xl px-4 divide-y divide-white/5">
                <ToggleSwitch checked={notif.smsOrders} onChange={() => toggleNotif('smsOrders')} label="Order Updates" />
                <ToggleSwitch checked={notif.smsPromos} onChange={() => toggleNotif('smsPromos')} label="Promotions & Deals" />
                <ToggleSwitch checked={notif.smsRecommendations} onChange={() => toggleNotif('smsRecommendations')} label="Recommendations" />
              </div>
            </div>
            <button onClick={handleSave} className="btn-primary">{saving ? 'Saving...' : 'Save Notification Preferences'}</button>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4">
            <div className="glass rounded-xl px-4 divide-y divide-white/5">
              {([
                ['showProfile', 'Show Profile Publicly', 'Allow other users to see your profile'],
                ['showWishlist', 'Show Wishlist', 'Make your wishlist visible to others'],
                ['showOrderHistory', 'Show Order History', 'Display your order history on your profile'],
                ['personalizedAds', 'Personalized Ads', 'Allow us to show targeted advertisements'],
                ['dataForResearch', 'Share Data for Research', 'Help us improve by sharing anonymized data'],
                ['shareAnalytics', 'Share Usage Analytics', 'Send anonymous usage statistics'],
              ] as [keyof typeof privacy, string, string][]).map(([key, label, desc]) => (
                <div key={key} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-[10px] text-[--muted] mt-0.5">{desc}</div>
                  </div>
                  <button
                    onClick={() => togglePrivacy(key)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${privacy[key] ? 'bg-[--primary] border-[--primary]' : 'border-white/20'}`}
                  >
                    {privacy[key] && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="btn-primary">{saving ? 'Saving...' : 'Save Privacy Settings'}</button>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold mb-3">Theme</h3>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`glass rounded-xl p-4 text-center transition-all duration-300 ${theme === opt.id ? 'ring-2 ring-[--primary] bg-[--primary]/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    <div className="text-xs font-medium">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Font Size</h3>
              <div className="flex gap-2">
                {['Small', 'Medium', 'Large'].map((size) => (
                  <button key={size} onClick={() => setFontSize(size.toLowerCase() as any)} className={`px-4 py-2 glass rounded-lg text-xs transition-all ${fontSize === size.toLowerCase() ? 'ring-2 ring-[--primary] bg-[--primary]/10' : 'hover:bg-white/5'}`}>{size}</button>
                ))}
              </div>
            </div>
            <button onClick={handleSave} className="btn-primary">{saving ? 'Saving...' : 'Save Appearance'}</button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">SETTINGS</span>
          </div>
          <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-xs text-[--muted] mt-1">Customize your CogniCart experience</p>
        </motion.div>

        {/* Tab Navigation - Glass Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 ${activeTab === tab.id
                ? 'glass text-white shadow-[inset_0_0_0_1px_rgba(108,99,255,0.3)]'
                : 'text-[--muted] hover:text-white hover:bg-white/5'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
