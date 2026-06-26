'use client';
import { motion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MatchScore } from '@/components/product/match-score';
import { useRouter } from 'next/navigation';
import { useState, useRef, useCallback } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (id: string) => void;
  onWishlist?: (id: string) => void;
  onCompare?: (id: string) => void;
  onQuickView?: (id: string) => void;
  isInWishlist?: boolean;
  isInCompare?: boolean;
  layout?: 'grid' | 'list' | 'compact';
  showMatchScore?: boolean;
  showSocialProof?: boolean;
}

const productImages: Record<string, string> = {
  'p1': 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=300&fit=crop',
  'p2': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
  'p3': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
  'p4': 'https://images.unsplash.com/photo-1527864550417-2fd06e9c5f5f?w=400&h=300&fit=crop',
  'p5': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
  'p6': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=300&fit=crop',
  'p7': 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&h=300&fit=crop',
  'p8': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=300&fit=crop',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';

function getProductImage(product: Product): string {
  if (product.thumbnail_url) return product.thumbnail_url;
  if (productImages[product.id]) return productImages[product.id];
  if (product.images?.length) return product.images[0].url;
  return FALLBACK_IMAGE;
}

const imgErrorHandler = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = FALLBACK_IMAGE;
};

export function ProductCard({ product, onAddToCart, onWishlist, onCompare, onQuickView, isInWishlist, isInCompare, layout = 'grid', showMatchScore = true, showSocialProof = true }: ProductCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: y * -10, y: x * 10 });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100) : 0;

  const imgSrc = getProductImage(product);

  const StarRating = ({ rating, count }: { rating: number; count?: number }) => (
    <div className="flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400 shrink-0">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <span className="text-sm text-yellow-400 font-semibold">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-muted">({count})</span>}
    </div>
  );

  if (layout === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.01 }}
        className="glass-card rounded-2xl p-5 flex gap-5 hover-glow-primary transition-all duration-300 cursor-pointer group"
        onClick={() => router.push(`/products/${product.id}`)}
      >
        <div className="w-36 h-36 rounded-xl overflow-hidden flex-shrink-0 bg-surface relative shadow-lg">
          <img src={imgSrc} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={imgErrorHandler} />
          {discount > 0 && (
            <Badge variant="danger" size="sm" className="absolute top-2 left-2">{discount}% OFF</Badge>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-space text-base font-bold truncate">{product.name}</h3>
              {product.brand && <p className="text-xs text-muted mt-0.5">{product.brand}</p>}
            </div>
            {showMatchScore && product.ai_match_score && <MatchScore score={product.ai_match_score} size="sm" />}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xl font-bold text-gradient-primary">{formatPrice(product.price, 'INR')}</span>
            {product.original_price && (
              <span className="text-sm text-muted line-through">{formatPrice(product.original_price, 'INR')}</span>
            )}
            {discount > 0 && <Badge variant="success" size="sm" className="text-green-400 bg-green-500/15 border-green-500/20">{discount}% OFF</Badge>}
          </div>
          <StarRating rating={product.average_rating || 0} count={product.total_ratings} />
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" variant="glass" onClick={(e) => { e?.stopPropagation(); onAddToCart?.(product.id); }}>Add to Cart</Button>
            <button onClick={(e) => { e?.stopPropagation(); onWishlist?.(product.id); }} className={cn('p-2 rounded-lg hover-glow-primary transition-all duration-300', isInWishlist ? 'text-red-400' : 'text-muted hover:text-red-400')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button onClick={(e) => { e?.stopPropagation(); onCompare?.(product.id); }} className={cn('p-2 rounded-lg hover-glow-primary transition-all duration-300', isInCompare ? 'text-secondary' : 'text-muted hover:text-secondary')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="4" height="18"/><rect x="10" y="7" width="4" height="14"/><rect x="18" y="5" width="4" height="16"/></svg>
            </button>
          </div>
          {showSocialProof && product.total_purchases && product.total_purchases > 50 && (
            <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              <span>{product.total_purchases}+ sold</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (layout === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        className="glass-card rounded-xl p-4 cursor-pointer hover-glow-primary transition-all duration-300 group"
        onClick={() => router.push(`/products/${product.id}`)}
      >
        <div className="w-full h-28 rounded-lg overflow-hidden bg-surface mb-3 relative shadow-md">
          <img src={imgSrc} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={imgErrorHandler} />
          {discount > 0 && (
            <Badge variant="danger" size="sm" className="absolute top-1 left-1">{discount}% OFF</Badge>
          )}
        </div>
        <h4 className="text-sm font-semibold truncate font-space">{product.name}</h4>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-bold text-gradient-primary">{formatPrice(product.price, 'INR')}</span>
          <StarRating rating={product.average_rating || 0} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={cn(
        'glass-card rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500',
        'hover:shadow-2xl hover:shadow-[--primary]/10 hover:border-[--primary]/30'
      )}
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => router.push(`/products/${product.id}`)}
    >
      <motion.div
        className="relative"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          <img
            src={imgSrc}
            alt={product.name}
            className={cn(
              'w-full h-full object-cover transition-transform duration-700 ease-out',
              isHovered && 'scale-110'
            )}
            onError={imgErrorHandler}
          />
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-500',
            isHovered ? 'opacity-100' : 'opacity-0'
          )} />
          {discount > 0 && (
            <Badge variant="danger" size="sm" className="absolute top-3 left-3 z-10 shadow-lg">{discount}% OFF</Badge>
          )}
          {showMatchScore && product.ai_match_score && (
            <div className="absolute top-3 right-3 z-10">
              <MatchScore score={product.ai_match_score} size="sm" />
            </div>
          )}
          {product.is_featured && !showMatchScore && !product.ai_match_score && (
            <Badge variant="primary" size="sm" className="absolute top-3 right-3 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="mr-0.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Featured
            </Badge>
          )}
          <div className={cn(
            'absolute inset-0 flex items-end p-4 transition-all duration-500',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            <div className="flex gap-2 w-full">
              <Button size="sm" variant="glass" className="flex-1 text-[11px] backdrop-blur-md font-semibold shadow-lg" onClick={(e) => { e?.stopPropagation(); onAddToCart?.(product.id); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Add to Cart
              </Button>
              <button onClick={(e) => { e?.stopPropagation(); onQuickView?.(product.id); }} className="p-2 rounded-lg backdrop-blur-md bg-white/10 text-white hover:bg-white/20 transition-all duration-300 shadow-lg" title="Quick View">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button onClick={(e) => { e?.stopPropagation(); onWishlist?.(product.id); }} className={cn('p-2 rounded-lg backdrop-blur-md transition-all duration-300 shadow-lg', isInWishlist ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400')} title="Wishlist">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <button onClick={(e) => { e?.stopPropagation(); onCompare?.(product.id); }} className={cn('p-2 rounded-lg backdrop-blur-md transition-all duration-300 shadow-lg', isInCompare ? 'bg-secondary/20 text-secondary' : 'bg-white/10 text-white hover:bg-secondary/20 hover:text-secondary')} title="Compare">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="4" height="18"/><rect x="10" y="7" width="4" height="14"/><rect x="18" y="5" width="4" height="16"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-space text-base font-bold truncate flex-1 leading-tight">{product.name}</h3>
          </div>
          <StarRating rating={product.average_rating || 0} count={product.total_ratings} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gradient-primary">{formatPrice(product.price, 'INR')}</span>
              {product.original_price && (
                <span className="text-sm text-muted line-through">{formatPrice(product.original_price, 'INR')}</span>
              )}
            </div>
            {discount > 0 && (
              <span className="text-xs font-semibold text-green-400 bg-green-500/15 px-2 py-0.5 rounded-full">-{discount}%</span>
            )}
          </div>
          {showSocialProof && (
            <div className="flex items-center gap-3 text-[10px] text-muted pt-3 border-t border-white/5">
              {product.total_purchases && product.total_purchases > 50 && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  {product.total_purchases}+ sold
                </span>
              )}
              <span>{product.total_ratings || 0} reviews</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
