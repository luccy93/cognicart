'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';
import { CloseIcon, GiftIcon, BellIcon, RocketIcon, DiamondIcon } from '@/components/ui/emoji-icons';
import type { ConciergeMessage } from '@/types';

const sampleMessages: ConciergeMessage[] = [
  { id: 'c1', type: 'price_drop', title: 'Price Dropped!', message: 'Sony WH-1000XM5 is now ₹24,999 — save ₹5,000!', priority: 'high', action_url: '/products/sony-wh1000xm5', action_label: 'View Deal', product_id: 'p1', product_name: 'Sony WH-1000XM5', product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', created_at: new Date().toISOString(), is_read: false },
  { id: 'c2', type: 'reorder', title: 'Time to Reorder', message: 'You usually buy Coffee Beans every 3 weeks. It\'s been 25 days!', priority: 'medium', action_url: '/products/coffee-beans', action_label: 'Reorder Now', product_id: 'p2', product_name: 'Coffee Beans', product_image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop', created_at: new Date().toISOString(), is_read: false },
  { id: 'c3', type: 'recommendation', title: 'AI Suggestion', message: 'Based on your recent purchase, you might love the new Noise Cancelling Earbuds.', priority: 'low', action_url: '/products/earbuds', action_label: 'Explore', product_id: 'p3', product_name: 'Noise Cancelling Earbuds', product_image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop', created_at: new Date().toISOString(), is_read: false },
  { id: 'c4', type: 'flash_sale', title: 'Flash Sale Alert!', message: 'Next flash sale starts in 2 hours — Smart Watch Ultra at 30% off!', priority: 'high', action_url: '/deals', action_label: 'Set Reminder', product_id: null, product_name: null, product_image: null, created_at: new Date().toISOString(), is_read: false },
];

const typeIcons: Record<string, React.ReactNode> = {
  price_drop: <DiamondIcon size={14} />,
  reorder: <RocketIcon size={14} />,
  recommendation: <InfinityLoopIcon size={14} />,
  flash_sale: <BellIcon size={14} />,
};

export function ConciergeBar({ messages: externalMessages }: { messages?: ConciergeMessage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [paused, setPaused] = useState(false);

  const messages = (externalMessages || sampleMessages).filter(m => !dismissed.has(m.id));

  const nextMessage = useCallback(() => {
    if (messages.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % messages.length);
  }, [messages.length]);

  useEffect(() => {
    if (paused || messages.length === 0) return;
    const timer = setInterval(nextMessage, 5000);
    return () => clearInterval(timer);
  }, [paused, nextMessage, messages.length]);

  if (messages.length === 0) return null;

  const current = messages[currentIndex];
  if (!current) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className={cn(
          'relative overflow-hidden rounded-2xl glass-strong border p-3 sm:p-4',
          current.priority === 'high' ? 'border-[--accent]/30' : 'border-white/[0.06]'
        )}
      >
        <div className={cn(
          'absolute inset-0 bg-gradient-to-r opacity-20',
          current.priority === 'high' ? 'from-[--accent]/20 via-transparent to-transparent' : 'from-[--primary]/10 via-transparent to-transparent'
        )} />
        <div className="relative z-10 flex items-start gap-3">
          <div className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
            current.priority === 'high' ? 'bg-[--accent]/20 text-[--accent]' : 'bg-[--primary]/10 text-[--primary]'
          )}>
            {typeIcons[current.type] || <InfinityLoopIcon size={14} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">{current.title}</span>
              <span className={cn(
                'text-[9px] px-1.5 py-0.5 rounded-full',
                current.priority === 'high' ? 'bg-[--accent]/20 text-[--accent]' : 'bg-white/10 text-[--muted]'
              )}>
                {current.priority}
              </span>
            </div>
            <p className="text-xs text-[--muted] mt-0.5 leading-relaxed">{current.message}</p>
            <div className="flex items-center gap-2 mt-2">
              {current.action_label && current.action_url && (
                <a href={current.action_url} className="text-[10px] px-3 py-1 rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] text-black font-medium hover:shadow-lg hover:shadow-[--primary]/20 transition-all">
                  {current.action_label}
                </a>
              )}
              <span className="text-[9px] text-[--muted]">{messages.length > 1 ? `${currentIndex + 1} / ${messages.length}` : ''}</span>
            </div>
          </div>
          <button
            onClick={() => setDismissed(prev => new Set(prev).add(current.id))}
            className="p-1 rounded-lg text-[--muted] hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
