'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function MatchScore({ score, size = 'md', showLabel = true, className }: MatchScoreProps) {
  const numericScore = typeof score === 'number' ? score : parseFloat(score) || 0;
  const percentage = Math.round(numericScore * 100);
  const color = percentage >= 90
    ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
    : percentage >= 70
    ? 'text-primary border-primary/20 bg-primary/5'
    : percentage >= 50
    ? 'text-amber-400 border-amber-500/20 bg-amber-500/5'
    : 'text-muted border-white/10 bg-white/5';

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium glass-pill transition-all duration-300',
        percentage >= 90 && 'glow-primary',
        sizes[size],
        color,
        className
      )}
      title={`AI Match Score: ${percentage}%`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={size === 'sm' ? 10 : 12} height={size === 'sm' ? 10 : 12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      <span className="font-semibold">{percentage}%</span>
      {showLabel && <span className="hidden sm:inline text-muted-foreground">{percentage >= 90 ? 'Perfect' : percentage >= 70 ? 'Great' : percentage >= 50 ? 'Good' : 'Fair'} Match</span>}
    </motion.div>
  );
}
