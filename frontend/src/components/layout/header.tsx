'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Logo } from '@/components/brand/logo';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';
import { VoiceSearch } from '@/components/ui/voice-search';
import {
  SearchIcon, CartIcon, UserIcon, BellIcon, SunIcon,
  ArrowRightIcon
} from '@/components/ui/emoji-icons';

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const cartCount = useCartStore((s) => s.itemCount);
  const [notifCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleVoiceResult = useCallback((text: string) => {
    setSearchQuery(text);
    router.push(`/search?q=${encodeURIComponent(text)}`);
  }, [router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="nav-blur z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Logo size="sm" showTagline={false} />
        </Link>
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative flex-1 max-w-lg">
          <SearchIcon size={16} className="absolute left-3.5 text-[--muted] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, brands, categories..."
            className="glass-input pl-10 pr-12 text-sm"
          />
          <span className="absolute right-3 glass-pill px-1.5 py-0.5 text-[10px] font-mono text-[--muted] leading-none">⌘K</span>
        </form>
        <div className="flex items-center gap-1 sm:gap-2">
          <VoiceSearch onResult={handleVoiceResult} />
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
