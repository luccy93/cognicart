'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  pulse?: boolean;
}

export function Badge({ children, variant = 'primary', size = 'sm', className, pulse }: BadgeProps) {
  const variants = {
    primary: 'border-primary/20 text-primary bg-primary/5',
    secondary: 'border-white/20 text-white bg-white/5',
    success: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
    danger: 'border-red-500/20 text-red-400 bg-red-500/5',
    warning: 'border-amber-500/20 text-amber-400 bg-amber-500/5',
    info: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium glass-pill',
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse-glow',
        'hover:shadow-lg hover:shadow-current/10 transition-all duration-300',
        className
      )}
    >
      {children}
    </motion.span>
  );
}
