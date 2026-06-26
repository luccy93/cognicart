'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { ProductCard } from '@/components/product/product-card';
import { SmartSearch } from '@/components/search/smart-search';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types';
import { wishlistApi } from '@/lib/api';
import { ProductComparison } from '@/components/product/product-comparison';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [page, setPage] = useState(1);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const { addItem } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, sortBy, page],
    queryFn: () => productsApi.list({ q: search, sort_by: sortBy, page, page_size: 20 }),
  });

  const sampleProducts = Array.from({ length: 8 }).map((_, i) => ({
    id: `sample-${i}`,
    name: ['Wireless Earbuds Pro', 'Mechanical Keyboard RGB', 'Smart Watch Ultra', 'Gaming Mouse X', 'Noise Cancelling Headphones', 'USB-C Hub 7-in-1', 'Portable SSD 1TB', 'Smart Home Hub'][i],
    price: [976.62, 1245.29, 1285.46, 702.67, 420.12, 659.98, 1488.81, 576.62][i],
    original_price: [1209.82, null, 1430.13, 826.12, 531.82, 755.70, 1771.55, 739.88][i],
    average_rating: [4.9, 4.3, 3.6, 3.7, 4.0, 4.4, 3.9, 3.5][i],
    total_ratings: [295, 300, 369, 420, 232, 197, 41, 368],
    total_purchases: [173, 147, 281, 155, 169, 289, 140, 48],
    ai_match_score: [0.96, 0.94, 0.91, 0.89, 0.87, 0.85, 0.82, 0.79][i],
    is_featured: i < 4,
    thumbnail_url: ['https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1527864550417-2fd06e9c5f5f?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=300&fit=crop'][i],
    brand: ['EliteBrand', 'SmartGear', 'TechPro', 'TechPro', 'CogniTech', 'EliteBrand', 'PrimeTech', 'SmartGear'][i],
    popularity_score: 80 + i,
    stock: 50 + i * 10,
    category_id: 'c1',
    slug: `product-${i}`,
    description: 'Product description',
    short_description: 'Short description',
  }));

  const allProducts = (data?.data?.items || sampleProducts) as Product[];

  const selectedProducts = allProducts.filter((p: Product) => compareIds.includes(p.id));

  const handleAddToCart = (productId: string) => {
    addItem(productId, 1);
    toast.success('Added to cart!');
  };

  const handleWishlist = (productId: string) => {
    wishlistApi.add(productId).then(() => toast.success('Added to wishlist!')).catch(() => {});
  };

  const handleCompare = (productId: string) => {
    setCompareIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <Logo size="sm" showTagline={false} variant="text" />
          </Link>
          <div className="flex items-center gap-3 flex-1 max-w-md mx-4">
            <SmartSearch
              onSearch={(q) => setSearch(q)}
              placeholder="Search products..."
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLayout(layout === 'grid' ? 'list' : 'grid')} className="text-[--muted] hover:text-white p-1.5">
              {layout === 'grid' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              )}
            </button>
            <Link href="/cart" className="relative p-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Explore Products</h1>
            <p className="text-xs text-[--muted] mt-1">{data?.data?.total || 50} products found</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
            >
              <option value="popularity">Popularity</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className={layout === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'space-y-4'
          }>
            {allProducts.map((product: Product, i: number) => (
              <ProductCard
                key={product.id}
                product={product}
                layout={layout === 'list' ? 'list' : 'grid'}
                onAddToCart={handleAddToCart}
                onWishlist={handleWishlist}
                onCompare={handleCompare}
                isInCompare={compareIds.includes(product.id)}
                showMatchScore={true}
                showSocialProof={true}
              />
            ))}
          </div>
        )}

        {/* Compare Floating Bar */}
        {compareIds.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl border border-white/10"
          >
            <span className="text-sm">{compareIds.length} product{compareIds.length > 1 ? 's' : ''} selected</span>
            <Button size="sm" variant="ghost" onClick={() => setCompareIds([])}>Clear</Button>
            <Button size="sm" variant="primary" onClick={() => setShowCompare(true)}>Compare</Button>
          </motion.div>
        )}

        {/* Comparison Modal */}
        {showCompare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCompare(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-5xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <ProductComparison
                products={selectedProducts}
                onRemove={(id) => setCompareIds(prev => prev.filter(pid => pid !== id))}
                onAddToCart={handleAddToCart}
              />
              <div className="flex justify-center mt-4">
                <Button variant="ghost" size="sm" onClick={() => setShowCompare(false)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Pagination */}
        {(data?.data?.total_pages || 1) > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="ghost" size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-xs text-[--muted]">
              Page {page} of {data?.data?.total_pages || 1}
            </span>
            <Button
              variant="ghost" size="sm"
              onClick={() => setPage(p => Math.min(data?.data?.total_pages || 1, p + 1))}
              disabled={page === (data?.data?.total_pages || 1)}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
