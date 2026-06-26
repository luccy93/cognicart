'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/authStore';
import { Logo } from '@/components/brand/logo';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';
import {
  StarIcon, FireIcon, TruckIcon, ShieldIcon,
  ArrowRightIcon, UserIcon, ClockIcon,
  DiamondIcon, RocketIcon, GiftIcon,
  CheckIcon, TargetIcon, HeartIcon, EyeIcon
} from '@/components/ui/emoji-icons';

const ThreeHero = dynamic(() => import('./three-hero'), { ssr: false });

const products = [
  { id: 1, name: 'Sony WH-1000XM5', category: 'Headphones', price: 29999, original: 34999, discount: 14, rating: 4.8, reviews: 2341, match: 97, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' },
  { id: 2, name: 'Apple MacBook Air M3', category: 'Laptops', price: 114999, original: 129999, discount: 12, rating: 4.9, reviews: 4521, match: 94, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop' },
  { id: 3, name: 'Nike Air Max Pulse', category: 'Sneakers', price: 12995, original: 15995, discount: 19, rating: 4.7, reviews: 1832, match: 96, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
  { id: 4, name: 'Samsung Galaxy S24 Ultra', category: 'Smartphones', price: 129999, original: 149999, discount: 13, rating: 4.8, reviews: 3620, match: 92, img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop' },
];

const benefits = [
  { icon: <TargetIcon size={20} />, title: 'AI-Powered Recommendations', desc: 'Our hybrid engine combines collaborative filtering, deep learning, and content-based analysis to match products to your preferences.' },
  { icon: <ShieldIcon size={20} />, title: 'Secure Shopping Experience', desc: 'Your data is encrypted and protected. We prioritize your privacy with transparent data practices and secure transactions.' },
  { icon: <InfinityLoopIcon size={20} />, title: 'Smart Product Discovery', desc: 'Browse smarter with real-time price insights, personalized deals, and AI-driven product suggestions tailored to your taste.' },
];

const steps = [
  { icon: <EyeIcon />, title: 'Browse', desc: 'You explore products that catch your eye' },
  { icon: <InfinityLoopIcon size={16} />, title: 'Learn', desc: 'AI analyzes browsing, purchases, and preferences' },
  { icon: <TargetIcon />, title: 'Analyze', desc: 'Three engines compute your perfect matches' },
  { icon: <HeartIcon />, title: 'Recommend', desc: 'Hyper-personalized suggestions appear' },
];

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.2, 0.9, 0.4, 1] },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.2, 0.9, 0.4, 1] },
  },
};

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} size={size} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-[--muted]/30'} />
      ))}
      <span className="text-xs text-[--muted] ml-1">{rating}</span>
    </div>
  );
}

