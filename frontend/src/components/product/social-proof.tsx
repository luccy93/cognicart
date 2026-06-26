'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { useWebSocketContext } from '@/components/websocket/websocket-provider';
import { CartIcon, EyeIcon, FireIcon } from '@/components/ui/emoji-icons';

interface SocialProofProps {
  productId: string;
  purchaseCount?: number;
  viewCount?: number;
}

const sampleNames = ['Alex', 'Sarah', 'Mike', 'Emma', 'James', 'Lisa', 'David', 'Anna', 'Chris', 'Sophie'];

export function SocialProof({ productId, purchaseCount = 0, viewCount = 0 }: SocialProofProps) {
  const { socialProofFeed } = useWebSocketContext();
  const [recentPurchase, setRecentPurchase] = useState<{ name: string; time: string } | null>(null);

  const liveEventForProduct = useMemo(
    () => socialProofFeed.find((e) => e.productId === productId),
    [socialProofFeed, productId]
  );

  useEffect(() => {
    if (liveEventForProduct) {
      setRecentPurchase({ name: liveEventForProduct.userName, time: 'just now' });
      const timer = setTimeout(() => setRecentPurchase(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [liveEventForProduct]);

  useEffect(() => {
    if (!liveEventForProduct && (purchaseCount > 0 || true)) {
      const interval = setInterval(() => {
        const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        const mins = Math.floor(Math.random() * 5) + 1;
        setRecentPurchase({ name, time: `${mins} min ago` });
        setTimeout(() => setRecentPurchase(null), 4000);
      }, 10000 + Math.random() * 5000);
      return () => clearInterval(interval);
    }
  }, [purchaseCount, productId, liveEventForProduct]);

  const displayPurchase = purchaseCount + (liveEventForProduct ? 1 : 0);
  const displayView = viewCount + socialProofFeed.filter((e) => e.productId === productId && e.action === 'view').length;

  return (
    <div className="space-y-1">
      {displayPurchase > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-emerald-400"
        >
          <span className="inline-block mr-1"><FireIcon size={14} /></span>
          {displayPurchase}+ purchased this
        </motion.p>
      )}
      {displayView > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[--muted]"
        >
          <span className="inline-block mr-1"><EyeIcon size={14} /></span>
          {displayView} viewing now
        </motion.p>
      )}
      <AnimatePresence>
        {recentPurchase && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-[--secondary]"
          >
            <span className="inline-block mr-1"><CartIcon size={14} /></span>
            {recentPurchase.name} purchased {recentPurchase.time}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
