'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn, formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import { MatchScore } from '@/components/product/match-score';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarIcon } from '@/components/ui/emoji-icons';

interface ProductComparisonProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

const specs = ['price', 'average_rating', 'total_ratings', 'brand', 'stock', 'popularity_score'] as const;
const specLabels: Record<string, string> = {
  price: 'Price',
  average_rating: 'Rating',
  total_ratings: 'Reviews',
  brand: 'Brand',
  stock: 'Stock',
  popularity_score: 'Popularity',
};

export function ProductComparison({ products, onRemove, onAddToCart }: ProductComparisonProps) {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  if (products.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Compare Products</h3>
        <span className="text-xs text-[--muted]">{products.length} products selected</span>
      </div>

      <div className="min-w-[600px]">
        <div className="grid grid-cols-[120px_repeat(auto-fill,minmax(180px,1fr))] gap-4">
          <div className="space-y-4">
            <div className="h-48" />
            {specs.map(spec => (
              <div key={spec} className="h-10 flex items-center text-xs text-[--muted] font-medium">
                {specLabels[spec]}
              </div>
            ))}
            <div className="h-24" />
          </div>

          {products.map(product => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 relative"
            >
              <button
                onClick={() => onRemove(product.id)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-colors z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>

              <div className="h-48 rounded-xl overflow-hidden bg-[--surface]">
                <img src={product.thumbnail_url || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop`} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                {product.ai_match_score && <MatchScore score={product.ai_match_score} size="sm" className="mt-1" />}
              </div>

              {specs.map(spec => {
                const value = product[spec];
                const isBest = spec === 'price'
                  ? value === Math.min(...products.map(p => p.price))
                  : value === Math.max(...products.map(p => Number(p[spec] || 0)));
                return (
                  <div key={spec} className="h-10 flex items-center">
                    {spec === 'price' ? (
                      <div className="flex items-center gap-1">
                        <span className={cn('text-sm font-bold', isBest && 'text-emerald-400')}>
                          ${formatPrice(Number(value))}
                        </span>
                        {isBest && <Badge variant="success" size="sm">Best</Badge>}
                      </div>
                    ) : spec === 'average_rating' ? (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-xs">{[...Array(Math.round(Number(value) || 0))].map((_, i) => <StarIcon key={i} size={14} />)}</span>
                        <span className="text-xs">{Number(value).toFixed(1)}</span>
                      </div>
                    ) : spec === 'popularity_score' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[--primary] to-[--secondary] rounded-full" style={{ width: `${Number(value)}%` }} />
                        </div>
                        <span className="text-xs text-[--muted]">{String(value)}</span>
                      </div>
                    ) : (
                      <span className="text-xs">{String(value || '—')}</span>
                    )}
                  </div>
                );
              })}

              <Button size="sm" variant="primary" className="w-full" onClick={() => onAddToCart(product.id)}>
                Add to Cart
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CompareFloatingBar({ count, onClear, onView }: { count: number; onClear: () => void; onView: () => void }) {
  if (count === 0) return null;
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl border border-white/10"
    >
      <span className="text-sm">{count} product{count > 1 ? 's' : ''} selected</span>
      <Button size="sm" variant="ghost" onClick={onClear}>Clear</Button>
      <Button size="sm" variant="primary" onClick={onView}>Compare</Button>
    </motion.div>
  );
}
