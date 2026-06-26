'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="text-7xl mb-6"
        >
          404
        </motion.div>
        <h1 className="text-3xl font-bold">Page Not Found</h1>
        <p className="text-[--muted] mt-3">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/" className="btn-primary text-sm px-6 py-2.5">
            Go Home
          </Link>
          <Link href="/products" className="btn-ghost text-sm px-6 py-2.5">
            Browse Products
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
