'use client';
import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { ProductCard } from '@/components/product/product-card';
import { ImageSearch } from '@/components/search/image-search';
import { VoiceSearch } from '@/components/ui/voice-search';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { Search, SlidersHorizontal, Grid3X3, List, ArrowUpDown, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [sortBy, setSortBy] = useState('popularity');
  const [page, setPage] = useState(1);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const { addItem } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['search', query, category, sortBy, page],
    queryFn: () => productsApi.list({ q: query, category, sort_by: sortBy, page, page_size: 20 }),
    enabled: !!query,
  });

  const sampleResults: Product[] = Array.from({ length: 8 }).map((_, i) => ({
    id: `s-${i}`, name: ['Wireless Earbuds Pro', 'Mechanical Keyboard RGB', 'Smart Watch Ultra', 'Gaming Mouse X', 'Noise Cancelling Headphones', 'USB-C Hub 7-in-1', 'Portable SSD 1TB', 'Smart Home Hub'][i],
    price: [976.62, 1245.29, 1285.46, 702.67, 420.12, 659.98, 1488.81, 576.62][i],
    original_price: [1209.82, null, 1430.13, 826.12, 531.82, 755.70, 1771.55, 739.88][i],
    average_rating: [4.9, 4.3, 3.6, 3.7, 4.0, 4.4, 3.9, 3.5][i],
    total_ratings: 200 + i * 30,
    ai_match_score: [0.96, 0.94, 0.91, 0.89, 0.87, 0.85, 0.82, 0.79][i],
    thumbnail_url: ['https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1527864550417-2fd06e9c5f5f?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=300&fit=crop'][i],
    brand: ['EliteBrand', 'SmartGear', 'TechPro', 'TechPro', 'CogniTech', 'EliteBrand', 'PrimeTech', 'SmartGear'][i],
    popularity_score: 90 - i * 5, stock: 50 + i * 10, category_id: 'c1', slug: `product-${i}`,
    description: '', short_description: '',     is_featured: false, is_active: true, is_trending: false,
    total_purchases: 100 - i * 10, total_reviews: 50 - i * 5, tags: 'electronics', currency: 'INR', sku: '', category: null, images: [], created_at: '',
  }));

  const results = (data?.data?.items || (query ? sampleResults : [])) as Product[];
  const totalResults = data?.data?.total || results.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleVoiceResult = (text: string) => {
    setSearchInput(text);
    router.push(`/search?q=${encodeURIComponent(text)}`);
  };

  const handleImageResult = (imageUrl: string, description?: string) => {
    const searchTerm = description?.replace('Products similar to "', '').replace('"', '') || 'similar';
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/"><Logo size="sm" showTagline={false} variant="text" /></Link>
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative flex-1 max-w-lg">
            <Search size={14} className="absolute left-3.5 text-[--muted]" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="w-full bg-white/5 border border-white/[0.08] rounded-xl pl-10 pr-12 py-2 text-xs focus:outline-none focus:border-[#FF5C00]/30 transition-all"
            />
          </form>
          <div className="flex items-center gap-2">
            <VoiceSearch onResult={handleVoiceResult} />
            <ImageSearch onResult={handleImageResult} />
            <Link href="/cart" className="p-2 rounded-xl hover:bg-white/5"><ShoppingBag size={16} /></Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {!query ? (
          <div className="text-center py-24">
            <Search size={48} className="mx-auto text-[--muted] mb-4 opacity-30" />
            <h1 className="text-xl font-bold mb-2">Search Products</h1>
            <p className="text-xs text-[--muted] max-w-md mx-auto">
              Use the search bar above, try voice search, or upload an image to find products.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-lg font-bold">Results for &ldquo;{query}&rdquo;</h1>
                <p className="text-[10px] text-[--muted] mt-0.5">{totalResults} product{totalResults !== 1 ? 's' : ''} found</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setLayout('grid')} className={`p-1.5 rounded-lg ${layout === 'grid' ? 'bg-white/10 text-white' : 'text-[--muted] hover:text-white'}`}><Grid3X3 size={14} /></button>
                <button onClick={() => setLayout('list')} className={`p-1.5 rounded-lg ${layout === 'list' ? 'bg-white/10 text-white' : 'text-[--muted] hover:text-white'}`}><List size={14} /></button>
                <div className="w-px h-4 bg-white/[0.06]" />
                <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-xs"><SlidersHorizontal size={12} /> Filters</button>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="bg-white/5 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className={`grid ${layout === 'grid' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'} gap-4`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16">
                <Search size={32} className="mx-auto text-[--muted] mb-3 opacity-30" />
                <h2 className="text-sm font-bold mb-1">No results found</h2>
                <p className="text-xs text-[--muted] mb-4">Try different keywords or browse our categories</p>
                <Link href="/products"><Button variant="primary" size="sm">Browse All Products</Button></Link>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`grid ${layout === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}
              >
                {results.map((product, i) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <ProductCard
                      product={product}
                      layout={layout === 'list' ? 'list' : 'grid'}
                      onAddToCart={(id) => { addItem(id, 1); toast.success('Added to cart!'); }}
                      onWishlist={(id) => { productsApi.list({}); toast.success('Added to wishlist!'); }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {totalResults > 20 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft size={14} /> Previous
                </Button>
                <span className="text-xs text-[--muted]">Page {page}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-[--muted]">Loading...</p></div>}>
      <SearchContent />
    </Suspense>
  );
}
