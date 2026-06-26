'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DiamondIcon, MedalBronzeIcon, MedalGoldIcon, MedalSilverIcon } from '@/components/ui/emoji-icons';

interface BadgeDisplayProps {
  badges: { id: string; name: string; icon: React.ReactNode; earned: boolean; description: string }[];
}

const tierCards = [
  { tier: 'Bronze', color: 'from-amber-700/40 to-amber-900/40', border: 'border-amber-700/30', text: 'text-amber-400', minPoints: 0, icon: <MedalBronzeIcon size={14} /> },
  { tier: 'Silver', color: 'from-gray-300/40 to-gray-500/40', border: 'border-gray-400/30', text: 'text-gray-300', minPoints: 1000, icon: <MedalSilverIcon size={14} /> },
  { tier: 'Gold', color: 'from-yellow-400/40 to-yellow-600/40', border: 'border-yellow-500/30', text: 'text-yellow-400', minPoints: 2500, icon: <MedalGoldIcon size={14} /> },
  { tier: 'Platinum', color: 'from-purple-400/40 to-purple-600/40', border: 'border-purple-500/30', text: 'text-purple-400', minPoints: 5000, icon: <DiamondIcon size={14} /> },
];

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Achievement Badges</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'glass rounded-xl p-3 text-center transition-all',
              badge.earned ? 'opacity-100' : 'opacity-30 grayscale'
            )}
          >
            <span className="text-2xl block mb-1">{badge.icon}</span>
            <p className="text-xs font-medium truncate">{badge.name}</p>
            <p className="text-[10px] text-[--muted] truncate">{badge.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function StreakDisplay({ streak, longest }: { streak: number; longest: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <motion.span
          key={streak}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-[--primary]"
        >
          {streak}
        </motion.span>
        <p className="text-[10px] text-[--muted]">Day Streak</p>
      </div>
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((streak / Math.max(longest, 1)) * 100, 100)}%` }}
          className="h-full bg-gradient-to-r from-[--primary] to-[--secondary] rounded-full"
        />
      </div>
      <div className="text-center">
        <span className="text-lg font-bold text-[--muted]">{longest}</span>
        <p className="text-[10px] text-[--muted]">Best</p>
      </div>
    </div>
  );
}

export function LoyaltyCard({ tier, points, nextTier, pointsToNext }: { tier: string; points: number; nextTier: string; pointsToNext: number }) {
  const currentTier = tierCards.find(t => t.tier.toLowerCase() === tier.toLowerCase()) || tierCards[0];
  const progress = nextTier ? Math.min(points / (points + pointsToNext) * 100, 100) : 100;

  return (
    <div className={cn('glass rounded-2xl p-5 bg-gradient-to-br border', currentTier.color, currentTier.border)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-[--muted]">Current Tier</p>
          <h3 className={cn('text-lg font-bold', currentTier.text)}>
            {currentTier.icon} {tier}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{points.toLocaleString('en-US')}</p>
          <p className="text-[10px] text-[--muted]">Points</p>
        </div>
      </div>
      {nextTier && (
        <>
          <div className="flex justify-between text-[10px] text-[--muted] mb-1">
            <span>{tier}</span>
            <span>{nextTier}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-[--primary] to-[--secondary] rounded-full"
            />
          </div>
          <p className="text-[10px] text-[--muted] mt-1">{pointsToNext.toLocaleString('en-US')} points to {nextTier}</p>
        </>
      )}
    </div>
  );
}
