'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { ShieldIcon } from '@/components/ui/emoji-icons';

const sections = [
  { title: 'Information We Collect', content: 'We collect information you provide directly, including name, email, shipping address, payment details, and preferences. We also automatically collect browsing data, device information, and interaction patterns to improve recommendations.' },
  { title: 'How We Use Your Data', content: 'Your data powers our AI recommendation engine — analyzing purchase history, browsing behavior, and preferences to personalize your shopping experience. We also use data for order processing, fraud prevention, and service improvement.' },
  { title: 'Data Sharing & Third Parties', content: 'We never sell your personal information. Data is shared only with payment processors, shipping carriers, and analytics providers necessary to operate the platform. All partners are contractually bound to protect your data.' },
  { title: 'AI & Machine Learning', content: 'Our hybrid recommendation system uses collaborative filtering, deep learning, and content-based analysis. Models are trained on anonymized aggregated data. You can opt out of personalization in Settings.' },
  { title: 'Data Retention', content: 'Account data is retained while your account is active. Deletion requests are processed within 14 days. Browsing logs are anonymized after 90 days. Transaction records are retained for 7 years per regulatory requirements.' },
  { title: 'Your Rights', content: 'You have the right to access, correct, delete, or port your data. You may restrict or object to processing, especially for AI personalization. Exercise these rights via Settings or by contacting our Data Protection Officer.' },
  { title: 'Cookies & Tracking', content: 'We use essential cookies for authentication and functionality. Optional analytics and personalization cookies can be managed in your cookie preferences. Third-party cookies are limited to payment gateways.' },
  { title: 'Security Measures', content: 'Enterprise-grade protection including 256-bit SSL encryption, PCI-DSS Level 1 compliance, tokenized payment data, regular security audits, and 24/7 threat monitoring. Your data is protected at rest and in transit.' },
  { title: 'International Transfers', content: 'Data may be processed in data centers across North America, Europe, and Asia-Pacific. We ensure adequate safeguards through Standard Contractual Clauses and Data Processing Agreements.' },
  { title: 'Updates to This Policy', content: 'We will notify you of material changes via email and platform notification. Continued use after updates constitutes acceptance. Review this policy periodically for the latest information.' },
];

export default function PrivacyPage() {
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
            <span className="text-4xl"><ShieldIcon size={14} /></span>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-6 leading-tight">
              Privacy{' '}
              <span className="bg-gradient-to-r from-[--primary] to-[--secondary] bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-[--muted] mt-4">Last updated: January 1, 2026</p>
          </motion.div>
        </section>

        <section className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8 md:p-12 mb-8">
            <p className="text-sm text-[--muted] leading-relaxed mb-4">
              At CogniCart, your privacy is paramount. This policy explains how we collect, use, and safeguard your personal information when you use our AI-powered shopping platform.
            </p>
            <p className="text-sm text-[--muted] leading-relaxed">
              By using CogniCart, you consent to the practices described in this policy. If you have questions, contact our Data Protection Officer at <span className="text-[--secondary]">privacy@cognicart.ai</span>.
            </p>
          </motion.div>

          <div className="space-y-4">
            {sections.map((section, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-xl p-6 card-3d"
              >
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[--primary]" />
                  {section.title}
                </h2>
                <p className="text-sm text-[--muted] leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>
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
