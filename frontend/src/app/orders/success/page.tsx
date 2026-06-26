'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, PackageIcon, ArrowLeftIcon } from '@/components/ui/emoji-icons';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-7842-KF';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-10 md:p-14 max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-[--secondary]/15 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircleIcon size={14} className="text-[--secondary]" />
        </motion.div>

        <h1 className="text-3xl font-bold">Order Placed! 🎉</h1>
        <p className="text-[--muted] mt-3">Your order has been confirmed and is being processed.</p>

        <div className="glass rounded-xl p-4 mt-8 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[--muted]">Order Number</span>
            <span className="text-sm font-semibold text-[--secondary]">{orderId}</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/6">
            <span className="text-xs text-[--muted]">Estimated Delivery</span>
            <span className="text-sm font-semibold">5-7 business days</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 mt-8"
        >
          <Link href={`/orders/${orderId}`}>
            <Button variant="primary" className="w-full">View Order Details</Button>
          </Link>
          <Link href="/orders">
            <Button variant="ghost" className="w-full">All Orders</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full">Continue Shopping</Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="mt-8 pt-6 border-t border-white/6"
        >
          <p className="text-[10px] text-[--muted]">
            A confirmation email has been sent to your registered email address.
            You can track your order in real-time from the Orders page.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-[--muted]">Loading...</p></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
