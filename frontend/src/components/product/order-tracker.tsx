'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckIcon, ClipboardIcon, GearIcon, PackageIcon, PartyIcon, TruckIcon } from '@/components/ui/emoji-icons';

interface OrderTrackingProps {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';
  orderNumber: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  carrier?: string;
}

const steps = [
  { key: 'pending', label: 'Order Placed', icon: <ClipboardIcon size={14} /> },
  { key: 'confirmed', label: 'Confirmed', icon: <CheckIcon size={14} /> },
  { key: 'processing', label: 'Processing', icon: <GearIcon size={14} /> },
  { key: 'shipped', label: 'Shipped', icon: <PackageIcon size={14} /> },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: <TruckIcon size={14} /> },
  { key: 'delivered', label: 'Delivered', icon: <PartyIcon size={14} /> },
];

const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export function OrderTracker({ status, orderNumber, estimatedDelivery, trackingNumber, carrier }: OrderTrackingProps) {
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Order #{orderNumber}</h3>
          {estimatedDelivery && (
            <p className="text-xs text-[--muted]">Estimated delivery: {estimatedDelivery}</p>
          )}
        </div>
        {trackingNumber && (
          <div className="text-right">
            <p className="text-xs text-[--muted]">Tracking #{trackingNumber}</p>
            {carrier && <p className="text-[10px] text-[--muted]">{carrier}</p>}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-white/10" />
        <div
          className="absolute left-[19px] top-0 w-[2px] bg-gradient-to-b from-[--primary] to-[--secondary] transition-all duration-1000"
          style={{ height: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        <div className="space-y-6 relative">
          {steps.map((step, i) => {
            const isCompleted = i <= currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 relative z-10',
                    isCompleted ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'bg-white/5 text-[--muted]'
                  )}
                >
                  {step.icon}
                </motion.div>
                <div>
                  <p className={cn('text-sm font-medium', isCompleted ? 'text-white' : 'text-[--muted]')}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-[--secondary]"
                    >
                      {status === 'shipped' ? 'Your package is on its way!' :
                       status === 'out_for_delivery' ? 'Your delivery partner is nearby!' :
                       status === 'delivered' ? 'Enjoy your purchase! <PartyIcon size={14} />' :
                       'Processing your order...'}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[--primary]/20 flex items-center justify-center text-[--primary]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <p className="text-xs font-medium">Need help with your order?</p>
            <p className="text-[10px] text-[--muted]">Contact our AI assistant for real-time updates</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
