'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FireIcon } from '@/components/ui/emoji-icons';

const trendingSearches = ['Gaming Mouse', 'Smart Watch', 'Wireless Earbuds', 'Mechanical Keyboard', 'USB-C Hub', 'Noise Cancelling Headphones'];

interface SmartSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SmartSearch({ onSearch, placeholder = 'Search products...', className }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (value.length > 1) {
      const filtered = trendingSearches.filter(s => s.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = (q: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setIsFocused(false);
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className || ''}`}>
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          ref={inputRef}
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[--muted] focus:outline-none focus:border-[--primary]/50 transition-colors"
        />
        {query && (
          <button onClick={() => { setQuery(''); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[--muted] hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass rounded-xl p-4 z-50 shadow-xl border border-white/10"
          >
            {query.length > 1 && suggestions.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] text-[--muted] mb-2">Suggestions</p>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(s); handleSearch(s); }}
                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg text-sm hover:bg-white/5 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[--muted]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div>
              <p className="text-[10px] text-[--muted] mb-2">Trending <FireIcon size={14} /></p>
              <div className="flex flex-wrap gap-1.5">
                {trendingSearches.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(s); handleSearch(s); }}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-[--muted] hover:text-white hover:bg-white/10 transition-colors border border-white/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
