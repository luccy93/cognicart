'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </motion.div>
        <h1 className="text-3xl font-bold">Something Went Wrong</h1>
        <p className="text-[--muted] mt-3">
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <button onClick={reset} className="btn-primary text-sm px-6 py-2.5">
            Try Again
          </button>
          <a href="/" className="btn-ghost text-sm px-6 py-2.5">
            Go Home
          </a>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-red-400 mt-6 p-3 glass rounded-lg text-left font-mono break-all">
            {error.message}
          </p>
        )}
      </motion.div>
    </div>
  );
}
