'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CheckIcon, CreditCardIcon, PartyIcon, PinIcon } from '@/components/ui/emoji-icons';

export function SmartCheckout() {
  const [step, setStep] = useState(0);
  const [saveInfo, setSaveInfo] = useState(true);

  const coupons = [
    { code: 'WELCOME10', discount: '10% OFF', desc: 'on orders above ₹50', expires: '2 days left' },
    { code: 'SAVE20', discount: '20% OFF', desc: 'on orders above ₹100', expires: '5 days left' },
  ];

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Smart Checkout</h3>
        <div className="flex items-center gap-1 text-xs text-[--muted]">
          <span className={step >= 0 ? 'text-[--primary]' : ''}><PinIcon size={14} /> Shipping</span>
          <span>→</span>
          <span className={step >= 1 ? 'text-[--primary]' : ''}><CreditCardIcon size={14} /> Payment</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-[--primary]' : ''}><CheckIcon size={14} /> Review</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[--primary]/10 border border-[--primary]/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] flex items-center justify-center text-black text-sm flex-shrink-0"><PartyIcon size={14} /></div>
          <div>
            <p className="text-sm font-medium">Recommended Coupon Available!</p>
            <p className="text-xs text-[--muted] mt-0.5">Use <strong className="text-[--primary]">WELCOME10</strong> to save 10% on this order</p>
          </div>
        </div>
      </div>

      {coupons.map((c, i) => (
        <motion.div
          key={c.code}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-[--primary]/30 transition-all"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold bg-gradient-to-r from-[--primary] to-[--secondary] bg-clip-text text-transparent">{c.discount}</span>
              <span className="text-[10px] text-[--muted] px-1.5 py-0.5 rounded-full bg-white/5">{c.code}</span>
            </div>
            <p className="text-xs text-[--muted] mt-0.5">{c.desc} • {c.expires}</p>
          </div>
          <Button size="sm" variant="ghost">Apply</Button>
        </motion.div>
      ))}

      <div className="flex items-center gap-3 pt-2">
        <label className="flex items-center gap-2 text-xs text-[--muted] cursor-pointer">
          <input
            type="checkbox"
            checked={saveInfo}
            onChange={e => setSaveInfo(e.target.checked)}
            className="rounded border-white/20 bg-transparent"
          />
          Save shipping address for future
        </label>
        <label className="flex items-center gap-2 text-xs text-[--muted] cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded border-white/20 bg-transparent" />
          Enable one-click checkout
        </label>
      </div>
    </div>
  );
}
