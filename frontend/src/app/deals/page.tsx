'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LightningIcon, ClockIcon, FireIcon, TagIcon, ArrowRightIcon, GiftIcon } from '@/components/ui/emoji-icons';

const activeSales = [
  { id: 'f1', name: 'Tech Mega Sale', discount: 'Up to 40%', ends: '2h 15m 30s', items: 24, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop', color: 'from-[--accent]/20 to-red-500/10' },
  { id: 'f2', name: 'Fashion Flash', discount: 'Up to 50%', ends: '5h 30m 00s', items: 18, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop', color: 'from-purple-500/20 to-pink-500/10' },
];

const upcomingSales = [
  { id: 'u1', name: 'Winter Clearance', starts: 'Dec 25, 2025', discount: 'Up to 60%' },
  { id: 'u2', name: 'New Year Bonanza', starts: 'Jan 1, 2026', discount: 'Up to 45%' },
  { id: 'u3', name: 'Tech Fest 2026', starts: 'Jan 15, 2026', discount: 'Up to 35%' },
];

const dealItems = [
  { id: 'd1', name: 'Sony WH-1000XM5', price: 24999, original: 39990, discount: 37, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', sold: 68 },
  { id: 'd2', name: 'MacBook Air M3', price: 84999, original: 114990, discount: 26, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop', sold: 42 },
  { id: 'd3', name: 'Samsung Galaxy Watch 6', price: 24999, original: 35999, discount: 30, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', sold: 55 },
  { id: 'd4', name: 'AirPods Pro 2', price: 18999, original: 24999, discount: 24, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b3e2?w=400&h=300&fit=crop', sold: 81 },
  { id: 'd5', name: 'iPad Air M2', price: 54999, original: 74999, discount: 27, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop', sold: 33 },
  { id: 'd6', name: 'Dyson V15 Detect', price: 39999, original: 59999, discount: 33, image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=300&fit=crop', sold: 27 },
  { id: 'd7', name: 'PlayStation 5 Slim', price: 44999, original: 54999, discount: 18, image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop', sold: 94 },
  { id: 'd8', name: 'Samsung 65" OLED TV', price: 129999, original: 179999, discount: 28, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop', sold: 15 },
];

function Countdown({ ends }: { ends: string }) {
  const [display, setDisplay] = useState(ends);
  useEffect(() => {
    const interval = setInterval(() => {
      const parts = ends.split(':').map(Number);
      let total = parts[0] * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
      if (total <= 0) { setDisplay('Ended'); clearInterval(interval); return; }
      total -= 1;
      const h = Math.floor(total / 3600); const m = Math.floor((total % 3600) / 60); const s = total % 60;
      setDisplay(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [ends]);
  return <span>{display}</span>;
}

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function DealsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming'>('active');

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">FLASH DEALS</span>
          </div>
          <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-space">Flash Deals</h1>
            <p className="text-xs text-[--muted] mt-1">Limited time offers — grab them before they&apos;re gone!</p>
          </div>
          <FireIcon size={24} className="text-[--accent] animate-breathe" />
        </motion.div>

        <div className="flex gap-2 mb-8">
          {(['active', 'upcoming'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? 'bg-gradient-to-r from-[--accent] to-red-500 text-black' : 'glass text-[--muted] hover:text-white'}`}>
              {tab === 'active' ? 'Active Sales' : 'Upcoming Sales'}
            </button>
          ))}
        </div>

        {activeTab === 'active' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            {activeSales.map((sale, i) => (
              <motion.div key={sale.id} variants={itemVariants} className={`glass-strong rounded-3xl overflow-hidden relative ${sale.color}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
                <div className="relative h-48 sm:h-56">
                  <img src={sale.image} alt={sale.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
                  <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 sm:p-8">
                    <span className="text-[10px] uppercase tracking-widest text-[--accent] font-medium flex items-center gap-1"><LightningIcon size={12} /> Live Now</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-space mt-1">{sale.name}</h2>
                    <p className="text-lg font-bold text-[--accent] mt-1">{sale.discount} Off</p>
                    <div className="flex items-center gap-2 mt-3">
                      <ClockIcon size={14} className="text-[--muted]" />
                      <span className="text-sm font-mono font-bold text-white"><Countdown ends={sale.ends} /></span>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <Button variant="primary" size="sm">Shop Now <ArrowRightIcon size={12} /></Button>
                      <span className="text-xs text-[--muted]">{sale.items} items on sale</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.section variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-space text-gradient-primary">Deal Items</h2>
                <span className="text-xs text-[--muted]">{dealItems.length} items</span>
              </motion.div>
              <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {dealItems.map((item, i) => (
                  <motion.div key={item.id} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} className="glass-card rounded-2xl overflow-hidden group">
                    <div className="relative aspect-[4/3] bg-[--surface]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-[--accent] text-black text-[10px] font-bold">-{item.discount}%</div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-medium truncate">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-[--secondary]">₹{item.price.toLocaleString('en-US')}</span>
                        <span className="text-[10px] text-[--muted] line-through">₹{item.original.toLocaleString('en-US')}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-[10px] text-[--muted]"><FireIcon size={10} className="text-[--accent]" /> {item.sold}% sold</div>
                        <Button variant="primary" size="sm" className="text-[10px] px-2 py-1">Grab</Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          </motion.div>
        )}

        {activeTab === 'upcoming' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid sm:grid-cols-3 gap-6">
            {upcomingSales.map((sale, i) => (
              <motion.div key={sale.id} variants={itemVariants} className="glass-card rounded-2xl p-6 text-center">
                <GiftIcon size={24} className="mx-auto mb-3 text-[--secondary]" />
                <h3 className="text-sm font-bold">{sale.name}</h3>
                <p className="text-lg font-bold text-[--accent] mt-1">{sale.discount}</p>
                <p className="text-xs text-[--muted] mt-2">Starts {sale.starts}</p>
                <Button variant="secondary" size="sm" className="w-full mt-4">Notify Me</Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
