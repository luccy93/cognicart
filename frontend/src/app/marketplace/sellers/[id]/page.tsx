'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StarIcon, MapPinIcon, ShieldIcon, PackageIcon, UsersIcon, PhoneIcon, MailIcon, ArrowLeftIcon, TrendingUpIcon, CheckIcon } from '@/components/ui/emoji-icons';

const sellerData: Record<string, { name: string; rating: number; totalSales: number; products: number; location: string; verified: boolean; joined: string; about: string; email: string; phone: string; response: string }> = {
  's1': { name: 'TechPro Electronics', rating: 4.8, totalSales: 15230, products: 342, location: 'San Francisco, CA', verified: true, joined: 'Jan 2023', about: 'Leading distributor of premium electronics and gadgets. We source directly from manufacturers to bring you the best prices on top-tier tech products. Our team of experts ensures every product meets strict quality standards.', email: 'contact@techpro.com', phone: '+1 (415) 555-0123', response: 'Within 2 hours' },
};

const sampleProducts = [
  { id: 'p1', name: 'Wireless Earbuds Pro', price: 976.62, rating: 4.9, sales: 295, image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=300&fit=crop' },
  { id: 'p2', name: 'Mechanical Keyboard RGB', price: 1245.29, rating: 4.3, sales: 300, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop' },
  { id: 'p3', name: 'Smart Watch Ultra', price: 1285.46, rating: 3.6, sales: 369, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop' },
  { id: 'p4', name: 'Gaming Mouse X', price: 702.67, rating: 3.7, sales: 420, image: 'https://images.unsplash.com/photo-1527864550417-2fd06e9c5f5f?w=400&h=300&fit=crop' },
  { id: 'p5', name: 'Noise Cancelling Headphones', price: 420.12, rating: 4.0, sales: 232, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop' },
  { id: 'p6', name: 'USB-C Hub 7-in-1', price: 659.98, rating: 4.4, sales: 197, image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=300&fit=crop' },
];

export default function SellerPage() {
  const params = useParams();
  const id = params.id as string;
  const seller = sellerData[id] || { name: 'Unknown Store', rating: 4.5, totalSales: 0, products: 0, location: 'Unknown', verified: false, joined: 'N/A', about: 'Store information not available.', email: '', phone: '', response: '' };
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">SELLER STORE</span>
          </div>
          <Link href="/marketplace" className="text-xs text-[--muted] hover:text-white flex items-center gap-1"><ArrowLeftIcon size={12} /> Back to Marketplace</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[--primary]/20 via-purple-500/10 to-[--secondary]/20" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-2xl font-bold shrink-0">
              {seller.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold font-space">{seller.name}</h1>
                {seller.verified && <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-[--secondary]/15 text-[--secondary] border border-[--secondary]/20"><ShieldIcon size={10} /> Verified</span>}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[--muted]">
                <div className="flex items-center gap-1"><StarIcon size={14} /><span className="text-yellow-400">{seller.rating}</span></div>
                <div className="flex items-center gap-1"><PackageIcon size={14} /> {seller.totalSales.toLocaleString('en-US')} sales</div>
                <div className="flex items-center gap-1"><MapPinIcon size={14} /> {seller.location}</div>
                <div className="flex items-center gap-1"><UsersIcon size={14} /> Joined {seller.joined}</div>
              </div>
              <p className="text-xs text-[--muted] mt-3 max-w-2xl">{seller.about}</p>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-6">
          {(['products', 'about'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'glass text-[--muted] hover:text-white'}`}>
              {tab === 'products' ? 'Products' : 'About Store'}
            </button>
          ))}
        </div>

        {activeTab === 'products' && (
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sampleProducts.map((product, i) => (
              <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } } }}
                whileHover={{ y: -6, scale: 1.02 }} className="glass-card rounded-2xl overflow-hidden group">
                <div className="relative aspect-[4/3] bg-[--surface]">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-medium truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-white">₹{product.price.toFixed(2)}</span>
                    <div className="flex items-center gap-1 ml-auto text-[10px] text-[--muted]">
                      <StarIcon size={10} /> {product.rating}
                    </div>
                  </div>
                  <Button variant="primary" size="sm" className="w-full mt-2 text-[10px]">View Product</Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'about' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 max-w-2xl">
            <div className="space-y-4">
              <div><h3 className="text-sm font-semibold mb-1">About</h3><p className="text-xs text-[--muted]">{seller.about}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><h3 className="text-xs font-semibold text-[--muted] uppercase tracking-wider mb-1">Contact</h3>
                  <div className="space-y-1 text-xs">{seller.email && <div className="flex items-center gap-1"><MailIcon size={12} /> {seller.email}</div>}{seller.phone && <div className="flex items-center gap-1"><PhoneIcon size={12} /> {seller.phone}</div>}</div>
                </div>
                <div><h3 className="text-xs font-semibold text-[--muted] uppercase tracking-wider mb-1">Store Info</h3>
                  <div className="space-y-1 text-xs"><div className="flex items-center gap-1"><MapPinIcon size={12} /> {seller.location}</div><div className="flex items-center gap-1"><TrendingUpIcon size={12} /> Response: {seller.response}</div></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
