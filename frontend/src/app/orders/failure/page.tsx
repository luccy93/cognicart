'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CloseIcon, RefreshIcon } from '@/components/ui/emoji-icons';

export const dynamic = 'force-dynamic';

export default function OrderFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-10 md:p-14 max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-6"
        >
          <CloseIcon size={14} className="text-red-400" />
        </motion.div>

        <h1 className="text-3xl font-bold">Payment Failed</h1>
        <p className="text-[--muted] mt-3">We couldn't process your payment. Please try again or use a different payment method.</p>

        <div className="glass rounded-xl p-4 mt-8 text-left space-y-2">
          <p className="text-xs text-[--muted]">Common reasons:</p>
          <ul className="text-xs text-[--muted] space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
              Insufficient funds
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
              Card expired or invalid
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
              Bank declined transaction
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
              Network timeout
            </li>
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 mt-8"
        >
          <Link href="/cart">
            <Button variant="primary" className="w-full">Try Again</Button>
          </Link>
          <Link href="/payments">
            <Button variant="ghost" className="w-full">Update Payment Methods</Button>
          </Link>
          <Link href="/support">
            <Button variant="ghost" className="w-full">Contact Support</Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="mt-8 pt-6 border-t border-white/6"
        >
          <p className="text-[10px] text-[--muted]">
            No charges have been made. Your cart items are still reserved for you.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