export default function LandingPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement | null>(null);
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  }, []);

  const parallaxStyle = (depth = 10) => ({
    transform: `translate(${mousePos.x * depth}px, ${mousePos.y * depth}px)`,
    transition: 'transform 0.15s cubic-bezier(0.2, 0.9, 0.4, 1)',
  });

  return (
    <>

      {/* ─── Personalized Greeting (Logged In) ─── */}
      {isAuthenticated && user && (
        <section className="relative pt-24 px-4 sm:px-6 neural-grid">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden isolate"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[--primary]/20 via-purple-500/10 to-[--secondary]/20" />
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-[--primary]/10 rounded-full blur-[80px] animate-float" />
              <div className="relative z-10">
                <span className="text-[10px] font-medium text-[--secondary] uppercase tracking-wider">{greeting}, {user.full_name?.split(' ')[0] || 'there'}</span>
                <h1 className="text-xl sm:text-2xl font-space font-bold mt-1">
                  Welcome back to <span className="text-gradient-primary">CogniCart</span>
                </h1>
                <p className="text-xs text-[--muted] mt-2 max-w-xl">
                  Your AI has found <strong className="text-[--secondary]">25 new products</strong> and <strong className="text-[--secondary]">3 price drops</strong> since your last visit.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link href="/dashboard" className="btn-primary text-xs px-4 py-2">
                    Go to Dashboard
                    <ArrowRightIcon size={12} />
                  </Link>
                  <Link href="/ai-shopper" className="btn-secondary text-xs px-4 py-2">
                    <InfinityLoopIcon size={12} />
                    AI Shopper
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── Section 1: Hero ─── */}
      <section ref={heroRef} onMouseMove={handleMouseMove} className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16 neural-grid">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[10%] left-[5%] w-96 h-96 rounded-full bg-[--primary]/5 blur-[100px] animate-breathe" />
          <div className="absolute bottom-[10%] right-[5%] w-[30rem] h-[30rem] rounded-full bg-[--secondary]/4 blur-[100px] animate-breathe" style={{ animationDelay: '2.5s' }} />
          <div className="absolute top-[30%] right-[20%] w-64 h-64 rounded-full bg-[--accent]/3 blur-[80px] animate-float-slow" />
          <div className="absolute top-[20%] left-[10%] w-16 h-16 rounded-full glass animate-float" />
          <div className="absolute top-[55%] left-[4%] w-10 h-10 rounded-full glass animate-float" style={{ animationDelay: '1.8s' }} />
          <div className="absolute top-[25%] right-[10%] w-12 h-12 rounded-full glass animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-[25%] right-[25%] w-8 h-8 rounded-full glass animate-float" style={{ animationDelay: '2.5s' }} />
          <div className="absolute top-[45%] left-[40%] w-20 h-20 rounded-full border border-[--glass-border] animate-spin-slow" style={{ animationDuration: '25s' }} />
        </div>

        {/* Floating AI feature badges */}
        <div className="absolute top-[18%] right-[6%] pointer-events-none hidden lg:block" style={parallaxStyle(-8)}>
          <div className="glass-pill px-4 py-2 text-xs font-medium flex items-center gap-2 animate-float" style={{ animationDelay: '0.3s' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[--secondary] animate-pulse" />
            AI-Powered Recommendations
          </div>
        </div>
        <div className="absolute top-[40%] left-[3%] pointer-events-none hidden lg:block" style={parallaxStyle(-12)}>
          <div className="glass-pill px-4 py-2 text-xs font-medium flex items-center gap-2 animate-float" style={{ animationDelay: '1.5s' }}>
              <InfinityLoopIcon size={12} />
              Personalized Product Discovery
          </div>
        </div>
        <div className="absolute top-[55%] right-[3%] pointer-events-none hidden lg:block" style={parallaxStyle(-10)}>
          <div className="glass-pill px-4 py-2 text-xs font-medium flex items-center gap-2 animate-float" style={{ animationDelay: '0.9s' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[--primary] animate-pulse" />
            Real-time Personalization
          </div>
        </div>
        <div className="absolute bottom-[15%] left-[40%] pointer-events-none hidden lg:block" style={parallaxStyle(-6)}>
          <div className="glass-pill px-4 py-2 text-xs font-medium flex items-center gap-2 animate-float" style={{ animationDelay: '2s' }}>
            SVD + Deep Learning + Content
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 text-xs font-medium text-[--primary] mb-6"
              >
              <InfinityLoopIcon size={12} />
              AI 2.0 — Hybrid Recommendation Engine
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-space text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
              >
                <span className="text-gradient">COGNICART</span>
                <br />
                <span className="text-gradient-primary">Intelligence Behind<br />Every Purchase</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-[--muted] mt-5 text-base sm:text-lg md:text-xl max-w-lg leading-relaxed"
              >
                Experience shopping that understands you. Our AI learns your preferences and delivers hyper-personalized recommendations tailored to your taste.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap gap-3 sm:gap-4 mt-8"
              >
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5">
                      Go to Dashboard
                      <ArrowRightIcon size={16} />
                    </Link>
                    <Link href="/ai-shopper" className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5">
                      <InfinityLoopIcon size={16} />
                      My AI Shopper
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/register" className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5">
                      Start Shopping Free
                      <ArrowRightIcon size={16} />
                    </Link>
                    <Link href="#ai-showcase" className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5">
                      Explore AI Features
                    </Link>
                    <Link href="/login" className="btn-ghost text-sm sm:text-base px-4 sm:px-6">
                      Sign In
                    </Link>
                  </>
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8 text-xs sm:text-sm text-[--muted]"
              >
                <span className="flex items-center gap-1.5">
                  <UserIcon size={14} />
                  AI-Powered Shopping
                </span>
                <span className="flex items-center gap-1.5">
                  <StarIcon size={14} className="text-yellow-400" />
                  Secure and Encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldIcon size={14} />
                  Real-time Recommendations
                </span>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0.9, 0.4, 1] }}
              className="relative"
              style={parallaxStyle(5)}
            >
              <div className="relative">
                <div className="h-[24rem] sm:h-[28rem] lg:h-[32rem] rounded-2xl glass overflow-hidden glow-primary">
                  <ThreeHero />
                </div>
                <div className="absolute bottom-4 left-4 glass px-3.5 py-2 rounded-lg text-xs font-medium backdrop-blur-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[--secondary] animate-pulse" />
                  Hybrid AI Engine &middot; Live
                </div>
                <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-xl flex items-center gap-1.5">
                  <InfinityLoopIcon size={12} />
                  AI Powered
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Section 2: Trending Products ─── */}
      <section className="relative py-24 sm:py-28 px-4 sm:px-6 neural-grid">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 text-xs font-medium text-[--accent] mb-4">
              <FireIcon size={12} />
              Trending Today
            </span>
            <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mt-3">
              Most popular products right now
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={staggerItem}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card rounded-2xl overflow-hidden group cursor-default relative hover:shadow-2xl hover:shadow-[--primary]/10 hover:border-[--primary]/30 transition-all duration-500"
              >
                <div className="relative overflow-hidden aspect-square bg-[--surface]">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-3 left-3 z-10">
                    <span className="glass-pill px-2 py-1 text-[10px] font-bold bg-[--accent]/90 text-black shadow-lg">{p.discount}% OFF</span>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <span className="glass-pill px-2 py-1 text-[10px] font-bold bg-gradient-to-r from-[--primary] to-[--secondary] text-black shadow-lg">{p.match}% Match</span>
                  </div>
                  <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <div className="flex gap-2 w-full">
                      <button className="flex-1 glass-pill px-3 py-2 text-[11px] font-semibold text-white bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg rounded-lg">Add to Cart</button>
                      <button className="glass-pill p-2 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg rounded-lg"><EyeIcon size={14} /></button>
                      <button className="glass-pill p-2 text-white bg-white/10 backdrop-blur-md hover:bg-red-500/30 transition-all shadow-lg rounded-lg"><HeartIcon size={14} /></button>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-[--muted] font-medium">{p.category}</span>
                  </div>
                  <h3 className="font-space text-sm sm:text-base font-bold truncate leading-tight">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-bold text-gradient-primary">₹{p.price.toLocaleString('en-US')}</span>
                    <span className="text-xs text-[--muted] line-through">₹{p.original.toLocaleString('en-US')}</span>
                    <span className="text-xs font-semibold text-green-400 bg-green-500/15 px-2 py-0.5 rounded-full">-{p.discount}%</span>
                  </div>
                  <StarRating rating={p.rating} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 3: AI Recommendation Showcase ─── */}
      <section id="ai-showcase" className="relative py-24 sm:py-28 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-16 sm:mb-20"
          >
            <span className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 text-xs font-medium text-[--primary] mb-4">
              <InfinityLoopIcon size={12} />
              How It Works
            </span>
            <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mt-3">
              How CogniCart Personalizes Shopping
            </h2>
          </motion.div>

          {/* 4-Step Flow */}
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-20 sm:mb-24">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[--primary]/40 via-[--secondary]/40 to-[--primary]/40" style={{ width: '75%' }} />
            {steps.map((step, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={staggerItem}
                className="text-center relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[--primary]/10 to-[--secondary]/10 border border-[--glass-border] flex items-center justify-center mx-auto mb-4 text-[--primary] group-hover:from-[--primary]/20 group-hover:to-[--secondary]/20 transition-all duration-300">
                  {step.icon}
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[--primary]/20 border border-[--primary]/30 flex items-center justify-center text-[10px] font-bold text-[--primary]">
                  {i + 1}
                </div>
                <h3 className="font-space text-base font-semibold mt-4 mb-1.5">{step.title}</h3>
                <p className="text-xs text-[--muted] leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Three Engines */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient-primary">
              Three Engines. One Intelligence.
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5 mb-16">
            {[
              { icon: <TargetIcon />, title: 'Collaborative Filtering (SVD)', desc: 'Learns from user interactions to match products', color: 'from-blue-500/20 to-purple-500/20' },
              { icon: <InfinityLoopIcon size={16} />, title: 'Deep Neural Network', desc: 'Understands complex preference patterns', color: 'from-purple-500/20 to-pink-500/20' },
              { icon: <CheckIcon />, title: 'Content-Based TF-IDF', desc: 'Matches product attributes to your taste', color: 'from-cyan-500/20 to-teal-500/20' },
            ].map((engine, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={staggerItem}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="glass-card group cursor-default text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${engine.color} flex items-center justify-center mx-auto text-[--primary] group-hover:scale-110 transition-transform duration-300`}>
                  {engine.icon}
                </div>
                <h3 className="font-space text-base font-semibold mt-4">{engine.title}</h3>
                <p className="text-xs text-[--muted] mt-1.5 leading-relaxed">{engine.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* AI Match Score Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-lg mx-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[--muted]">AI Match Score</span>
              <span className="text-sm font-bold text-gradient-primary">96% Match</span>
            </div>
            <div className="h-2 rounded-full bg-[--glass-bg] overflow-hidden border border-[--glass-border]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '96%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5, ease: [0.2, 0.9, 0.4, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-[--primary] to-[--secondary]"
              />
            </div>
            <p className="text-[10px] text-[--muted] mt-2 text-center">Based on your browsing history and preferences</p>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 4: Why CogniCart ─── */}
      <section className="relative py-24 sm:py-28 px-4 sm:px-6 mesh-bg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 text-xs font-medium text-blue-400 mb-4">
              <InfinityLoopIcon size={12} />
              AI-Powered Shopping Engine
            </span>
            <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mt-3">
              Why CogniCart
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={staggerItem}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="glass-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[--primary]/10 flex items-center justify-center text-[--primary] ring-1 ring-[--primary]/20">
                    {b.icon}
                  </div>
                </div>
                <h3 className="text-sm font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-[--muted] leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 5: Premium Membership CTA ─── */}
      <section className="relative py-24 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl holographic p-1"
          >
            <div className="rounded-[calc(1.5rem-1px)] glass-strong px-6 sm:px-12 lg:px-16 py-12 sm:py-16 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 text-xs font-medium text-[--primary] mb-4">
                  <RocketIcon size={12} />
                  Premium
                </div>
                <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-gradient-primary">
                  Join CogniCart Prime
                </h2>
                <p className="text-[--muted] mt-3 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                  Unlock the ultimate shopping experience
                </p>
                <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-12 max-w-4xl mx-auto">
                  <div className="glass-card text-center !p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[--primary]/10 to-[--secondary]/10 flex items-center justify-center mx-auto text-[--primary]">
                      <TruckIcon size={20} />
                    </div>
                    <h3 className="font-space text-sm font-semibold mt-3">Free &amp; Fast Delivery</h3>
                    <p className="text-xs text-[--muted] mt-1.5">Free shipping on all orders, guaranteed 2-day delivery</p>
                  </div>
                  <div className="glass-card text-center !p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[--primary]/10 to-[--secondary]/10 flex items-center justify-center mx-auto text-[--primary]">
                      <GiftIcon size={20} />
                    </div>
                    <h3 className="font-space text-sm font-semibold mt-3">Exclusive AI Deals</h3>
                    <p className="text-xs text-[--muted] mt-1.5">Member-only discounts tailored to your preferences</p>
                  </div>
                  <div className="glass-card text-center !p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[--primary]/10 to-[--secondary]/10 flex items-center justify-center mx-auto text-[--primary]">
                      <DiamondIcon size={20} />
                    </div>
                    <h3 className="font-space text-sm font-semibold mt-3">Early Access</h3>
                    <p className="text-xs text-[--muted] mt-1.5">Get first dibs on flash sales and new arrivals</p>
                  </div>
                </div>
                <div className="mt-10">
                  <Link href="/register" className="btn-primary text-base px-10 py-3.5">
                    Start Your Free Trial
                    <ArrowRightIcon size={16} />
                  </Link>
                  <p className="text-xs text-[--muted] mt-3">7 days free, then ₹999/month</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

    </>
  );
}
