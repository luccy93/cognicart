'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { ProductComparison } from '@/components/product/product-comparison';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  const { addItem } = useCartStore();

  const queries = ids.map(id => useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id).then(res => res.data),
    enabled: !!id,
  }));

  const isLoading = queries.some(q => q.isLoading);
  const products = queries.map(q => q.data).filter(Boolean) as Product[];
  const error = queries.some(q => q.error);

  const handleAddToCart = (productId: string) => {
    addItem(productId, 1);
    toast.success('Added to cart!');
  };

  const handleRemove = (productId: string) => {
    const remaining = ids.filter(id => id !== productId);
    if (remaining.length === 0) {
      window.history.back();
      return;
    }
    const params = new URLSearchParams({ ids: remaining.join(',') });
    window.history.replaceState(null, '', `/compare?${params}`);
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <Logo size="sm" showTagline={false} variant="text" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/products" className="text-xs text-[--muted] hover:text-white">Back to Products</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Compare Products</h1>
          <p className="text-xs text-[--muted] mt-1">{ids.length} product{ids.length !== 1 ? 's' : ''} selected</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ids.map((id) => (
              <ProductCardSkeleton key={id} />
            ))}
          </div>
        ) : error ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-4">Failed to load products</p>
            <Link href="/products">
              <Button variant="ghost" size="sm">Back to Products</Button>
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-[--muted] mb-4">No products to compare</p>
            <Link href="/products">
              <Button variant="primary" size="sm">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <ProductComparison
            products={products}
            onRemove={handleRemove}
            onAddToCart={handleAddToCart}
          />
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-[--muted]">Loading...</p></div>}>
      <CompareContent />
    </Suspense>
  );
}
