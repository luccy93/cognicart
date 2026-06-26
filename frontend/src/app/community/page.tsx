'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChatIcon, ThumbsUpIcon, ShareIcon, SearchIcon, PlusIcon, UsersIcon, TrendingUpIcon, StarIcon, MessageIcon, ClockIcon } from '@/components/ui/emoji-icons';

const discussions = [
  { id: 'd1', title: 'Best wireless earbuds under $200?', author: 'TechEnthusiast', avatar: 'T', replies: 24, likes: 56, tags: ['Audio', 'Recommendations'], time: '2h ago', lastActive: '5m ago' },
  { id: 'd2', title: 'MacBook Air M3 vs Pro M3 — which one for coding?', author: 'DevGuy', avatar: 'D', replies: 18, likes: 42, tags: ['Laptops', 'Comparison'], time: '4h ago', lastActive: '12m ago' },
  { id: 'd3', title: 'Show off your gaming setup!', author: 'GamerPro', avatar: 'G', replies: 36, likes: 89, tags: ['Gaming', 'Showcase'], time: '6h ago', lastActive: '1m ago' },
  { id: 'd4', title: 'Samsung vs Sony OLED TVs — input needed', author: 'HomeTheaterFan', avatar: 'H', replies: 12, likes: 31, tags: ['TVs', 'Comparison'], time: '8h ago', lastActive: '30m ago' },
  { id: 'd5', title: 'Share your CogniCart referral code thread', author: 'SavvyShopper', avatar: 'S', replies: 47, likes: 103, tags: ['Community', 'Referrals'], time: '10h ago', lastActive: '2m ago' },
  { id: 'd6', title: 'Best mechanical switches for typing?', author: 'KeyboardKing', avatar: 'K', replies: 21, likes: 38, tags: ['Accessories', 'Discussion'], time: '12h ago', lastActive: '15m ago' },
];

const trendingTopics = [
  { tag: '#Gaming', posts: 342, trend: 'up' }, { tag: '#OLED', posts: 156, trend: 'up' },
  { tag: '#WirelessEarbuds', posts: 89, trend: 'up' }, { tag: '#AI', posts: 234, trend: 'up' },
  { tag: '#SmartHome', posts: 167, trend: 'up' }, { tag: '#Wearables', posts: 98, trend: 'up' },
];

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function CommunityPage() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const filtered = discussions.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">COMMUNITY</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-space">Community Discussions</h1>
            <p className="text-xs text-[--muted] mt-1">Join the conversation with fellow shoppers</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}><PlusIcon size={14} /> New Discussion</Button>
        </motion.div>

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold">Create Discussion</h3>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="glass-input text-sm" placeholder="Discussion title" />
                <textarea value={newContent} onChange={e => setNewContent(e.target.value)} className="glass-input text-sm h-24 resize-none" placeholder="What's on your mind?" />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setNewTitle(''); setNewContent(''); }}>Cancel</Button>
                  <Button variant="primary" size="sm" disabled={!newTitle || !newContent}>Post Discussion</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="relative">
              <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search discussions..." className="glass-input pl-9 text-sm" />
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
              {filtered.map((disc, i) => (
                <motion.div key={disc.id} variants={itemVariants} whileHover={{ x: 4 }} className="glass-card rounded-xl p-4 cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold shrink-0">
                      {disc.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold truncate group-hover:text-[--secondary] transition-colors">{disc.title}</h3>
                        <span className="text-[10px] text-[--muted] shrink-0">{disc.time}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[--muted]">
                        <span>by {disc.author}</span>
                        <span className="flex items-center gap-1"><ChatIcon size={10} /> {disc.replies}</span>
                        <span className="flex items-center gap-1"><ThumbsUpIcon size={10} /> {disc.likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        {disc.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[--muted] border border-white/5">{tag}</span>
                        ))}
                        <span className="text-[10px] text-[--muted] ml-auto flex items-center gap-1"><ClockIcon size={10} /> {disc.lastActive}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="lg:w-80 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUpIcon size={14} className="text-[--accent]" /> Trending Topics</h3>
              <div className="space-y-2">
                {trendingTopics.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <span className="text-xs font-medium">{topic.tag}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[--muted]">{topic.posts} posts</span>
                      <TrendingUpIcon size={10} className="text-[--secondary]" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><UsersIcon size={14} className="text-[--secondary]" /> Community Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {[{ label: 'Members', value: '12.4K' }, { label: 'Discussions', value: '3.2K' }, { label: 'Replies', value: '28.5K' }, { label: 'Online', value: '342' }].map((s, i) => (
                  <div key={i} className="glass rounded-lg p-3 text-center"><p className="text-lg font-bold text-gradient-primary">{s.value}</p><p className="text-[10px] text-[--muted]">{s.label}</p></div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3">Share a Product</h3>
              <p className="text-xs text-[--muted] mb-3">Share your favorite product with the community</p>
              <Button variant="secondary" size="sm" className="w-full"><ShareIcon size={12} /> Share Now</Button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
