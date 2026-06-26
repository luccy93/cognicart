'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';
import { DocumentIcon, NumbersIcon, PackageIcon, TargetIcon, UsersIcon } from '@/components/ui/emoji-icons';

const team = [
  { name: 'Dr. Aris Thorne', role: 'CEO & Chief AI Scientist', bio: 'Ph.D. in Machine Learning, 15+ years in recommendation systems research at leading tech labs.', avatar: 'AT' },
  { name: 'Lena Vasquez', role: 'CTO', bio: 'Former lead engineer at major e-commerce platforms specializing in large-scale distributed ML systems.', avatar: 'LV' },
  { name: 'Marcus Chen', role: 'Head of Product', bio: 'Product visionary who built AI-driven shopping experiences used by millions worldwide.', avatar: 'MC' },
  { name: 'Priya Nair', role: 'VP of Engineering', bio: 'Expert in real-time data pipelines and deploying TensorFlow models at global scale.', avatar: 'PN' },
];

const milestones = [
  { year: '2019', title: 'The Idea', desc: 'CogniCart was conceived to bridge the gap between AI research and everyday shopping.' },
  { year: '2020', title: 'Seed & Research', desc: 'Secured seed funding and began developing the hybrid SVD + deep learning architecture.' },
  { year: '2021', title: 'MVP Launch', desc: 'Released the first prototype achieving 94% recommendation accuracy in beta testing.' },
  { year: '2022', title: 'Series A & Growth', desc: 'Scaled to 500K users and introduced content-based filtering with NLP product analysis.' },
  { year: '2023', title: 'AI 2.0', desc: 'Upgraded to real-time learning with TensorFlow serving, improving recommendation relevance.' },
  { year: '2024', title: 'Global Expansion', desc: 'Expanded to 50+ countries and launched the 3D interactive shopping experience.' },
];

