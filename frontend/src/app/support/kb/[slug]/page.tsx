'use client';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, DocumentIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon, ClockIcon } from '@/components/ui/emoji-icons';

const articles: Record<string, { title: string; category: string; readTime: string; content: string[] }> = {
  'return-policy': {
    title: 'Return & Refund Policy', category: 'Orders', readTime: '3 min',
    content: [
      'You can return most items within 30 days of delivery for a full refund. Items must be unused and in original packaging.',
      'To initiate a return, go to your Orders page, select the item you wish to return, and click "Return Item". You will receive a return shipping label via email.',
      'Refunds are processed within 5-7 business days after we receive the returned item. The refund will be issued to your original payment method.',
      'For defective or damaged items, we cover all return shipping costs. Please contact our support team for assistance with such cases.',
      'Certain items such as personal care products, software, and digital goods are non-returnable unless defective.',
    ]
  },
  'tracking-order': {
    title: 'How to Track Your Order', category: 'Orders', readTime: '2 min',
    content: [
      'Once your order is shipped, you will receive an email with a tracking number. You can also find this in your Orders page.',
      'Click on the tracking number to see real-time updates from our shipping partners. Updates include pickup, in transit, out for delivery, and delivered statuses.',
      'If your tracking hasn\'t updated in 48 hours, please contact our support team. Weather or logistical delays may affect tracking updates.',
      'For international shipments, tracking may show limited updates until the package reaches your country\'s customs.',
    ]
  },
  'payment-methods': {
    title: 'Accepted Payment Methods', category: 'Payments', readTime: '2 min',
    content: [
      'We accept Visa, Mastercard, American Express, and Discover credit and debit cards. All transactions are encrypted and secure.',
      'We also support PayPal, Apple Pay, Google Pay, and UPI payments for faster checkout. COD is available for select locations.',
      'For Prime members, we offer "Buy Now, Pay Later" through our partner Affirm. This option is available at checkout.',
      'Your payment information is never stored on our servers. All payment processing is handled by our PCI-compliant payment partners.',
    ]
  },
  'prime-benefits': {
    title: 'Understanding Prime Benefits', category: 'Membership', readTime: '4 min',
    content: [
      'CogniCart Prime is our premium membership program offering exclusive benefits for a monthly or annual fee.',
      'Benefits include free 2-day shipping on all orders, early access to flash sales, extended warranty on all products, and 24/7 priority support.',
      'Prime members also get exclusive member-only prices, free returns on all eligible items, and double loyalty points on every purchase.',
      'You can upgrade, downgrade, or cancel your Prime membership at any time from your account settings.',
    ]
  },
  'seller-guide': {
    title: 'Seller Onboarding Guide', category: 'Sellers', readTime: '5 min',
    content: [
      'Welcome to CogniCart Marketplace! This guide will help you get started as a seller on our platform.',
      'First, complete your seller registration with your store name, business details, and bank account for payouts.',
      'Once approved, you can list your products using our seller dashboard. Add high-quality images and detailed descriptions for best results.',
      'Set competitive prices and manage your inventory through the dashboard. You can also run promotions and discounts.',
      'Payouts are processed bi-weekly. You can track your earnings and sales analytics in real-time from your seller dashboard.',
    ]
  },
};

export default function KBArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = articles[slug] || { title: 'Article Not Found', category: '', readTime: '', content: ['This article could not be found. Please browse the knowledge base for other articles.'] };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">KNOWLEDGE BASE</span>
          </div>
          <Link href="/support" className="text-xs text-[--muted] hover:text-white flex items-center gap-1"><ArrowLeftIcon size={12} /> Back</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-[10px] text-[--muted] mb-3">
            <Link href="/support" className="hover:text-white">Support</Link>
            <span>/</span>
            <span>{article.category}</span>
            <span>/</span>
            <span className="text-[--secondary]">{article.title}</span>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <DocumentIcon size={24} className="text-[--secondary] mb-3" />
            <h1 className="text-2xl font-bold font-space mb-2">{article.title}</h1>
            <div className="flex items-center gap-2 text-[10px] text-[--muted] mb-6">
              <span className="px-2 py-0.5 rounded-full bg-white/5">{article.category}</span>
              <ClockIcon size={10} /> {article.readTime} read
            </div>

            <div className="space-y-4">
              {article.content.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-[--text-secondary]">{paragraph}</p>
              ))}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[--muted]">Was this helpful?</span>
                <Button variant="ghost" size="sm"><ThumbsUpIcon size={12} /></Button>
                <Button variant="ghost" size="sm"><ThumbsDownIcon size={12} /></Button>
              </div>
              <Button variant="ghost" size="sm"><ShareIcon size={12} /> Share</Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
