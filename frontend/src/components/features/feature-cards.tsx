'use client';
import { motion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { featuresApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import type { DailyReward, AchievementBadge, SmartCoupon } from '@/types';
import { ArrowRightIcon, BellIcon, CartIcon, ChartDownIcon, ChartUpIcon, CheckIcon, DiamondBlueIcon, DiamondIcon, EyeIcon, FireIcon, GiftIcon, LightningIcon, MailboxIcon, MedalBronzeIcon, MedalGoldIcon, MedalSilverIcon, PartyIcon, SleepingIcon, StarIcon } from '@/components/ui/emoji-icons';

interface LoyaltyCardProps {
  tier: string;
  totalPoints: number;
  pointsToNextTier: number;
  tierProgress: number;
}

const tierConfig: Record<string, { color: string; gradient: string; icon: React.ReactNode; min: number }> = {
  bronze: { color: 'text-amber-600', gradient: 'from-amber-600 to-amber-800', icon: <MedalBronzeIcon size={14} />, min: 0 },
  silver: { color: 'text-gray-400', gradient: 'from-gray-400 to-gray-600', icon: <MedalSilverIcon size={14} />, min: 1000 },
  gold: { color: 'text-yellow-400', gradient: 'from-yellow-400 to-yellow-600', icon: <MedalGoldIcon size={14} />, min: 2500 },
  platinum: { color: 'text-cyan-400', gradient: 'from-cyan-400 to-cyan-600', icon: <DiamondIcon size={14} />, min: 5000 },
  diamond: { color: 'text-blue-300', gradient: 'from-blue-300 to-purple-400', icon: <DiamondBlueIcon size={14} />, min: 10000 },
};

export function LoyaltyCardFront({ tier, totalPoints, pointsToNextTier, tierProgress }: LoyaltyCardProps) {
  const config = tierConfig[tier.toLowerCase()] || tierConfig.bronze;
  const nextTier = tier === 'diamond' ? null :
    Object.entries(tierConfig)[Object.keys(tierConfig).indexOf(tier.toLowerCase()) + 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-6 relative overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-[--muted] uppercase tracking-wider">Your Tier</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">{config.icon}</span>
              <span className={`text-xl font-bold capitalize ${config.color}`}>{tier}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{totalPoints.toLocaleString('en-US')}</p>
            <p className="text-[10px] text-[--muted]">Total Points</p>
          </div>
        </div>

        {nextTier && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[--muted]">Progress to {nextTier[0]}</span>
              <span className="text-[--secondary]">{Math.round(tierProgress * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, tierProgress * 100)}%` }}
                className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
              />
            </div>
            <p className="text-[10px] text-[--muted] mt-1">{pointsToNextTier.toLocaleString('en-US')} points to next tier</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function DailyRewardsGrid({ onClaim }: { onClaim?: () => void }) {
  const { data: rewardsData } = useQuery({
    queryKey: ['daily-rewards'],
    queryFn: () => featuresApi.getDailyRewards(),
  });
  const [claiming, setClaiming] = useState(false);

  const rewards = rewardsData?.data || Array.from({ length: 7 }, (_, i) => ({
    day_sequence: i + 1,
    reward_type: i === 6 ? 'bonus' : 'points',
    reward_value: [10, 15, 20, 25, 30, 40, 100][i],
    claimed: i === 0,
    claimed_at: null,
  }));

  const nextUnclaimed = rewards.find((r: DailyReward) => !r.claimed);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await featuresApi.claimDailyReward();
      onClaim?.();
    } catch {}
    setClaiming(false);
  };

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-3">Daily Rewards</h3>
      <div className="grid grid-cols-7 gap-2 mb-3">
        {rewards.map((reward: DailyReward) => (
          <motion.div
            key={reward.day_sequence}
            whileHover={{ scale: 1.05 }}
            className={cn(
              'rounded-xl p-2 text-center transition-all border',
              reward.claimed
                ? 'bg-[--primary]/10 border-[--primary]/20 opacity-50'
                : reward.day_sequence === nextUnclaimed?.day_sequence
                  ? 'bg-[--secondary]/10 border-[--secondary]/30 animate-pulse-glow'
                  : 'bg-white/5 border-white/5'
            )}
          >
            <div className="text-lg mb-0.5">
              {reward.claimed ? <CheckIcon size={14} /> : reward.day_sequence === 7 ? <GiftIcon size={14} /> : <StarIcon size={14} />}
            </div>
            <div className="text-[10px] font-bold">{reward.reward_value}</div>
            <div className="text-[8px] text-[--muted]">Day {reward.day_sequence}</div>
          </motion.div>
        ))}
      </div>
      <Button
        variant={nextUnclaimed ? 'primary' : 'ghost'}
        size="sm"
        className="w-full"
        onClick={handleClaim}
        disabled={!nextUnclaimed || claiming}
        loading={claiming}
      >
        {nextUnclaimed ? `Claim Day ${nextUnclaimed.day_sequence} Reward` : 'All Rewards Claimed!'}
      </Button>
    </div>
  );
}

export function StreakDisplayFront({ currentStreak, longestStreak }: { currentStreak: number; longestStreak: number }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold"><FireIcon size={14} /> Shopping Streak</h3>
        <span className="text-xs text-[--muted]">Best: {longestStreak} days</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-3xl mb-1"
          >
            {currentStreak > 0 ? <FireIcon size={14} /> : <SleepingIcon size={14} />}
          </motion.div>
          <p className="text-2xl font-bold">{currentStreak}</p>
          <p className="text-[10px] text-[--muted]">day streak</p>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[--muted]">Progress</span>
            <span className="text-[--secondary]">{Math.min(100, (currentStreak / Math.max(longestStreak, 7)) * 100)}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (currentStreak / Math.max(longestStreak, 7)) * 100)}%` }}
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
            />
          </div>
          {currentStreak >= 7 && (
            <p className="text-[10px] text-[--accent] mt-1"><PartyIcon size={14} /> Week streak bonus available!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReferralCard() {
  const { data: refData } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: () => featuresApi.getReferralStats(),
  });
  const stats = refData?.data || { total_referrals: 0, successful_referrals: 0, pending_referrals: 0, total_rewards_earned: 0, referral_link: '' };
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(stats.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-3">Invite Friends → Earn Rewards</h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-white/5">
          <p className="text-lg font-bold">{stats.total_referrals}</p>
          <p className="text-[10px] text-[--muted]">Total</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/5">
          <p className="text-lg font-bold text-[--secondary]">{stats.successful_referrals}</p>
          <p className="text-[10px] text-[--muted]">Converted</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/5">
          <p className="text-lg font-bold text-[--accent]">{stats.total_rewards_earned}</p>
          <p className="text-[10px] text-[--muted]">Rewards</p>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={stats.referral_link}
          className="input-glass text-xs flex-1"
        />
        <Button variant="primary" size="sm" onClick={copyLink}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}

export function AchievementGrid({ badges: initialBadges }: { badges?: AchievementBadge[] }) {
  const { data: badgesData } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => featuresApi.getAchievements(),
    enabled: !initialBadges,
  });

  const badges = badgesData?.data || initialBadges || [];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Achievements</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {badges.map((badge: AchievementBadge) => (
          <motion.div
            key={badge.id}
            whileHover={{ scale: 1.05 }}
            className={cn(
              'rounded-xl p-3 text-center border transition-all',
              badge.earned
                ? 'bg-[--primary]/10 border-[--primary]/30'
                : 'bg-white/5 border-white/5 opacity-40'
            )}
          >
            <div className="text-2xl mb-1">{badge.badge_icon}</div>
            <p className="text-[10px] font-medium">{badge.badge_label}</p>
            {badge.earned && badge.earned_at && (
              <p className="text-[8px] text-[--muted] mt-0.5">Earned</p>
            )}
            {!badge.earned && badge.progress > 0 && (
              <div className="mt-1 h-1 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-[--primary] transition-all" style={{ width: `${badge.progress}%` }} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function PriceAlertForm({ productId, onCreated }: { productId: string; onCreated?: () => void }) {
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!targetPrice) return;
    setLoading(true);
    try {
      await featuresApi.createPriceAlert(productId, parseFloat(targetPrice));
      setTargetPrice('');
      onCreated?.();
    } catch {}
    setLoading(false);
  };

  return (
    <div className="glass rounded-xl p-4">
      <p className="text-xs font-medium mb-2"><BellIcon size={14} /> Set Price Alert</p>
      <p className="text-[10px] text-[--muted] mb-3">Get notified when price drops</p>
      <div className="flex gap-2">
        <input
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          placeholder="Target price"
          className="input-glass text-xs flex-1"
        />
        <Button size="sm" variant="primary" onClick={handleSubmit} disabled={!targetPrice || loading} loading={loading}>
          Set Alert
        </Button>
      </div>
    </div>
  );
}

export function StockAlertButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await featuresApi.createStockAlert(productId);
      setCreated(true);
    } catch {}
    setLoading(false);
  };

  return (
    <Button
      variant={created ? 'primary' : 'ghost'}
      size="sm"
      onClick={handleClick}
      disabled={created || loading}
      loading={loading}
    >
      {created ? '<CheckIcon size={14} /> Notify When Available' : '<MailboxIcon size={14} /> Notify When Available'}
    </Button>
  );
}

export function SocialProofCounter({ purchases24h, currentViewers, stockCount }: { purchases24h: number; currentViewers: number; stockCount: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
        <span><CartIcon size={14} /></span> {purchases24h}+ bought in 24h
      </div>
      <div className="text-[10px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
        <span><EyeIcon size={14} /></span> {currentViewers} viewing now
      </div>
      {stockCount <= 3 && stockCount > 0 && (
        <div className="text-[10px] px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
          <span><LightningIcon size={14} /></span> Only {stockCount} left!
        </div>
      )}
    </div>
  );
}

export function SmartCouponBanner({ orderTotal = 0 }: { orderTotal?: number }) {
  const { data: couponsData } = useQuery({
    queryKey: ['smart-coupons', orderTotal],
    queryFn: () => featuresApi.getSmartCoupons(orderTotal),
  });
  const coupons = couponsData?.data || [];

  if (!coupons.length) return null;

  return (
    <div className="space-y-2">
      {coupons.map((coupon: SmartCoupon) => (
        <motion.div
          key={coupon.coupon_id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-xl p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] flex items-center justify-center text-black text-sm"><PartyIcon size={14} /></div>
            <div>
              <p className="text-xs font-medium">{coupon.reason}</p>
              <p className="text-[10px] text-[--muted]">Use <strong className="text-[--primary]">{coupon.code}</strong> to save {formatPrice(coupon.savings_amount)}</p>
            </div>
          </div>
          <Button size="sm" variant="ghost">Apply</Button>
        </motion.div>
      ))}
    </div>
  );
}

export function SpendingOverview({ monthlySpending, averageOrderValue, totalSavings, spendingTrend }: {
  monthlySpending?: Record<string, number>;
  averageOrderValue?: number;
  totalSavings?: number;
  spendingTrend?: string;
}) {
  const months = Object.keys(monthlySpending || {});
  const values = Object.values(monthlySpending || {});
  const maxVal = Math.max(...values, 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-3">
          <p className="text-[10px] text-[--muted]">Avg Order</p>
          <p className="text-sm font-bold">{formatPrice(averageOrderValue || 0)}</p>
        </div>
        <div className="glass rounded-xl p-3">
          <p className="text-[10px] text-[--muted]">Total Saved</p>
          <p className="text-sm font-bold text-[--accent]">{formatPrice(totalSavings || 0)}</p>
        </div>
        <div className="glass rounded-xl p-3">
          <p className="text-[10px] text-[--muted]">Trend</p>
          <p className="text-sm font-bold capitalize">{spendingTrend || 'stable'}</p>
        </div>
      </div>
      {months.length > 0 && (
        <div className="glass rounded-xl p-4">
          <p className="text-xs font-semibold mb-3">Monthly Spending</p>
          <div className="flex items-end gap-1.5 h-20">
            {months.map((month, i) => (
              <div key={month} className="flex-1 flex flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(values[i] / maxVal) * 100}%` }}
                  className="w-full rounded-t-md bg-gradient-to-t from-[--primary] to-[--secondary]"
                />
                <span className="text-[8px] text-[--muted] mt-1">{month.slice(-2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CLVCard({ clvScore = 0, retentionScore = 0, engagementScore = 0, predictedClv = 0, segment = 'Standard' }: {
  clvScore?: number;
  retentionScore?: number;
  engagementScore?: number;
  predictedClv?: number;
  segment?: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-3">Customer Lifetime Value</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center p-3 rounded-lg bg-white/5">
          <p className="text-lg font-bold text-[--secondary]">{clvScore.toFixed(1)}</p>
          <p className="text-[10px] text-[--muted]">CLV Score</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-white/5">
          <p className="text-lg font-bold text-[--primary]">{predictedClv.toFixed(0)}</p>
          <p className="text-[10px] text-[--muted]">Predicted CLV</p>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-[--muted]">Retention</span>
            <span>{retentionScore.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[--primary] to-[--secondary]" style={{ width: `${retentionScore}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-[--muted]">Engagement</span>
            <span>{engagementScore.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[--secondary] to-[--accent]" style={{ width: `${engagementScore}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/5">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[--primary] to-[--secondary] text-black font-medium capitalize">{segment}</span>
      </div>
    </div>
  );
}

export function TrendCard({ productName, trendScore, trendDirection }: { productName: string; trendScore: number; trendDirection: string }) {
  const directionIcon = trendDirection === 'up' ? <ChartUpIcon size={14} /> : trendDirection === 'down' ? <ChartDownIcon size={14} /> : <ArrowRightIcon size={14} />;
  const color = trendDirection === 'up' ? 'text-emerald-400' : trendDirection === 'down' ? 'text-red-400' : 'text-[--muted]';
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
      <span className="text-lg">{directionIcon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{productName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, trendScore)}%` }} />
          </div>
          <span className={`text-[10px] ${color}`}>{trendScore.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
