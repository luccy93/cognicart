'use client';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-2xl h-64',
  };

  return (
    <div
      className={cn(
        'skeleton relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent before:animate-shimmer before:-translate-x-full',
        'shimmer-overlay',
        variants[variant],
        className
      )}
      style={{ width, height }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-3 animate-scale-in">
      <Skeleton variant="rectangular" className="w-full h-48" />
      <Skeleton className="w-3/4" />
      <Skeleton className="w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="w-1/4" />
        <Skeleton variant="circular" className="w-8 h-8" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-3 animate-scale-in">
      <div className="flex items-center justify-between">
        <Skeleton variant="circular" className="w-10 h-10" />
        <Skeleton className="w-12 h-6" />
      </div>
      <Skeleton className="w-1/2 h-8" />
      <Skeleton className="w-2/3" />
      <Skeleton className="w-1/4" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in">
      <div className="flex gap-4 pb-3 border-b border-white/5">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {[1, 2, 3, 4, 5].map(j => (
            <Skeleton key={j} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-16 h-4" />
      </div>
      <div className="flex items-end gap-2 h-40">
        {[40, 65, 45, 80, 55, 90, 70, 50, 85, 60, 75, 95].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <StatSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <TableSkeleton rows={4} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <ProductCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
