'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { MatchScore } from '@/components/product/match-score';
import { CartIcon, CrownIcon, DressIcon, EyeIcon, LaptopIcon, MoneyIcon, UserIcon } from '@/components/ui/emoji-icons';

interface PersonaBadgeProps {
  personaLabel: string;
  confidence: number;
  className?: string;
}

const personaIcons: Record<string, React.ReactNode> = {
  'Budget Shopper': <MoneyIcon size={14} />,
  'Premium Shopper': <CrownIcon size={14} />,
  'Frequent Buyer': <CartIcon size={14} />,
  'Fashion Lover': <DressIcon size={14} />,
  'Tech Enthusiast': <LaptopIcon size={14} />,
  'Window Shopper': <EyeIcon size={14} />,
};

export function PersonaBadge({ personaLabel, confidence, className }: PersonaBadgeProps) {
  const icon = personaIcons[personaLabel] || <UserIcon size={14} />;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass rounded-xl p-4 ${className || ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-xl">
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-[--muted] uppercase tracking-wider">Current Persona</p>
          <p className="text-sm font-semibold">{personaLabel}</p>
          <div className="flex items-center gap-2 mt-1">
            <MatchScore score={confidence} size="sm" showLabel={false} />
            <span className="text-[10px] text-[--muted]">confidence</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
