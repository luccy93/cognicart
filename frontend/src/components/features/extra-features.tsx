'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { featuresApi } from '@/lib/api';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';
import { BirdIcon, BookIcon, BuildingIcon, ChatIcon, EmailIcon, MoonIcon, PaletteIcon, PartyIcon, PrayIcon, SquareIcon, SunIcon, TicketIcon, TrophyIcon, WaveIcon } from '@/components/ui/emoji-icons';

export function ThemeCustomizer() {
  const [theme, setTheme] = useState('dark');
  const themes = [
    { id: 'dark', label: 'Dark Mode', icon: <MoonIcon size={14} /> },
    { id: 'light', label: 'Light Mode', icon: <SunIcon size={14} /> },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: <BuildingIcon size={14} /> },
    { id: 'minimal', label: 'Minimal', icon: <SquareIcon size={14} /> },
  ];

  const applyTheme = async (t: string) => {
    setTheme(t);
    if (t === 'dark' || t === 'light') {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(t);
      localStorage.setItem('cognicart-theme', t);
    }
    try {
      await featuresApi.updateThemePreference({ theme: t });
    } catch {}
  };

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-3"><PaletteIcon size={14} /> Theme Customization</h3>
      <div className="grid grid-cols-2 gap-2">
        {themes.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => applyTheme(t.id)}
            className={`p-3 rounded-xl text-center transition-all border ${
              theme === t.id
                ? 'bg-[--primary]/20 border-[--primary]/30'
                : 'bg-white/5 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="text-2xl mb-1">{t.icon}</div>
            <p className="text-xs font-medium">{t.label}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export function NPSSurvey({ onCompleted }: { onCompleted?: () => void }) {
  const [score, setScore] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (score === null) return;
    try {
      await featuresApi.submitNPS(score, reason);
      setSubmitted(true);
      onCompleted?.();
    } catch {}
  };

  if (submitted) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2"><PrayIcon size={14} /></div>
        <p className="text-sm font-semibold">Thank you for your feedback!</p>
        <p className="text-xs text-[--muted] mt-1">Your input helps us improve.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-1">How likely are you to recommend us?</h3>
      <p className="text-[10px] text-[--muted] mb-4">0 = Not likely, 10 = Very likely</p>
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 11 }, (_, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setScore(i)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              score === i
                ? i >= 9 ? 'bg-emerald-500 text-white' : i >= 7 ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            {i}
          </motion.button>
        ))}
      </div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What's the main reason for your score?"
        className="input-glass text-xs mb-3 resize-none h-16"
      />
      <Button variant="primary" size="sm" className="w-full" onClick={handleSubmit} disabled={score === null}>
        Submit Feedback
      </Button>
    </div>
  );
}

export function OnboardingTour({ onComplete }: { onComplete?: () => void }) {
  const steps = [
    { icon: <WaveIcon size={14} />, title: 'Welcome to CogniCart!', desc: 'Your AI-powered shopping assistant.' },
    { icon: <InfinityLoopIcon size={14} />, title: 'Smart Recommendations', desc: 'Products tailored just for you.' },
    { icon: <TrophyIcon size={14} />, title: 'Rewards & Loyalty', desc: 'Earn points, unlock tiers, get rewards.' },
    { icon: <ChatIcon size={14} />, title: 'AI Assistant', desc: 'Ask anything, anytime.' },
    { icon: <PartyIcon size={14} />, title: 'You\'re All Set!', desc: 'Start exploring your personalized store.' },
  ];
  const [step, setStep] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
      >
        <div className="text-5xl mb-4">{steps[step].icon}</div>
        <h3 className="text-lg font-bold mb-2">{steps[step].title}</h3>
        <p className="text-sm text-[--muted] mb-6">{steps[step].desc}</p>
        <div className="flex justify-center gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-[--primary]' : 'bg-white/20'}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onComplete}>Skip</Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => {
              if (step < steps.length - 1) setStep(step + 1);
              else onComplete?.();
            }}
          >
            {step < steps.length - 1 ? 'Next' : 'Get Started'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export function SupportTicketForm({ onCreated }: { onCreated?: () => void }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !message) return;
    setLoading(true);
    try {
      await featuresApi.createTicket(subject, message, priority);
      setCreated(true);
      onCreated?.();
    } catch {}
    setLoading(false);
  };

  if (created) {
    return (
      <div className="glass rounded-xl p-4 text-center">
        <div className="text-2xl mb-2"><TicketIcon size={14} /></div>
        <p className="text-sm font-medium">Ticket Created!</p>
        <p className="text-[10px] text-[--muted]">We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="input-glass text-sm" />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue..." className="input-glass text-sm resize-none h-24" />
      <div className="flex gap-2">
        {['low', 'normal', 'high'].map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={`px-3 py-1 rounded-lg text-xs capitalize ${
              priority === p ? 'bg-[--primary] text-black' : 'bg-white/5 text-[--muted]'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <Button variant="primary" size="sm" className="w-full" onClick={handleSubmit} disabled={!subject || !message || loading} loading={loading}>
        Submit Ticket
      </Button>
    </div>
  );
}

export function ReturnForm({ onCreated }: { onCreated?: () => void }) {
  const [orderId, setOrderId] = useState('');
  const [productId, setProductId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!orderId || !productId || !reason) return;
    setLoading(true);
    try {
      await featuresApi.createReturn(orderId, productId, reason);
      setOrderId(''); setProductId(''); setReason('');
      onCreated?.();
    } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Order ID" className="input-glass text-sm" />
      <input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Product ID" className="input-glass text-sm" />
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for return" className="input-glass text-sm resize-none h-20" />
      <Button variant="primary" size="sm" className="w-full" onClick={handleSubmit} disabled={!orderId || !productId || !reason || loading} loading={loading}>
        Submit Return Request
      </Button>
    </div>
  );
}

export function ShareButtons({ productId, onShare }: { productId: string; onShare?: (platform: string) => void }) {
  const platforms = [
    { id: 'whatsapp', icon: <ChatIcon size={14} />, label: 'WhatsApp', color: 'bg-green-500/20 text-green-400' },
    { id: 'facebook', icon: <BookIcon size={14} />, label: 'Facebook', color: 'bg-blue-500/20 text-blue-400' },
    { id: 'twitter', icon: <BirdIcon size={14} />, label: 'Twitter', color: 'bg-sky-500/20 text-sky-400' },
    { id: 'email', icon: <EmailIcon size={14} />, label: 'Email', color: 'bg-amber-500/20 text-amber-400' },
  ];

  return (
    <div className="flex gap-2">
      {platforms.map((p) => (
        <motion.button
          key={p.id}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onShare?.(p.id)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${p.color}`}
          title={`Share on ${p.label}`}
        >
          {p.icon}
        </motion.button>
      ))}
    </div>
  );
}
