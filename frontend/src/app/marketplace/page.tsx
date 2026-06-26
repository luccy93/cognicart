'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchIcon, StoreIcon, StarIcon, MapPinIcon, ArrowRightIcon, ShieldIcon, TrendingUpIcon, UsersIcon } from '@/components/ui/emoji-icons';

const featuredStores = [
  { id: 's1', name: 'TechPro Electronics', rating: 4.8, totalSales: 15230, products: 342, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop', location: 'San Francisco, CA', verified: true },
  { id: 's2', name: 'SmartGear Official', rating: 4.6, totalSales: 8940, products: 189, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop', location: 'Austin, TX', verified: true },
  { id: 's3', name: 'EliteBrand Store', rating: 4.9, totalSales: 23100, products: 512, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop', location: 'New York, NY', verified: true },
  { id: 's4', name: 'CogniTech Devices', rating: 4.5, totalSales: 5670, products: 98, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop', location: 'Seattle, WA', verified: false },
  { id: 's5', name: 'PrimeTech Solutions', rating: 4.7, totalSales: 12450, products: 267, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop', location: 'Chicago, IL', verified: true },
  { id: 's6', name: 'GadgetWorld Pro', rating: 4.4, totalSales: 3890, products: 145, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop', location: 'Miami, FL', verified: false },
];

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function MarketplacePage() {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">MARKETPLACE</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/marketplace/register" className="text-xs text-[--secondary] hover:underline font-medium">Become a Seller</Link>
            <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-space font-extrabold mb-3">
              <span className="text-gradient-primary">Seller Marketplace</span>
            </h1>
            <p className="text-sm text-[--muted] max-w-xl mx-auto">Discover unique products from verified sellers around the world</p>
            <div className="max-w-md mx-auto mt-6 relative">
              <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[--muted]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stores or products..." className="glass-input pl-10" />
            </div>
          </motion.div>

          <motion.section variants={containerVariants} initial="hidden" animate="visible" className="mb-12">
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-space text-gradient-primary">Featured Stores</h2>
              <span className="text-xs text-[--muted]">{featuredStores.length} stores</span>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredStores.map((store, i) => (
                <motion.div key={store.id} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} className="glass-card rounded-2xl overflow-hidden group">
                  <div className="relative h-32 bg-[--surface]">
                    <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-sm font-bold">
                          {store.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{store.name}</h3>
                          <div className="flex items-center gap-1 text-[10px] text-[--muted]">
                            <MapPinIcon size={10} /> {store.location}
                          </div>
                        </div>
                      </div>
                      {store.verified && <ShieldIcon size={14} className="text-[--secondary]" />}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-[--muted]">
                      <div className="flex items-center gap-1"><StarIcon size={12} /><span className="text-yellow-400">{store.rating}</span></div>
                      <div className="flex items-center gap-1"><TrendingUpIcon size={12} /> {store.totalSales.toLocaleString('en-US')} sales</div>
                      <div className="flex items-center gap-1"><StoreIcon size={12} /> {store.products} products</div>
                    </div>
                    <Link href={`/marketplace/sellers/${store.id}`}>
                      <Button variant="primary" size="sm" className="w-full mt-3">Visit Store <ArrowRightIcon size={12} /></Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="glass-strong rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[--primary]/20 via-purple-500/10 to-[--secondary]/20" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center mx-auto mb-4">
                  <StoreIcon size={24} className="text-black" />
                </div>
                <h2 className="text-2xl font-bold font-space mb-2">Become a Seller</h2>
                <p className="text-sm text-[--muted] max-w-lg mx-auto mb-6">Join thousands of sellers growing their business on CogniCart. Start selling in minutes with our easy onboarding.</p>
                <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
                  <div className="flex items-center gap-2 text-[--muted]"><ShieldIcon size={14} className="text-[--secondary]" /> Verified seller badge</div>
                  <div className="flex items-center gap-2 text-[--muted]"><UsersIcon size={14} className="text-[--secondary]" /> AI-powered marketplace</div>
                  <div className="flex items-center gap-2 text-[--muted]"><TrendingUpIcon size={14} className="text-[--secondary]" /> Real-time analytics</div>
                </div>
                <Link href="/marketplace/register"><Button variant="primary" size="lg">Register as Seller <ArrowRightIcon size={14} /></Button></Link>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
