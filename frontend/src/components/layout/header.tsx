'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Logo } from '@/components/brand/logo';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';
import {
  SearchIcon, CartIcon, UserIcon, BellIcon, SunIcon,
  ArrowRightIcon
} from '@/components/ui/emoji-icons';

function MicIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const cartCount = useCartStore((s) => s.itemCount);
  const [notifCount] = useState(0);

  return (
    <nav className="nav-blur z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Logo size="sm" showTagline={false} />
        </Link>
        <div className="hidden md:flex items-center relative flex-1 max-w-lg">
          <SearchIcon size={16} className="absolute left-3.5 text-[--muted] pointer-events-none" />
          <input
            type="text"
            placeholder="Search products, brands, categories..."
            className="glass-input pl-10 pr-12 text-sm"
          />
          <span className="absolute right-3 glass-pill px-1.5 py-0.5 text-[10px] font-mono text-[--muted] leading-none">⌘K</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="btn-ghost p-2 hidden sm:flex" aria-label="Voice search">
            <MicIcon />
          </button>
          <button className="btn-ghost p-2" aria-label="Toggle theme">
            <SunIcon size={16} />
          </button>
          <Link href="/cart" className="btn-ghost relative p-2" aria-label="Cart">
            <CartIcon size={16} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[--accent] text-[10px] font-bold flex items-center justify-center text-white leading-none">
                {cartCount}
              </span>
            )}
          </Link>
          {isAuthenticated && user ? (
            <>
              <Link href="/notifications" className="btn-ghost relative p-2 hidden sm:flex" aria-label="Notifications">
                <BellIcon size={16} />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[--accent] text-[8px] flex items-center justify-center text-black font-bold">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </Link>
              <Link href="/ai-shopper" className="btn-ghost text-xs px-2 py-1.5 hidden sm:inline-flex items-center gap-1">
                <InfinityLoopIcon size={14} />
                AI Shopper
              </Link>
              <Link href="/dashboard" className="btn-primary text-xs sm:text-sm px-3 sm:px-5">
                <UserIcon size={14} />
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-xs sm:text-sm px-2 sm:px-3 hidden sm:inline-flex">
                <UserIcon size={14} />
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-xs sm:text-sm px-3 sm:px-5">
                Get Started
                <ArrowRightIcon size={14} />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
