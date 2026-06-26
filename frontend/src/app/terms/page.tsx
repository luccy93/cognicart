'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { DocumentIcon } from '@/components/ui/emoji-icons';

const sections = [
  { title: 'Acceptance of Terms', content: 'By creating an account or using CogniCart, you agree to these Terms of Service. If you do not agree, do not use the platform. We may update these terms; continued use constitutes acceptance of changes.' },
  { title: 'Account Registration', content: 'You must provide accurate information when creating an account. You are responsible for maintaining confidentiality of your credentials. Notify us immediately of unauthorized use. One account per person.' },
  { title: 'AI Recommendations & Personalization', content: 'CogniCart uses hybrid AI (SVD, deep learning, content-based filtering) to personalize product recommendations. Recommendations are suggestions, not guarantees. You may opt out of personalization in Settings.' },
  { title: 'Orders & Payments', content: 'All orders are subject to availability and acceptance. Prices may change without notice. Payment is due at checkout. We accept major credit cards, PayPal, and select cryptocurrencies.' },
  { title: 'Shipping & Delivery', content: 'Delivery estimates are provided at checkout. We are not liable for delays caused by carriers or force majeure. Risk of loss passes to you upon delivery confirmation by carrier.' },
  { title: 'Returns & Refunds', content: 'Most items can be returned within 30 days of delivery. Items must be unused and in original packaging. Refunds are processed within 5-7 business days after receipt. AI-recommended items have a 45-day window.' },
  { title: 'Intellectual Property', content: 'The CogniCart platform, including its AI models, algorithms, and recommendation engines, is proprietary technology. You may not copy, modify, reverse-engineer, or create derivative works without written permission.' },
  { title: 'User Conduct', content: 'You agree not to manipulate recommendations, submit false reviews, use automated bots, or engage in any activity that disrupts the platform or deceives other users or our AI systems.' },
  { title: 'Limitation of Liability', content: 'CogniCart is provided "as is" without warranties. Our liability is limited to the amount paid for the specific product giving rise to a claim. We are not liable for indirect damages or AI recommendation outcomes.' },
  { title: 'Termination', content: 'We may suspend or terminate accounts for violations of these terms. You may delete your account at any time via Settings. Upon termination, your right to use the platform ceases immediately.' },
  { title: 'Dispute Resolution', content: 'Disputes are resolved through binding arbitration in San Francisco, CA, rather than court. Class action waivers apply. You may opt out of arbitration within 30 days of account creation.' },
  { title: 'Governing Law', content: 'These terms are governed by the laws of the State of California, USA. The parties submit to the exclusive jurisdiction of the courts of San Francisco County for any disputes.' },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo size="sm" showTagline={false} variant="text" /></Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[--muted] hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="btn-primary text-xs">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <section className="max-w-4xl mx-auto mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <span className="text-4xl"><DocumentIcon size={14} /></span>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-6 leading-tight">
              Terms of{' '}
              <span className="bg-gradient-to-r from-[--primary] to-[--secondary] bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-[--muted] mt-4">Last updated: January 1, 2026</p>
          </motion.div>
        </section>

        <section className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8 md:p-12 mb-8">
            <p className="text-sm text-[--muted] leading-relaxed mb-4">
              Welcome to CogniCart. These Terms of Service govern your access to and use of our AI-powered e-commerce platform, including all features, recommendations, and content.
            </p>
            <p className="text-sm text-[--muted] leading-relaxed">
              Please read these terms carefully before using CogniCart. By creating an account or accessing the platform, you agree to be bound by these terms.
            </p>
          </motion.div>

          <div className="space-y-4">
            {sections.map((section, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass rounded-xl p-6 card-3d"
              >
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[--secondary]" />
                  {i + 1}. {section.title}
                </h2>
                <p className="text-sm text-[--muted] leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="glass rounded-2xl p-8 mt-8 text-center">
            <p className="text-sm text-[--muted]">
              Questions about these terms? Contact us at <span className="text-[--secondary]">legal@cognicart.ai</span>
            </p>
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
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div>&copy; {new Date().getFullYear()} CogniCart. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
