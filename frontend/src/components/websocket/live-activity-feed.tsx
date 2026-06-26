'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocketContext } from './websocket-provider';
import { BellIcon, CartIcon, EyeIcon, HeartIcon, ShoppingBagsIcon } from '@/components/ui/emoji-icons';

const actionIcons: Record<string, React.ReactNode> = {
  purchase: <CartIcon size={14} />,
  view: <EyeIcon size={14} />,
  add_to_cart: <ShoppingBagsIcon size={14} />,
  wishlist: <HeartIcon size={14} />,
};

export function LiveActivityFeed() {
  const { connected, socialProofFeed } = useWebSocketContext();

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Live Activity</h3>
        <span
          className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}
          title={connected ? 'Connected' : 'Disconnected'}
        />
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {socialProofFeed.length === 0 && (
            <p className="text-xs text-[--muted] text-center py-4">
              Waiting for live activity...
            </p>
          )}
          {socialProofFeed.map((event, i) => (
            <motion.div
              key={`${event.productId}-${event.timestamp}-${i}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 text-xs"
            >
              <span className="text-sm">{actionIcons[event.action] || <BellIcon size={14} />}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[--secondary] font-medium">{event.userName}</span>{' '}
                <span className="text-[--muted]">
                  {event.action === 'purchase'
                    ? 'purchased'
                    : event.action === 'view'
                      ? 'viewed'
                      : event.action === 'add_to_cart'
                        ? 'added to cart'
                        : 'saved to wishlist'}{' '}
                </span>
                <span className="text-white/70 truncate">{event.productName}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
