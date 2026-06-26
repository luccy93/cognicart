'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { OrderTracker } from '@/components/product/order-tracker';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { DocumentIcon, PackageIcon } from '@/components/ui/emoji-icons';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';

const sampleOrders: Record<string, {
  status: OrderStatus;
  orderNumber: string;
  estimatedDelivery: string;
  trackingNumber: string;
  carrier: string;
  items: { name: string; price: number; qty: number; image: string }[];
  shippingAddress: string;
  paymentMethod: string;
  subtotal: number;
  total: number;
}> = {
  'ORD-7842-KF': {
    status: 'delivered',
    orderNumber: 'ORD-7842-KF',
    estimatedDelivery: 'Delivered on Dec 20, 2025',
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS',
    items: [
      { name: 'Sony WH-1000XM5 Wireless Headphones', price: 278, qty: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop' },
      { name: 'Nike Air Max 270 React', price: 109, qty: 1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop' },
    ],
    shippingAddress: '123 Main St, Apt 4B, New York, NY 10001',
    paymentMethod: 'Visa **** 4242',
    subtotal: 387,
    total: 418.87,
  },
  'ORD-7841-AB': {
    status: 'shipped',
    orderNumber: 'ORD-7841-AB',
    estimatedDelivery: 'Dec 28, 2025',
    trackingNumber: '1Z999AA10123456785',
    carrier: 'FedEx',
    items: [{ name: 'Apple MacBook Air M3 15-inch', price: 1299, qty: 1, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop' }],
    shippingAddress: '123 Main St, Apt 4B, New York, NY 10001',
    paymentMethod: 'Mastercard **** 5678',
    subtotal: 1299,
    total: 1411.87,
  },
  'ORD-7840-XZ': {
    status: 'processing',
    orderNumber: 'ORD-7840-XZ',
    estimatedDelivery: 'Jan 5, 2026',
    trackingNumber: '1Z999AA10123456786',
    carrier: 'USPS',
    items: [
      { name: 'Bose QuietComfort Earbuds II', price: 199, qty: 2, image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=300&fit=crop' },
      { name: 'Logitech MX Master 3S Mouse', price: 79, qty: 1, image: 'https://images.unsplash.com/photo-1527864550417-2fd06e9c5f5f?w=400&h=300&fit=crop' },
    ],
    shippingAddress: '123 Main St, Apt 4B, New York, NY 10001',
    paymentMethod: 'Visa **** 4242',
    subtotal: 477,
    total: 522.86,
  },
  'ORD-7839-WP': {
    status: 'pending',
    orderNumber: 'ORD-7839-WP',
    estimatedDelivery: 'Jan 10, 2026',
    trackingNumber: 'Pending',
    carrier: 'TBD',
    items: [{ name: 'Samsung Galaxy Watch 6 Classic', price: 329, qty: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop' }],
    shippingAddress: '123 Main St, Apt 4B, New York, NY 10001',
    paymentMethod: 'Amex **** 3456',
    subtotal: 329,
    total: 365.28,
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id.replace('#', '') : '';
  const order = id ? sampleOrders[id] : null;
  const [showReceipt, setShowReceipt] = useState(false);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-xl p-12 text-center max-w-md">
          <div className="text-6xl mb-4 opacity-20"><PackageIcon size={14} /></div>
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <p className="text-sm text-[--muted] mb-6">The order you&apos;re looking for doesn&apos;t exist</p>
          <Link href="/orders"><Button variant="primary">Back to Orders</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">ORDER DETAILS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/orders" className="text-xs text-[--muted] hover:text-white">All Orders</Link>
            <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
              <p className="text-xs text-[--muted] mt-1">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
            </div>
            <Link href="/orders"><Button variant="ghost" size="sm">← Back</Button></Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <OrderTracker
                status={order.status}
                orderNumber={order.orderNumber}
                estimatedDelivery={order.estimatedDelivery}
                trackingNumber={order.trackingNumber}
                carrier={order.carrier}
              />

              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03]"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-[--muted] mt-0.5">Qty: {item.qty} × {formatPrice(item.price)}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(item.price * item.qty)}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={() => setShowReceipt(!showReceipt)}
                  className="glass rounded-2xl p-4 w-full text-left hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium"><DocumentIcon size={14} /> View Receipt</span>
                    <motion.svg
                      animate={{ rotate: showReceipt ? 180 : 0 }}
                      className="w-4 h-4 text-[--muted]"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </div>
                </button>
                {showReceipt && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="glass rounded-b-2xl border-t border-white/5 px-6 py-4 overflow-hidden"
                  >
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-[--muted]">
                        <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-[--muted]">
                        <span>Shipping</span><span className="text-[--accent]">Free</span>
                      </div>
                      <div className="flex justify-between text-[--muted]">
                        <span>Tax</span><span>{formatPrice(order.total - order.subtotal)}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-base">
                        <span>Total</span><span className="text-[--secondary]">{formatPrice(order.total)}</span>
                      </div>
                      <div className="pt-3 text-xs text-[--muted]">
                        <p>Payment: {order.paymentMethod}</p>
                        <p>Shipping: {order.shippingAddress}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-3">Shipping Address</h3>
                <p className="text-xs text-[--muted]">{order.shippingAddress}</p>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-3">Payment</h3>
                <p className="text-xs text-[--muted]">{order.paymentMethod}</p>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-3">Need Help?</h3>
                <p className="text-xs text-[--muted] mb-3">Contact support or use the AI assistant</p>
                <Button variant="primary" size="sm" className="w-full">Contact Support</Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
