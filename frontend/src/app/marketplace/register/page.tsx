'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StoreIcon, ArrowLeftIcon, CheckIcon, ShieldIcon, ChartIcon, UsersIcon } from '@/components/ui/emoji-icons';

interface SellerForm {
  storeName: string; email: string; phone: string; description: string; category: string; taxId: string; bankAccount: string; agreeTerms: boolean;
}

export default function RegisterSellerPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SellerForm>({ storeName: '', email: '', phone: '', description: '', category: 'electronics', taxId: '', bankAccount: '', agreeTerms: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof SellerForm, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-3xl p-12 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center mx-auto mb-5">
            <CheckIcon size={24} className="text-black" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Registration Submitted!</h2>
          <p className="text-sm text-[--muted] mb-4">We&apos;ll review your application and get back to you within 24-48 hours.</p>
          <Link href="/marketplace"><Button variant="primary">Back to Marketplace</Button></Link>
        </motion.div>
      </div>
    );
  }

  const fieldClass = "glass-input text-sm";

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">BECOME A SELLER</span>
          </div>
          <Link href="/marketplace" className="text-xs text-[--muted] hover:text-white flex items-center gap-1"><ArrowLeftIcon size={12} /> Back</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center mx-auto mb-3">
            <StoreIcon size={20} className="text-black" />
          </div>
          <h1 className="text-2xl font-bold font-space">Become a Seller</h1>
          <p className="text-xs text-[--muted] mt-1">Start your selling journey with CogniCart</p>
        </motion.div>

        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'bg-white/5 text-[--muted] border border-white/10'}`}>{s}</div>
              {s < 3 && <div className={`w-12 h-px mx-1 ${step > s ? 'bg-[--primary]' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-lg font-bold mb-4">Store Information</h2>
              <div><label className="text-xs text-[--muted] mb-1 block">Store Name *</label><input value={form.storeName} onChange={e => update('storeName', e.target.value)} className={fieldClass} placeholder="Your store name" /></div>
              <div><label className="text-xs text-[--muted] mb-1 block">Email *</label><input value={form.email} onChange={e => update('email', e.target.value)} className={fieldClass} placeholder="seller@example.com" type="email" /></div>
              <div><label className="text-xs text-[--muted] mb-1 block">Phone *</label><input value={form.phone} onChange={e => update('phone', e.target.value)} className={fieldClass} placeholder="+1 (555) 000-0000" /></div>
              <div><label className="text-xs text-[--muted] mb-1 block">Category</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} className={fieldClass}>
                  <option value="electronics" className="bg-[--surface]">Electronics</option>
                  <option value="fashion" className="bg-[--surface]">Fashion</option>
                  <option value="home" className="bg-[--surface]">Home & Garden</option>
                  <option value="sports" className="bg-[--surface]">Sports</option>
                  <option value="other" className="bg-[--surface]">Other</option>
                </select>
              </div>
              <div><label className="text-xs text-[--muted] mb-1 block">Store Description</label><textarea value={form.description} onChange={e => update('description', e.target.value)} className={`${fieldClass} h-24 resize-none`} placeholder="Tell buyers about your store..." /></div>
              <div className="flex justify-end mt-4"><Button variant="primary" size="sm" onClick={() => setStep(2)} disabled={!form.storeName || !form.email}>Continue</Button></div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-lg font-bold mb-4">Business Details</h2>
              <div><label className="text-xs text-[--muted] mb-1 block">Tax ID / Business Registration *</label><input value={form.taxId} onChange={e => update('taxId', e.target.value)} className={fieldClass} placeholder="Tax ID number" /></div>
              <div><label className="text-xs text-[--muted] mb-1 block">Bank Account for Payouts *</label><input value={form.bankAccount} onChange={e => update('bankAccount', e.target.value)} className={fieldClass} placeholder="Bank account number" /></div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <ShieldIcon size={16} className="text-[--secondary] mt-0.5 shrink-0" />
                <div><p className="text-xs font-medium">Secure & Encrypted</p><p className="text-[10px] text-[--muted] mt-0.5">Your business information is encrypted and securely stored.</p></div>
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Back</Button>
                <Button variant="primary" size="sm" onClick={() => setStep(3)} disabled={!form.taxId || !form.bankAccount}>Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-lg font-bold mb-4">Review & Submit</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-white/5"><span className="text-[--muted]">Store Name</span><span>{form.storeName}</span></div>
                <div className="flex justify-between py-2 border-b border-white/5"><span className="text-[--muted]">Email</span><span>{form.email}</span></div>
                <div className="flex justify-between py-2 border-b border-white/5"><span className="text-[--muted]">Category</span><span className="capitalize">{form.category}</span></div>
                <div className="flex justify-between py-2 border-b border-white/5"><span className="text-[--muted]">Tax ID</span><span>{form.taxId}</span></div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="terms" checked={form.agreeTerms} onChange={e => update('agreeTerms', e.target.checked)} className="rounded border-white/20 bg-white/5" />
                <label htmlFor="terms" className="text-xs text-[--muted]">I agree to the <span className="text-[--secondary] underline cursor-pointer">Terms of Service</span> and <span className="text-[--secondary] underline cursor-pointer">Seller Agreement</span></label>
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>Back</Button>
                <Button variant="primary" size="sm" onClick={handleSubmit} loading={submitting} disabled={!form.agreeTerms || submitting}>Submit Application</Button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          {[{ icon: <ShieldIcon size={16} />, label: 'Verified Badge', desc: 'Stand out with verification' },
            { icon: <ChartIcon size={16} />, label: 'Analytics', desc: 'Track your performance' },
            { icon: <UsersIcon size={16} />, label: 'Growing Marketplace', desc: 'Reach new customers' }].map((ben, i) => (
            <div key={i} className="glass rounded-xl p-4 text-center">
              <div className="text-[--secondary] mb-2 flex justify-center">{ben.icon}</div>
              <p className="text-xs font-medium">{ben.label}</p>
              <p className="text-[10px] text-[--muted] mt-0.5">{ben.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
