'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { HeartIcon, StarIcon } from '@/components/ui/emoji-icons';
import { wishlistApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

const sortOptions = [
  { value: 'date-desc', label: 'Date Added (Newest)' },
  { value: 'date-asc', label: 'Date Added (Oldest)' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
  { value: 'name-desc', label: 'Name: Z-A' },
];

function SkeletonCard() {
  return (
    <div className="glass rounded-xl p-3 animate-pulse">
      <div className="h-32 rounded-lg bg-white/5 mb-3" />
      <div className="h-4 w-3/4 bg-white/5 rounded mb-2" />
      <div className="h-4 w-1/2 bg-white/5 rounded mb-2" />
      <div className="h-3 w-1/3 bg-white/5 rounded mb-3" />
      <div className="h-8 w-full bg-white/5 rounded-lg" />
    </div>
  );
}

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date-desc');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const fetchWishlist = async () => {
    try {
      const { data } = await wishlistApi.get();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const sorted = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return a.product.price - b.product.price;
      case 'price-desc': return b.product.price - a.product.price;
      case 'name-asc': return a.product.name.localeCompare(b.product.name);
      case 'name-desc': return b.product.name.localeCompare(a.product.name);
      case 'date-asc': return new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
      default: return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
    }
  });

  const removeItem = async (productId: string) => {
    setRemovingId(productId);
    try {
      await wishlistApi.remove(productId);
      await fetchWishlist();
    } catch {
      // silently handle
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">WISHLIST</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/products" className="text-xs text-[--muted] hover:text-white">Explore</Link>
            <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            {!isLoading && <p className="text-xs text-[--muted] mt-1">{items.length} items saved</p>}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[--surface]">{opt.label}</option>
            ))}
          </select>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <SkeletonCard />
              </motion.div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-xl p-16 text-center">
            <div className="text-6xl mb-4 opacity-20"><HeartIcon size={14} /></div>
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-[--muted] mb-6">Save your favorite items to keep track of them</p>
            <Link href="/products" className="btn-primary inline-block">Browse Products</Link>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sorted.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="glass rounded-xl p-3 card-3d group"
                >
                  <div className="h-32 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 mb-3 relative">
                    <img src={item.product.thumbnail_url} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeItem(item.product_id)}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-500/20 backdrop-blur flex items-center justify-center text-red-400 hover:bg-red-500/40 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </motion.button>
                  </div>
                  <div className="text-sm font-medium truncate">{item.product.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-white">${item.product.price}</span>
                    {item.product.original_price && (
                      <span className="text-[10px] text-[--muted] line-through">${item.product.original_price}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] text-yellow-400"><StarIcon size={14} /></span>
                    <span className="text-[10px] text-[--muted]">{Number(item.product.average_rating).toFixed(1)}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      await addItem(item.product.id);
                      toast.success('Added to cart');
                    }}
                    className="w-full mt-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] text-black text-[10px] font-semibold hover:shadow-lg hover:shadow-[--primary]/20 transition-all"
                  >
                    Add to Cart
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
