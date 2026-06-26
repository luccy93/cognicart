'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CloseIcon, BellIcon, CheckCircleIcon, AlertIcon } from '@/components/ui/emoji-icons';

interface Alert {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp?: string;
  actionable?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
  className?: string;
}

const typeStyles = {
  info: 'border-l-[--primary] bg-[--primary]/5',
  success: 'border-l-[--secondary] bg-[--secondary]/5',
  warning: 'border-l-yellow-500 bg-yellow-500/5',
  error: 'border-l-red-500 bg-red-500/5',
};

const typeIcons = {
  info: <BellIcon size={14} />,
  success: <CheckCircleIcon size={14} />,
  warning: <AlertIcon size={14} />,
  error: <CloseIcon size={14} />,
};

export function AlertsPanel({ alerts, onDismiss, className }: AlertsPanelProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
    onDismiss?.(id);
  };

  const visible = alerts.filter(a => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <AnimatePresence>
        {visible.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            className={cn('glass rounded-lg border-l-4 p-4 flex items-start gap-3', typeStyles[alert.type])}
          >
            <span className="text-lg shrink-0 mt-0.5">{typeIcons[alert.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{alert.title}</p>
              <p className="text-xs text-[--muted] mt-0.5">{alert.message}</p>
              {alert.timestamp && <p className="text-[10px] text-[--muted] mt-1">{alert.timestamp}</p>}
              {alert.actionable && alert.actionLabel && (
                <button
                  onClick={alert.onAction}
                  className="text-xs text-[--secondary] hover:underline mt-2"
                >
                  {alert.actionLabel}
                </button>
              )}
            </div>
            <button
              onClick={() => handleDismiss(alert.id)}
              className="text-[--muted] hover:text-white shrink-0 mt-0.5"
            >
              <CloseIcon size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
