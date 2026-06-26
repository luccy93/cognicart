'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Card({ children, className, hover = false, glass = true, padding = 'md', onClick }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      onClick={onClick}
      className={cn(
        glass ? 'glass' : 'bg-[--surface] border border-white/5',
        'rounded-2xl transition-all duration-300',
        hover && 'hover:border-[--primary]/30 hover:shadow-lg hover:shadow-[--primary]/5 cursor-pointer',
        paddings[padding],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
