'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { CheckIcon, ClockIcon, EmailIcon, MapIcon, PhoneIcon, PinIcon } from '@/components/ui/emoji-icons';

const infoCards = [
  { icon: <EmailIcon size={14} />, title: 'Email Us', detail: 'support@cognicart.ai', sub: 'We reply within 2 hours' },
  { icon: <PhoneIcon size={14} />, title: 'Call Us', detail: '+1 (555) 123-4567', sub: 'Mon-Fri 9AM-6PM EST' },
  { icon: <PinIcon size={14} />, title: 'Address', detail: '548 AI Innovation Drive', sub: 'San Francisco, CA 94105' },
  { icon: <ClockIcon size={14} />, title: 'Support Hours', detail: '24/7 AI Chat Support', sub: 'Human agents: 9AM-9PM EST' },
];

const faqs = [
  { q: 'How do I reset my password?', a: 'Go to the login page and click "Forgot Password". Enter your registered email and we will send you a reset link. For security, links expire after 30 minutes.' },
  { q: 'Can I change my email address?', a: 'Yes, go to Settings > Account > Email. You will need to verify the new email before the change takes effect.' },
  { q: 'How do I delete my account?', a: 'Navigate to Settings > Account > Delete Account. This action is irreversible and permanently removes your data from our systems.' },
  { q: 'Is my payment information secure?', a: 'Absolutely. We use enterprise-grade 256-bit encryption and are PCI-DSS compliant. Your payment data is never stored on our servers.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

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
        <section className="max-w-7xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <span className="text-xs px-3 py-1 rounded-full bg-[--primary]/15 text-[--primary] border border-[--primary]/20">Get in Touch</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-6 leading-tight">
              We'd Love to{' '}
              <span className="bg-gradient-to-r from-[--primary] to-[--secondary] bg-clip-text text-transparent">Hear From You</span>
            </h1>
            <p className="text-[--muted] mt-4 text-lg leading-relaxed">
              Have a question about our AI recommendation engine? Need help with your account? Our team is here to help.
            </p>
          </motion.div>
        </section>

        {/* Info Cards */}
        <section className="max-w-7xl mx-auto mb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {infoCards.map((card, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
                className="glass rounded-xl p-5 card-3d"
              >
                <span className="text-2xl">{card.icon}</span>
                <h3 className="text-sm font-semibold mt-3">{card.title}</h3>
                <p className="text-xs text-white mt-1">{card.detail}</p>
                <p className="text-[10px] text-[--muted] mt-1">{card.sub}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 mb-16">
          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6">Send Us a Message</h2>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <span className="text-4xl"><CheckIcon size={14} /></span>
                  <h3 className="text-lg font-semibold mt-3">Message Sent!</h3>
                  <p className="text-sm text-[--muted] mt-1">We'll get back to you within 2 hours during business hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-[--muted] block mb-1.5">Full Name</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required
                      className="input-glass text-sm" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-xs text-[--muted] block mb-1.5">Email Address</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                      className="input-glass text-sm" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="text-xs text-[--muted] block mb-1.5">Subject</label>
                    <input type="text" name="subject" value={form.subject} onChange={handleChange} required
                      className="input-glass text-sm" placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="text-xs text-[--muted] block mb-1.5">Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                      className="input-glass text-sm resize-none" placeholder="Tell us more about your inquiry..." />
                  </div>
                  <button type="submit" className="btn-primary w-full text-sm py-3">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Map & Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Map Placeholder */}
            <div className="glass rounded-xl overflow-hidden h-64 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[--primary]/10 to-[--secondary]/5 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl"><MapIcon size={14} /></span>
                  <p className="text-sm text-[--muted] mt-2">Interactive Map Loading</p>
                  <p className="text-[10px] text-[--muted] mt-1">548 AI Innovation Drive, San Francisco, CA</p>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 glass px-3 py-1.5 rounded-md text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[--secondary] inline-block mr-1.5 animate-pulse" />
                Map integration coming soon
              </div>
            </div>

            {/* Quick Contact */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-3">Prefer Email?</h3>
              <p className="text-xs text-[--muted] mb-4">Our AI support bot is available 24/7 for instant answers.</p>
              <a href="mailto:support@cognicart.ai" className="btn-accent text-xs inline-block px-5 py-2.5">
                Email Support
              </a>
            </div>
          </motion.div>
        </div>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <p className="text-[--muted] mt-2">Quick answers to common inquiries</p>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full glass rounded-xl p-4 text-left flex items-center justify-between card-3d"
                >
                  <span className="text-sm font-medium">{faq.q}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} className="text-[--muted] shrink-0 ml-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 1 }} transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="glass rounded-b-xl px-4 pb-4 -mt-1 border-t-0">
                        <p className="text-sm text-[--muted] pt-2">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mt-6">
            <Link href="/faq" className="text-sm text-[--secondary] hover:underline">View all FAQs →</Link>
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