const stats = [
  { label: 'AI Engines', value: '3', suffix: '', icon: <InfinityLoopIcon size={14} /> },
  { label: 'Data Sources', value: '12', suffix: '+', icon: <PackageIcon size={14} /> },
  { label: 'Tech Stack', value: 'TF', suffix: '', icon: <InfinityLoopIcon size={14} /> },
  { label: 'Avg. Session', value: '14.2', suffix: 'min', icon: '⏱️' },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref}>
      {count}{suffix}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" showTagline={false} variant="text" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[--muted] hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="btn-primary text-xs">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        {/* Hero */}
        <section className="max-w-7xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <span className="text-xs px-3 py-1 rounded-full bg-[--primary]/15 text-[--primary] border border-[--primary]/20">About Us</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-6 leading-tight">
              The AI-Powered Future of{' '}
              <span className="bg-gradient-to-r from-[--primary] to-[--secondary] bg-clip-text text-transparent">Shopping</span>
            </h1>
            <p className="text-[--muted] mt-4 text-lg leading-relaxed">
              We are a team of AI researchers, engineers, and designers on a mission to transform e-commerce through intelligent recommendation systems.
            </p>
          </motion.div>
        </section>

        {/* Mission */}
        <section className="max-w-7xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-[--muted] leading-relaxed mb-4">
                  CogniCart was founded with a single mission: to make every online purchase feel handpicked. By combining collaborative filtering, deep learning, and content-based analysis, we deliver hyper-personalized recommendations that evolve with each interaction.
                </p>
                <p className="text-[--muted] leading-relaxed">
                  Our hybrid AI engine processes behavioral data to understand not just what you buy, but why you buy it — learning from behavior patterns, preferences, and trends to surface products you'll genuinely love.
                </p>
              </div>
              <div className="glass rounded-xl p-6 text-center">
                <span className="text-5xl"><TargetIcon size={14} /></span>
                <div className="text-xl font-bold mt-4 text-gradient">Hybrid AI Engine</div>
                <div className="text-sm text-[--muted] mt-1">SVD + Deep Learning + Content-Based</div>
                <div className="mt-4 flex justify-center gap-6 text-sm">
                  <div><span className="text-[--secondary]">SVD</span> + <span className="text-[--primary]">Deep Learning</span> + <span className="text-[--accent]">Content</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="max-w-7xl mx-auto mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
                className="glass rounded-xl p-6 card-3d text-center"
              >
                <span className="text-2xl">{s.icon}</span>
                <div className="text-3xl font-bold mt-3 text-gradient">
                  <Counter target={parseInt(s.value)} suffix={s.suffix} />
                </div>
                <div className="text-sm text-[--muted] mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Technology */}
        <section className="max-w-7xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h2 className="text-3xl font-bold">Hybrid AI Recommendation Engine</h2>
            <p className="text-[--muted] mt-2 max-w-2xl mx-auto">Three layers of AI working together to understand your unique taste</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} whileHover={{ y: -4 }} className="glass rounded-xl p-6 card-3d">
              <div className="w-12 h-12 rounded-lg bg-[--primary]/15 flex items-center justify-center text-xl mb-4"><NumbersIcon size={14} /></div>
              <h3 className="text-lg font-semibold mb-2">SVD Collaborative Filtering</h3>
              <p className="text-sm text-[--muted] leading-relaxed">
                Matrix factorization using Singular Value Decomposition to discover latent relationships between users and products based on interaction history.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-1 rounded-full bg-[--primary]/10 text-[--primary] border border-[--primary]/20">TensorFlow</span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-[--primary]/10 text-[--primary] border border-[--primary]/20">GPU Optimized</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ y: -4 }} className="glass rounded-xl p-6 card-3d">
              <div className="w-12 h-12 rounded-lg bg-[--secondary]/15 flex items-center justify-center text-xl mb-4"><InfinityLoopIcon size={14} /></div>
              <h3 className="text-lg font-semibold mb-2">Deep Neural Networks</h3>
              <p className="text-sm text-[--muted] leading-relaxed">
                Multi-layer perceptron and sequence models that capture complex non-linear patterns in user behavior for next-level personalization.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-1 rounded-full bg-[--secondary]/10 text-[--secondary] border border-[--secondary]/20">LSTM</span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-[--secondary]/10 text-[--secondary] border border-[--secondary]/20">Transformers</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} whileHover={{ y: -4 }} className="glass rounded-xl p-6 card-3d">
              <div className="w-12 h-12 rounded-lg bg-[--accent]/15 flex items-center justify-center text-xl mb-4"><DocumentIcon size={14} /></div>
              <h3 className="text-lg font-semibold mb-2">Content-Based Filtering</h3>
              <p className="text-sm text-[--muted] leading-relaxed">
                NLP-powered product understanding that analyzes descriptions, categories, and attributes to find similar items based on what you love.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-1 rounded-full bg-[--accent]/10 text-[--accent] border border-[--accent]/20">NLP</span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-[--accent]/10 text-[--accent] border border-[--accent]/20">BERT</span>
              </div>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-8 glass rounded-xl p-6 text-center">
            <p className="text-sm text-[--muted]">
              Combined into a weighted ensemble model, our hybrid approach leverages the strengths of collaborative, deep learning, and content-based techniques for more relevant recommendations.
            </p>
          </motion.div>
        </section>

        {/* Timeline */}
        <section className="max-w-7xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h2 className="text-3xl font-bold">Our Journey</h2>
            <p className="text-[--muted] mt-2">From idea to industry-leading AI recommendation platform</p>
          </motion.div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-[--primary] via-[--secondary] to-transparent hidden md:block" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col md:flex-row items-start gap-4 md:gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <motion.div whileHover={{ y: -4 }} className="glass rounded-xl p-5 card-3d inline-block w-full max-w-lg">
                      <span className="text-xs font-bold text-[--secondary]">{m.year}</span>
                      <h3 className="text-lg font-semibold mt-1">{m.title}</h3>
                      <p className="text-sm text-[--muted] mt-1">{m.desc}</p>
                    </motion.div>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-[--primary] shrink-0 relative z-10 shadow-lg shadow-[--primary]/20">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="max-w-7xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <span className="text-xs px-3 py-1 rounded-full bg-[--secondary]/15 text-[--secondary] border border-[--secondary]/20">Our Team</span>
            <h2 className="text-3xl font-bold mt-4">Meet the Minds Behind CogniCart</h2>
            <p className="text-[--muted] mt-2">AI researchers and engineers building the future of personalized shopping</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }}
                className="glass rounded-xl p-6 card-3d text-center group"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-lg font-bold text-black mb-4">
                  {member.avatar}
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-xs text-[--secondary] mt-1">{member.role}</p>
                <p className="text-xs text-[--muted] mt-3 leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-10 md:p-14 text-center">
            <h2 className="text-3xl font-bold">Ready to Experience AI Shopping?</h2>
            <p className="text-[--muted] mt-3 max-w-xl mx-auto">
              Experience personalized product discovery powered by CogniCart's hybrid AI engine.
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <Link href="/register" className="btn-primary text-base px-8 py-3">Get Started Free</Link>
              <Link href="/contact" className="btn-ghost text-base px-8 py-3">Contact Us</Link>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-white/6 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[--muted]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-[8px] text-black font-bold">C</div>
            CogniCart v2.0 — Intelligence Behind Every Purchase
          </div>
          <div className="flex gap-6">
            <Link href="/about">About</Link>
            <span>Privacy</span>
            <span>Terms</span>
            <Link href="/contact">Contact</Link>
          </div>
          <div>&copy; {new Date().getFullYear()} CogniCart. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
