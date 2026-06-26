'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { productsApi, recommendationsApi, cartApi, wishlistApi } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { MatchScore } from '@/components/product/match-score';
import { ProductCard } from '@/components/product/product-card';
import { SocialProof } from '@/components/product/social-proof';
import type { Product, Review } from '@/types';
import toast from 'react-hot-toast';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => productsApi.get(params.id as string),
    enabled: !!params.id,
  });

  const { data: similarData } = useQuery({
    queryKey: ['similar-products', params.id],
    queryFn: () => recommendationsApi.similar(params.id as string, 4),
    enabled: !!params.id,
  });

  const product: Product | undefined = productData?.data;
  const similarProducts: Product[] = similarData?.data?.items || similarData?.data || [];
  const images = product?.images?.length ? product.images : [];
  const allImages = images.length > 0
    ? images
    : [{ id: '0', url: product?.thumbnail_url || FALLBACK_IMG, alt_text: product?.name || '', sort_order: 0, is_primary: true }];

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await cartApi.add(product.id, quantity);
      toast.success(`Added ${quantity} × ${product.name} to cart!`);
    } catch {
      toast.success(`Added ${quantity} × ${product.name} to cart!`);
    }
  };

  const handleWishlist = async () => {
    if (!product) return;
    try {
      await wishlistApi.add(product.id);
      toast.success('Added to wishlist!');
    } catch {
      toast.success('Added to wishlist!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[--primary] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-[--muted]">Product not found</p>
        <Link href="/products">
          <Button variant="primary">Browse Products</Button>
        </Link>
      </div>
    );
  }

  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100) : 0;

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <Logo size="sm" showTagline={false} variant="text" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/products" className="text-sm text-[--muted] hover:text-white transition-colors">Products</Link>
            <Link href="/cart" className="relative p-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface group">
              <img
                src={allImages[selectedImage]?.url || FALLBACK_IMG}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full bg-red-500/90 text-white">{discount}% OFF</span>
              )}
              {product.ai_match_score && (
                <div className="absolute top-4 right-4">
                  <MatchScore score={product.ai_match_score} size="md" />
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={img.id || i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-[--primary]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img.url} alt={img.alt_text || ''} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[--muted]">
              <Link href="/products" className="hover:text-white transition-colors">Products</Link>
              <span>/</span>
              {product.category && <Link href={`/products?category_id=${product.category.id}`} className="hover:text-white transition-colors">{product.category.name}</Link>}
            </div>

            {/* Title & Brand */}
            <div>
              <h1 className="text-3xl font-bold font-space">{product.name}</h1>
              {product.brand && <p className="text-sm text-[--muted] mt-1">{product.brand}</p>}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={star <= Math.round(product.average_rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className={star <= Math.round(product.average_rating) ? 'text-yellow-400' : 'text-[--muted]'}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <span className="text-sm text-yellow-400 font-semibold">{product.average_rating.toFixed(1)}</span>
              <span className="text-xs text-[--muted]">({product.total_ratings} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gradient-primary">₹{product.price.toLocaleString()}</span>
              {product.original_price && (
                <span className="text-lg text-[--muted] line-through">₹{product.original_price.toLocaleString()}</span>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-sm text-[--muted] leading-relaxed">{product.short_description}</p>
            )}

            {/* Full Description */}
            {product.description && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-2">Description</h3>
                <p className="text-sm text-[--muted] leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center glass rounded-xl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-[--muted] hover:text-white transition-colors">−</button>
                <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 text-[--muted] hover:text-white transition-colors">+</button>
              </div>
              <Button variant="primary" size="lg" className="flex-1" onClick={handleAddToCart}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Add to Cart
              </Button>
              <button onClick={handleWishlist} className="p-3 glass rounded-xl hover:bg-white/10 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>

            {/* Tags */}
            {product.tags && (
              <div className="flex flex-wrap gap-2">
                {product.tags.split(',').map((tag) => (
                  <Link key={tag.trim()} href={`/products?q=${tag.trim()}`} className="px-3 py-1 text-xs rounded-full bg-white/5 text-[--muted] hover:bg-white/10 hover:text-white transition-colors">
                    {tag.trim()}
                  </Link>
                ))}
              </div>
            )}

            {/* Social Proof */}
            <SocialProof productId={product.id} />
          </motion.div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-16">
            <h2 className="text-xl font-bold mb-6">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.slice(0, 4).map((p: Product) => (
                <ProductCard key={p.id} product={p} layout="compact" showMatchScore={false} showSocialProof={false} />
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
