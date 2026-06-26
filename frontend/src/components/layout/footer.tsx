import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';

export function Footer() {
  return (
    <footer className="border-t border-[--glass-border] py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 block">
              <Logo size="md" showTagline={false} />
            </Link>
            <p className="text-xs text-[--muted] leading-relaxed max-w-xs">
              Intelligence Behind Every Purchase. A hybrid AI recommendation platform built for the future of e-commerce.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[--text-secondary] mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link href="/dashboard" className="text-xs text-[--muted] hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/products" className="text-xs text-[--muted] hover:text-white transition-colors">Products</Link></li>
              <li><Link href="/deals" className="text-xs text-[--muted] hover:text-white transition-colors">Deals</Link></li>
              <li><Link href="/prime" className="text-xs text-[--muted] hover:text-white transition-colors">Prime</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[--text-secondary] mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-xs text-[--muted] hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-xs text-[--muted] hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="text-xs text-[--muted] hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/community" className="text-xs text-[--muted] hover:text-white transition-colors">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[--text-secondary] mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li><Link href="/support" className="text-xs text-[--muted] hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/orders" className="text-xs text-[--muted] hover:text-white transition-colors">Orders</Link></li>
              <li><Link href="/delivery" className="text-xs text-[--muted] hover:text-white transition-colors">Delivery</Link></li>
              <li><Link href="/contact" className="text-xs text-[--muted] hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[--glass-border] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[--muted]">
          <span>&copy; {new Date().getFullYear()} CogniCart, Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <InfinityLoopIcon size={12} />
              v2.0 &middot; Hybrid AI Engine
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
