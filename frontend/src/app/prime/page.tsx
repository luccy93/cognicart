'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CrownIcon, CheckIcon, TruckIcon, ShieldIcon, StarIcon, ZapIcon, GiftIcon, RocketIcon, ArrowRightIcon } from '@/components/ui/emoji-icons';

const plans = [
  { id: 'monthly', name: 'Monthly', price: 9.99, period: '/month', original: 14.99, popular: false },
  { id: 'annual', name: 'Annual', price: 79.99, period: '/year', original: 119.99, popular: true, savings: 'Save 33%' },
  { id: 'lifetime', name: 'Lifetime', price: 199.99, period: ' one-time', original: 499.99, popular: false, savings: 'Save 60%' },
];

const benefits = [
  { icon: <TruckIcon size={20} />, title: 'Free Express Shipping', desc: 'Free 2-day shipping on all orders, no minimum' },
  { icon: <ShieldIcon size={20} />, title: 'Extended Warranty', desc: 'Double the manufacturer warranty on all products' },
  { icon: <StarIcon size={20} />, title: 'Early Access', desc: 'Get early access to flash sales and new products' },
  { icon: <ZapIcon size={20} />, title: 'Priority Support', desc: '24/7 dedicated support with priority queue' },
  { icon: <GiftIcon size={20} />, title: 'Exclusive Deals', desc: 'Member-only prices and exclusive product drops' },
  { icon: <RocketIcon size={20} />, title: 'Free Returns', desc: 'Free return shipping on all eligible items' },
];

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function PrimePage() {
  const [selected, setSelected] = useState('annual');
  const [isSubscribed] = useState(false);

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">PRIME MEMBERSHIP</span>
          </div>
          <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center mx-auto mb-4">
              <CrownIcon size={24} className="text-black" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-space font-extrabold mb-3">
              <span className="text-gradient-primary">CogniCart Prime</span>
            </h1>
            <p className="text-sm text-[--muted] max-w-xl mx-auto">Unlock premium benefits for the ultimate shopping experience</p>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => (
              <motion.div key={plan.id} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => setSelected(plan.id)}
                className={`glass-card rounded-2xl p-6 cursor-pointer relative transition-all ${selected === plan.id ? 'border-[--primary]/40 shadow-lg shadow-[--primary]/10' : ''} ${plan.popular ? 'border-[--secondary]/30' : ''}`}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[--primary] to-[--secondary] text-black text-[10px] font-bold">Most Popular</div>}
                {plan.savings && <div className="absolute -top-3 right-4 px-2 py-1 rounded-full bg-[--accent] text-black text-[8px] font-bold">{plan.savings}</div>}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-space font-bold">${plan.price}</span>
                  <span className="text-xs text-[--muted]">{plan.period}</span>
                  {plan.original && <div className="text-[10px] text-[--muted] line-through mt-0.5">${plan.original}{plan.period}</div>}
                </div>
                <ul className="mt-4 space-y-2 text-xs">
                  <li className="flex items-center gap-2"><CheckIcon size={12} className="text-[--secondary]" /> Free express shipping</li>
                  <li className="flex items-center gap-2"><CheckIcon size={12} className="text-[--secondary]" /> Extended warranty</li>
                  <li className="flex items-center gap-2"><CheckIcon size={12} className="text-[--secondary]" /> Early access to sales</li>
                  <li className="flex items-center gap-2"><CheckIcon size={12} className="text-[--secondary]" /> Priority support</li>
                  {plan.id === 'lifetime' && <li className="flex items-center gap-2"><CheckIcon size={12} className="text-[--secondary]" /> Lifetime benefits</li>}
                </ul>
                <div className="mt-4" onClick={e => e.stopPropagation()}>
                  {isSubscribed ? (
                    <Button variant="ghost" size="sm" className="w-full">Current Plan</Button>
                  ) : (
                    <Button variant={selected === plan.id ? 'primary' : 'secondary'} size="sm" className="w-full">
                      {selected === plan.id ? 'Subscribe' : 'Select'} {plan.id === 'annual' || plan.id === 'lifetime' ? 'Plan' : ''}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.section variants={containerVariants} initial="hidden" animate="visible" className="mb-16">
            <motion.h2 variants={itemVariants} className="text-xl font-bold font-space text-center mb-8 text-gradient-primary">All Prime Benefits</motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((ben, i) => (
                <motion.div key={i} variants={itemVariants} className="glass-card rounded-xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[--primary]/20 to-[--secondary]/20 flex items-center justify-center text-[--secondary] shrink-0">{ben.icon}</div>
                  <div><h3 className="text-sm font-semibold">{ben.title}</h3><p className="text-xs text-[--muted] mt-1">{ben.desc}</p></div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-bold font-space mb-2">Already a Prime Member?</h2>
            <p className="text-sm text-[--muted] mb-6">Manage your subscription, view billing history, or update preferences.</p>
            <div className="flex justify-center gap-3">
              <Button variant="primary" size="sm">Manage Subscription</Button>
              <Button variant="ghost" size="sm">View Benefits</Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
