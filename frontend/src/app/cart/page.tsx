'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { CartIcon } from '@/components/ui/emoji-icons';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, total, itemCount, isLoading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantity = (itemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      removeItem(itemId).catch(() => {});
    } else {
      updateItem(itemId, newQty).catch(() => {});
    }
  };

  const handleRemove = (itemId: string) => {
    removeItem(itemId).then(() => toast.success('Item removed from cart')).catch(() => {});
  };

  const shipping = total > 500 ? 0 : 9.99;
  const tax = total * 0.08;
  const discount = couponApplied ? total * 0.1 : 0;
  const grandTotal = total + shipping + tax - discount;

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">SHOPPING CART</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/products" className="text-xs text-[--muted] hover:text-white">Continue Shopping</Link>
            <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <p className="text-xs text-[--muted] mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[--primary] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-xl p-16 text-center">
            <div className="text-6xl mb-4 opacity-20"><CartIcon size={14} /></div>
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm text-[--muted] mb-6">Looks like you haven&apos;t added anything yet</p>
            <Link href="/products"><Button variant="primary">Start Shopping</Button></Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass rounded-xl p-4 card-3d flex gap-4"
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 shrink-0">
                      <img
                        src={item.product.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/products/${item.product_id}`}>
                          <h3 className="text-sm font-medium truncate hover:text-[--secondary] transition-colors">{item.product.name}</h3>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemove(item.id)}
                          className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors shrink-0"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-white">₹{item.product.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleQuantity(item.id, item.quantity, -1)}
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs hover:bg-white/10 transition-colors"
                          >−</motion.button>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            className="w-8 text-center text-xs font-medium"
                          >{item.quantity}</motion.span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleQuantity(item.id, item.quantity, 1)}
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs hover:bg-white/10 transition-colors"
                          >+</motion.button>
                        </div>
                        <span className="text-sm font-semibold text-[--secondary]">₹{item.total_price.toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {items.length > 1 && (
                <button onClick={() => clearCart().catch(() => {})} className="text-xs text-red-400 hover:text-red-300 transition-colors mt-2">
                  Clear all items
                </button>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="glass rounded-xl p-6 card-3d sticky top-28">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[--muted]">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[--muted]">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-[--accent]">Free</span> : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-[--muted]">
                    <span>Tax (8%)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-[--accent]">
                      <span>Discount (10%)</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-[--secondary]">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Coupon code"
                    className="input-glass text-xs flex-1"
                    disabled={couponApplied}
                  />
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => { if (coupon) setCouponApplied(true); }}
                    disabled={!coupon || couponApplied}
                  >{couponApplied ? 'Applied' : 'Apply'}</Button>
                </div>

                <Link href="/checkout">
                  <Button variant="primary" size="sm" className="w-full mt-4">Proceed to Checkout</Button>
                </Link>
                <Link href="/products">
                  <Button variant="ghost" size="sm" className="w-full mt-2">Continue Shopping</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
