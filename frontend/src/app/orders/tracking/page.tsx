'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OrderTracker } from '@/components/product/order-tracker';
import { PackageIcon, MapPinIcon, ClockIcon } from '@/components/ui/emoji-icons';

export const dynamic = 'force-dynamic';

const trackingData: Record<string, {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';
  orderNumber: string;
  estimatedDelivery: string;
  trackingNumber: string;
  carrier: string;
  items: { name: string; image: string }[];
  events: { status: string; date: string; location: string; completed: boolean }[];
}> = {
  'ORD-7842-KF': {
    status: 'delivered' as const,
    orderNumber: 'ORD-7842-KF',
    estimatedDelivery: 'Delivered on Dec 20, 2025',
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS',
    items: [
      { name: 'Sony WH-1000XM5 Wireless Headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop' },
    ],
    events: [
      { status: 'Delivered', date: 'Dec 20, 3:42 PM', location: 'New York, NY', completed: true },
      { status: 'Out for Delivery', date: 'Dec 20, 8:15 AM', location: 'New York, NY', completed: true },
      { status: 'Arrived at Facility', date: 'Dec 19, 11:30 PM', location: 'Brooklyn, NY', completed: true },
      { status: 'In Transit', date: 'Dec 18, 6:00 AM', location: 'Chicago, IL', completed: true },
      { status: 'Departed from Facility', date: 'Dec 17, 9:00 PM', location: 'Louisville, KY', completed: true },
      { status: 'Package Received', date: 'Dec 17, 2:15 PM', location: 'Louisville, KY', completed: true },
      { status: 'Label Created', date: 'Dec 16, 10:30 AM', location: 'San Francisco, CA', completed: true },
    ],
  },
};

export default function OrderTrackingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-7842-KF';
  const tracking = trackingData[orderId] || trackingData['ORD-7842-KF'];
  const [trackingInput, setTrackingInput] = useState('');
  const [searchedId, setSearchedId] = useState(orderId);

  const handleSearch = () => {
    if (trackingInput.trim()) setSearchedId(trackingInput.trim());
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold">Track Your Order</h1>
          <p className="text-[--muted] mt-2">Real-time updates for your shipment</p>
        </motion.div>

        <div className="glass rounded-xl p-4 mb-8 flex gap-3">
          <input
            value={trackingInput}
            onChange={e => setTrackingInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter order number (e.g., ORD-7842-KF)"
            className="input-glass text-sm flex-1 bg-transparent outline-none"
          />
          <Button variant="primary" onClick={handleSearch}>Track</Button>
        </div>

        <motion.div key={searchedId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold">{tracking.orderNumber}</h2>
                <p className="text-xs text-[--muted] mt-1">{tracking.carrier} · {tracking.trackingNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[--secondary] font-medium">{tracking.estimatedDelivery}</p>
              </div>
            </div>

            <OrderTracker status={tracking.status} orderNumber={tracking.orderNumber} estimatedDelivery={tracking.estimatedDelivery} trackingNumber={tracking.trackingNumber} carrier={tracking.carrier} />
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-4">Tracking Timeline</h3>
            <div className="space-y-0">
              {tracking.events.map((event, i) => (
                <div key={i} className="flex gap-4 pb-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${event.completed ? 'bg-[--secondary]' : 'bg-white/10'} shrink-0 mt-1`} />
                    {i < tracking.events.length - 1 && <div className="w-0.5 flex-1 bg-white/6 mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-sm font-medium">{event.status}</p>
                    <p className="text-xs text-[--muted]">{event.date} · {event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Link href={`/orders/${searchedId}`} className="flex-1">
              <Button variant="primary" className="w-full">View Order Details</Button>
            </Link>
            <Link href="/orders" className="flex-1">
              <Button variant="ghost" className="w-full">All Orders</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
