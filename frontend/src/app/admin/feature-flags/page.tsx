'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SettingsIcon, PlusIcon, CheckIcon, CloseIcon, ArrowLeftIcon, RefreshIcon, ChartIcon } from '@/components/ui/emoji-icons';
import { featuresApi } from '@/lib/api';
import toast from 'react-hot-toast';

const fallbackFlags = [
  { id: 'f1', name: 'ai_recommendations', description: 'Enable AI-powered product recommendations', enabled: true, roles: ['all'] },
  { id: 'f2', name: 'voice_search', description: 'Enable voice search functionality', enabled: false, roles: ['beta'] },
  { id: 'f3', name: 'dark_mode', description: 'Dark mode theme support', enabled: true, roles: ['all'] },
  { id: 'f4', name: 'flash_sales', description: 'Flash sales and limited-time deals', enabled: true, roles: ['all'] },
  { id: 'f5', name: 'price_alerts', description: 'Price drop notifications', enabled: false, roles: ['prime'] },
  { id: 'f6', name: 'community_discussions', description: 'Community discussion boards', enabled: true, roles: ['all'] },
];

const fallbackABTests = [
  { id: 'a1', name: 'Checkout Layout Test', desc: 'Testing new one-page vs multi-step checkout', variantA: 'Multi-step', variantB: 'One-page', impressions: { a: 12500, b: 12800 }, conversions: { a: 1250, b: 1536 }, isActive: true, status: 'running' },
  { id: 'a2', name: 'Price Display Test', desc: 'Testing showing original price vs discount percentage', variantA: 'Original price', variantB: 'Discount %', impressions: { a: 8900, b: 9100 }, conversions: { a: 1780, b: 2002 }, isActive: false, status: 'completed' },
];

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function AdminFeatureFlagsPage() {
  const [activeTab, setActiveTab] = useState<'flags' | 'abtests'>('flags');
  const [flags, setFlags] = useState(fallbackFlags);
  const [abTests, setABTests] = useState(fallbackABTests);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [flagsRes, abRes] = await Promise.all([
          featuresApi.getFeatureFlags(),
          featuresApi.getABTests(),
        ]);
        setFlags(flagsRes.data ?? fallbackFlags);
        setABTests(abRes.data ?? fallbackABTests);
      } catch {
        toast.error('Failed to load feature data, using fallback');
        setFlags(fallbackFlags);
        setABTests(fallbackABTests);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFlag = async (id: string) => {
    const flag = flags.find(f => f.id === id);
    if (!flag) return;
    try {
      await featuresApi.updateFeatureFlag(id, { enabled: !flag.enabled });
      setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
      toast.success(`Flag ${flag.enabled ? 'disabled' : 'enabled'}`);
    } catch {
      toast.error('Failed to update flag, using local state');
      setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    }
  };

  const createFlag = async () => {
    if (!newName) return;
    try {
      const res = await featuresApi.createFeatureFlag({ name: newName, description: newDesc, enabled: false, roles: ['all'] });
      setFlags(prev => [...prev, res.data]);
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      toast.success('Flag created');
    } catch {
      toast.error('Failed to create flag');
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">ADMIN · FEATURES</span>
          </div>
          <Link href="/admin" className="text-xs text-[--muted] hover:text-white flex items-center gap-1"><ArrowLeftIcon size={12} /> Admin</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold font-space">Feature Flags & A/B Tests</h1><p className="text-xs text-[--muted] mt-1">Manage experimental features and run A/B tests</p></div>
          {activeTab === 'flags' && <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}><PlusIcon size={14} /> New Flag</Button>}
        </motion.div>

        <div className="flex gap-2 mb-6">
          {(['flags', 'abtests'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'glass text-[--muted] hover:text-white'}`}>
              {tab === 'flags' ? 'Feature Flags' : 'A/B Tests'}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold">Create Feature Flag</h3>
                <input value={newName} onChange={e => setNewName(e.target.value)} className="glass-input text-sm" placeholder="Flag name (e.g., new_checkout)" />
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} className="glass-input text-sm h-20 resize-none" placeholder="Description" />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setNewName(''); setNewDesc(''); }}>Cancel</Button>
                  <Button variant="primary" size="sm" disabled={!newName} onClick={createFlag}>Create Flag</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="glass-card rounded-xl p-4 h-[72px] animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'flags' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            {flags.map((flag, i) => (
              <motion.div key={flag.id} variants={itemVariants} className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2"><code className="text-xs px-2 py-0.5 rounded bg-white/5 font-mono text-[--secondary]">{flag.name}</code><span className={`text-[10px] px-2 py-0.5 rounded-full border ${flag.enabled ? 'bg-[--secondary]/15 text-[--secondary] border-[--secondary]/20' : 'bg-white/10 text-[--muted] border-white/10'}`}>{flag.enabled ? 'ON' : 'OFF'}</span></div>
                  <p className="text-xs text-[--muted] mt-1">{flag.description}</p>
                  <div className="flex gap-1 mt-1"><span className="text-[10px] text-[--muted]">Roles: </span>{flag.roles.map(r => <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5">{r}</span>)}</div>
                </div>
                <button onClick={() => toggleFlag(flag.id)} className={`w-12 h-6 rounded-full transition-colors relative ${flag.enabled ? 'bg-[--secondary]' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'abtests' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {isLoading && [1,2].map(i => (
              <div key={i} className="glass-card rounded-2xl p-5 h-[200px] animate-pulse" />
            ))}
            {!isLoading && abTests.map((test, i) => {
              const totalA = test.impressions.a;
              const totalB = test.impressions.b;
              const rateA = totalA > 0 ? ((test.conversions.a / totalA) * 100).toFixed(1) : '0';
              const rateB = totalB > 0 ? ((test.conversions.b / totalB) * 100).toFixed(1) : '0';
              const winner = parseFloat(rateB) > parseFloat(rateA) ? 'B' : 'A';
              return (
                <motion.div key={test.id} variants={itemVariants} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div><h3 className="text-sm font-semibold">{test.name}</h3><p className="text-xs text-[--muted] mt-0.5">{test.desc}</p></div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${test.status === 'running' ? 'bg-[--secondary]/15 text-[--secondary] border-[--secondary]/20' : 'bg-white/10 text-[--muted] border-white/10'}`}>{test.status}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div className="glass rounded-lg p-3"><p className="text-xs font-medium">{test.variantA} (A)</p><p className="text-lg font-bold mt-1">{rateA}%</p><p className="text-[10px] text-[--muted]">{test.conversions.a} conversions / {test.impressions.a.toLocaleString('en-US')} impressions</p></div>
                    <div className={`glass rounded-lg p-3 ${test.status === 'completed' && winner === 'B' ? 'border-[--secondary]/30' : ''}`}>
                      <p className="text-xs font-medium">{test.variantB} (B)</p>
                      <p className="text-lg font-bold mt-1">{rateB}%</p>
                      <p className="text-[10px] text-[--muted]">{test.conversions.b} conversions / {test.impressions.b.toLocaleString('en-US')} impressions</p>
                      {test.status === 'completed' && winner === 'B' && <span className="text-[10px] text-[--secondary] font-medium mt-1 block">Winner</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {test.status === 'running' && <Button variant="primary" size="sm"><CloseIcon size={10} /> Stop Test</Button>}
                    {test.status === 'completed' && <Button variant="primary" size="sm"><ChartIcon size={10} /> View Results</Button>}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}

