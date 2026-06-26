'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TrophyIcon, StarIcon, FireIcon, GiftIcon, CopyIcon, ShareIcon, DiamondIcon, CoinIcon, TrendingUpIcon, MedalIcon, CheckIcon, ArrowRightIcon, ClockIcon, CalendarIcon } from '@/components/ui/emoji-icons';

const tierData = { current: 'Gold', points: 2840, nextTier: 'Platinum', pointsToNext: 2160, progress: 0.56 };
const dailyRewards = [
  { day: 1, reward: '50 pts', claimed: true }, { day: 2, reward: '100 pts', claimed: true }, { day: 3, reward: '150 pts', claimed: true },
  { day: 4, reward: '200 pts', claimed: true }, { day: 5, reward: '250 pts', claimed: false }, { day: 6, reward: '300 pts', claimed: false },
  { day: 7, reward: '500 pts', claimed: false },
];
const transactions = [
  { id: 't1', date: '2025-12-15', description: 'Purchase - Order #ORD-7842', points: 450, type: 'earned' },
  { id: 't2', date: '2025-12-14', description: 'Daily Reward Claim', points: 150, type: 'earned' },
  { id: 't3', date: '2025-12-13', description: 'Product Review Bonus', points: 75, type: 'earned' },
  { id: 't4', date: '2025-12-10', description: 'Referral Reward - John D.', points: 500, type: 'earned' },
  { id: 't5', date: '2025-12-08', description: 'Points Redeemed - Coupon', points: 1000, type: 'redeemed' },
];
const leaderboard = [
  { rank: 1, name: 'Sarah M.', points: 15420, avatar: 'S' }, { rank: 2, name: 'Alex J.', points: 12890, avatar: 'A' },
  { rank: 3, name: 'Mike R.', points: 11240, avatar: 'M' }, { rank: 4, name: 'Emma W.', points: 9870, avatar: 'E' },
  { rank: 5, name: 'David K.', points: 8450, avatar: 'D' },
];

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function LoyaltyPage() {
  const [referralCode] = useState('COGNI-ALEX-284');
  const [copied, setCopied] = useState(false);
  const [claimedDay, setClaimedDay] = useState(4);

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">LOYALTY REWARDS</span>
          </div>
          <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-[--primary]/20" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl animate-float" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-medium tracking-wider uppercase">Loyalty Program</span>
                <h1 className="text-2xl sm:text-3xl font-space font-extrabold mt-1">Your Rewards Dashboard</h1>
              </div>
              <TrophyIcon size={28} className="text-amber-400" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-xs text-[--muted]">Total Points</p>
                <p className="text-2xl font-bold font-space text-gradient-primary mt-1">{tierData.points.toLocaleString('en-US')}</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-xs text-[--muted]">Current Tier</p>
                <p className="text-2xl font-bold font-space text-amber-400 mt-1">{tierData.current}</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-xs text-[--muted]">Points to {tierData.nextTier}</p>
                <p className="text-2xl font-bold font-space text-[--secondary] mt-1">{tierData.pointsToNext.toLocaleString('en-US')}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-[--muted] mb-1"><span>{tierData.current}</span><span>{tierData.nextTier}</span></div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${tierData.progress * 100}%` }} className="h-full bg-gradient-to-r from-amber-400 to-[--primary] rounded-full" transition={{ duration: 1, delay: 0.3 }} />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.section variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-space text-gradient-primary">Daily Rewards</h2>
                <span className="text-xs text-[--muted] flex items-center gap-1"><FireIcon size={12} /> Day {claimedDay}/7 streak</span>
              </motion.div>
              <motion.div variants={itemVariants} className="grid grid-cols-7 gap-2">
                {dailyRewards.map((dr, i) => (
                  <div key={i} className={`glass rounded-xl p-3 text-center transition-all ${dr.claimed ? 'border-[--primary]/30 bg-[--primary]/5' : 'opacity-60 hover:opacity-100'} ${i + 1 === claimedDay + 1 && !dr.claimed ? 'animate-border-glow' : ''}`}>
                    <GiftIcon size={16} className={`mx-auto mb-1 ${dr.claimed ? 'text-[--secondary]' : 'text-[--muted]'}`} />
                    <p className="text-[10px] font-medium">{dr.reward}</p>
                    <p className="text-[8px] text-[--muted] mt-0.5">Day {dr.day}</p>
                    {dr.claimed && <CheckIcon size={10} className="mx-auto mt-1 text-[--secondary]" />}
                    {i + 1 === claimedDay + 1 && !dr.claimed && <Button variant="primary" size="sm" className="w-full mt-1 text-[8px] px-1 py-0.5" onClick={() => setClaimedDay(prev => prev + 1)}>Claim</Button>}
                  </div>
                ))}
              </motion.div>
            </motion.section>

            <motion.section variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-space text-gradient-primary">Point History</h2>
              </motion.div>
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 space-y-3">
                {transactions.map((tx, i) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${tx.type === 'earned' ? 'bg-[--secondary]/15 text-[--secondary]' : 'bg-red-500/15 text-red-400'}`}>
                        {tx.type === 'earned' ? '+' : '-'}
                      </div>
                      <div><p className="text-xs font-medium">{tx.description}</p><p className="text-[10px] text-[--muted]">{tx.date}</p></div>
                    </div>
                    <span className={`text-sm font-bold ${tx.type === 'earned' ? 'text-[--secondary]' : 'text-red-400'}`}>
                      {tx.type === 'earned' ? '+' : '-'}{tx.points} pts
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.section>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><ShareIcon size={14} className="text-[--secondary]" /> Refer & Earn</h3>
              <p className="text-xs text-[--muted] mb-3">Share your referral code and earn 500 points per referral!</p>
              <div className="flex gap-2">
                <div className="flex-1 glass-input text-xs py-2 px-3 truncate">{referralCode}</div>
                <Button variant="primary" size="sm" onClick={copyCode}>{copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}{copied ? 'Copied' : 'Copy'}</Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrophyIcon size={14} className="text-amber-400" /> Leaderboard</h3>
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-400/20 text-amber-400' : i === 1 ? 'bg-gray-400/20 text-gray-400' : i === 2 ? 'bg-amber-700/20 text-amber-700' : 'bg-white/5 text-[--muted]'}`}>
                      {entry.rank}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-[10px] font-bold">{entry.avatar}</div>
                    <span className="flex-1 text-xs">{entry.name}</span>
                    <span className="text-xs font-medium text-[--secondary]">{entry.points.toLocaleString('en-US')}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3">Tier Benefits</h3>
              <div className="space-y-2">
                {[{ tier: 'Silver', benefits: '1x points, Basic support' }, { tier: 'Gold', benefits: '1.5x points, Priority support', active: true },
                  { tier: 'Platinum', benefits: '2x points, Free shipping, VIP support' }].map((t, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${t.active ? 'bg-gradient-to-r from-amber-500/10 to-[--primary]/10 border border-amber-500/20' : 'bg-white/[0.03] border border-white/5'}`}>
                    <MedalIcon size={16} className={t.active ? 'text-amber-400' : 'text-[--muted]'} />
                    <div><p className="text-xs font-medium">{t.tier}</p><p className="text-[10px] text-[--muted]">{t.benefits}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
