'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PackageIcon } from '@/components/ui/emoji-icons';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title = 'Nothing here yet',
  description = 'Items will appear here once you start exploring.',
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass rounded-xl p-10 text-center', className)}
    >
      <span className="text-4xl opacity-40">{icon || <PackageIcon size={14} />}</span>
      <h3 className="text-lg font-semibold mt-4">{title}</h3>
      <p className="text-sm text-[--muted] mt-2 max-w-sm mx-auto">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-6">
          {actionHref ? (
            <Link href={actionHref} className="btn-primary text-xs px-5 py-2.5 inline-block">
              {actionLabel}
            </Link>
          ) : (
            <button onClick={onAction} className="btn-primary text-xs px-5 py-2.5">
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );

  return content;
}
