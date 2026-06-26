'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';
import { cn } from '@/lib/utils';
import { useChatStore, ChatMessage, ChatProductItem, ProactiveNotification } from '@/store/chatStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

const SUGGESTIONS = [
  { label: 'Recommend products', icon: 'sparkles' },
  { label: 'Track my order', icon: 'package' },
  { label: 'Find products under $50', icon: 'wallet' },
  { label: 'Show today\'s deals', icon: 'fire' },
  { label: 'Compare products', icon: 'scale' },
  { label: 'Apply best coupon', icon: 'ticket' },
  { label: 'Show trending products', icon: 'trending' },
  { label: 'Return policy', icon: 'document' },
  { label: 'Track this product', icon: 'target' },
  { label: 'Find gift for...', icon: 'gift' },
  { label: 'Auto-buy when price drops', icon: 'zap' },
  { label: 'My AI Shopper', icon: 'sparkles' },
];

const LANGUAGES: { code: 'en' | 'ta' | 'hi' | 'te'; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
];

const icons: Record<string, React.ReactNode> = {
  sparkles: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>,
  package: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>,
  wallet: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  fire: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  scale: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>,
  ticket: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-2z"/><path d="M15 12v-3a3 3 0 0 1 6 0v3"/><path d="M9 12v-3a3 3 0 0 0-6 0v3"/></svg>,
  trending: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  document: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  target: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  gift: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="7" x2="12" y2="2"/><path d="M12 2a3 3 0 0 0-3 3v2"/><path d="M12 2a3 3 0 0 1 3 3v2"/></svg>,
  zap: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>,
};

/* ───── markdown renderer ───── */

function renderMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  lines.forEach((line, idx) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        nodes.push(
          <pre key={`code-${idx}`} className="bg-black/40 rounded-lg p-3 my-2 overflow-x-auto text-[11px] font-mono leading-relaxed border border-white/[0.06]">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        codeLang = '';
      } else {
        codeLang = line.slice(3).trim();
      }
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (line.trim() === '') {
      nodes.push(<br key={`br-${idx}`} />);
      return;
    }

    if (line.startsWith('### ')) {
      nodes.push(<h3 key={idx} className="text-sm font-bold mt-3 mb-1">{renderInline(line.slice(4))}</h3>);
      return;
    }
    if (line.startsWith('## ')) {
      nodes.push(<h2 key={idx} className="text-base font-bold mt-3 mb-1">{renderInline(line.slice(3))}</h2>);
      return;
    }
    if (line.startsWith('# ')) {
      nodes.push(<h1 key={idx} className="text-lg font-bold mt-2 mb-1">{renderInline(line.slice(2))}</h1>);
      return;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      nodes.push(
        <div key={idx} className="flex items-start gap-2 my-0.5">
          <span className="text-muted mt-0.5">•</span>
          <span className="flex-1">{renderInline(line.slice(2))}</span>
        </div>
      );
      return;
    }

    if (/^\d+[.)] /.test(line)) {
      nodes.push(
        <div key={idx} className="flex items-start gap-2 my-0.5">
          <span className="text-muted mt-0.5 min-w-[1.2em]">{line.match(/^\d+[.)]/)?.[0]}</span>
          <span className="flex-1">{renderInline(line.replace(/^\d+[.)] /, ''))}</span>
        </div>
      );
      return;
    }

    if (line.startsWith('---') || line.startsWith('***')) {
      nodes.push(<hr key={idx} className="my-2 border-white/[0.06]" />);
      return;
    }

    nodes.push(<p key={idx} className="my-0.5">{renderInline(line)}</p>);
  });

  if (inCodeBlock && codeBuffer.length > 0) {
    nodes.push(
      <pre key="code-unclosed" className="bg-black/40 rounded-lg p-3 my-2 overflow-x-auto text-[11px] font-mono leading-relaxed border border-white/[0.06]">
        <code>{codeBuffer.join('\n')}</code>
      </pre>
    );
  }

  return nodes;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);

    if (!boldMatch && !codeMatch && !linkMatch) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    const matches: { index: number; length: number; render: React.ReactNode }[] = [];

    if (boldMatch) {
      matches.push({ index: boldMatch.index!, length: boldMatch[0].length, render: <strong key={key++} className="font-semibold text-white/90">{boldMatch[1]}</strong> });
    }
    if (codeMatch) {
      matches.push({ index: codeMatch.index!, length: codeMatch[0].length, render: <code key={key++} className="bg-black/30 rounded px-1 py-0.5 text-[11px] font-mono text-primary">{codeMatch[1]}</code> });
    }
    if (linkMatch) {
      matches.push({ index: linkMatch.index!, length: linkMatch[0].length, render: <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-secondary transition-colors">{linkMatch[1]}</a> });
    }

    matches.sort((a, b) => a.index - b.index);

    const first = matches[0];
    if (first && first.index > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, first.index)}</span>);
    }
    if (first) {
      parts.push(first.render);
      remaining = remaining.slice(first.index + first.length);
    }
  }

  return <>{parts}</>;
}

/* ───── sub-components ───── */

function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center h-5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-secondary animate-bounce"
          style={{
            animation: `bounce 0.8s infinite ${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

interface ProductCardItem {
  id: string;
  slug?: string;
  name: string;
  price: number | string;
  image?: string;
  discount?: number;
  rating?: number;
  match_score?: number;
}

function ProductCard({ product, onClose }: { product: ProductCardItem; onClose?: () => void }) {
  const router = useRouter();
  const { addItem } = useCartStore();

  return (
    <div className="flex gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/5 group glass-hover">
      <div
        className="w-14 h-14 rounded-lg bg-surface flex-shrink-0 overflow-hidden cursor-pointer"
        onClick={() => { router.push(`/products/${product.slug || product.id}`); onClose?.(); }}
      >
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate cursor-pointer hover:text-secondary transition-colors"
          onClick={() => { router.push(`/products/${product.slug || product.id}`); onClose?.(); }}
        >
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-bold text-gradient-primary">
            ${typeof product.price === 'number' ? product.price?.toFixed(2) : product.price}
          </span>
          {product.discount && (
            <span className="text-[10px] text-emerald-400">-{product.discount}%</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span className="text-[10px] text-muted">{product.rating || '?'}</span>
          </div>
          {product.match_score && (
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-full glass-pill',
              product.match_score >= 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              product.match_score >= 70 ? 'bg-primary/10 text-primary border-primary/20' :
              'bg-amber-500/10 text-amber-400 border-amber-500/20'
            )}>
              {product.match_score}% match
            </span>
          )}
        </div>
        <div className="flex gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); addItem(product.id, 1); }}
            className="text-[9px] px-2 py-0.5 rounded-full glass-pill bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 hover-glow-primary transition-all"
          >
            Add to cart
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/products/${product.slug || product.id}`); onClose?.(); }}
            className="text-[9px] px-2 py-0.5 rounded-full glass-pill bg-white/10 text-muted hover:text-white transition-all"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageActions({ message, onSuggestionClick }: { message: ChatMessage; onSuggestionClick: (s: string) => void }) {
  const { rateMessage } = useChatStore();
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex items-center gap-2 mt-1 px-1 flex-wrap', isUser && 'flex-row-reverse')}>
      <span className="text-[9px] text-muted">
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>

      {!isUser && message.rating === null && (
        <div className="flex items-center gap-1">
          <button onClick={() => rateMessage(message.id, 'helpful')}
            className="text-[10px] text-muted hover:text-emerald-400 transition-all p-0.5 rounded hover:bg-emerald-500/10" title="Helpful">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          </button>
          <button onClick={() => rateMessage(message.id, 'not_helpful')}
            className="text-[10px] text-muted hover:text-red-400 transition-all p-0.5 rounded hover:bg-red-500/10" title="Not helpful">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
          </button>
        </div>
      )}
      {!isUser && message.rating === 'helpful' && (
        <span className="text-[9px] text-emerald-400 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          Helpful
        </span>
      )}
      {!isUser && message.rating === 'not_helpful' && (
        <span className="text-[9px] text-red-400 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
          Not helpful
        </span>
      )}

      {!isUser && message.suggestions?.slice(0, 3).map((s, i) => (
        <button key={i} onClick={() => onSuggestionClick(s)}
          className="text-[10px] px-2 py-0.5 rounded-full glass-pill bg-white/[0.04] text-muted border border-white/[0.06] hover:text-white hover:border-primary/30 hover-glow-primary transition-all">
          {s}
        </button>
      ))}
    </div>
  );
}

function MessageBubble({ message, onSuggestionClick }: { message: ChatMessage; onSuggestionClick: (s: string) => void }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
    >
      <div className={cn(
        'max-w-[92%] rounded-2xl p-3 text-sm',
        isUser
          ? 'bg-gradient-to-r from-primary to-secondary text-black rounded-tr-sm shadow-lg shadow-primary/20'
          : 'glass rounded-tl-sm'
      )}>
        {message.type === 'carousel' && message.products?.length ? (
          <div className="space-y-2">
            <div className="text-xs font-medium mb-1 leading-relaxed">{renderMarkdown(message.content)}</div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {message.products.map((p: ChatProductItem, i: number) => (
                <ProductCard key={p.id || i} product={p} />
              ))}
            </div>
          </div>
        ) : message.type === 'comparison' && message.products?.length === 2 ? (
          <div className="space-y-2">
            <div className="text-xs font-medium leading-relaxed">{renderMarkdown(message.content)}</div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {message.products.map((p: ChatProductItem, i: number) => (
                <div key={i} className="p-2 rounded-lg glass border border-white/5 text-center">
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  <p className="text-xs font-bold text-gradient-primary mt-1">${p.price?.toFixed(2)}</p>
                  <p className="text-[10px] text-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="inline text-yellow-400 mr-0.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {p.rating} | {p.reviews || 0} reviews
                  </p>
                  {p.brand && <p className="text-[9px] text-muted mt-0.5">{p.brand}</p>}
                  <div className="flex gap-1 mt-2 justify-center">
                    <button
                      onClick={() => window.location.href = `/products/${p.slug || p.id}`}
                      className="text-[9px] px-2 py-0.5 rounded glass-pill bg-primary/20 text-primary border border-primary/30 hover-glow-primary transition-all"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs leading-relaxed">{renderMarkdown(message.content)}</div>
        )}
      </div>

      <MessageActions message={message} onSuggestionClick={onSuggestionClick} />
    </motion.div>
  );
}

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useChatStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 z-10 glass-strong flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold font-space">Settings</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <p className="text-xs font-medium text-muted mb-2">Language</p>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => updateSettings({ language: lang.code })}
                className={cn(
                  'p-2.5 rounded-xl border text-xs text-left transition-all glass',
                  settings.language === lang.code
                    ? 'border-primary/50 bg-primary/10 text-white glow-primary'
                    : 'border-white/[0.06] text-muted hover:text-white hover:border-white/20'
                )}
              >
                <span className="block text-sm font-medium">{lang.native}</span>
                <span className="block text-[10px] opacity-60 mt-0.5">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted mb-2">Voice</p>
          <label className="flex items-center justify-between p-3 rounded-xl glass border border-white/[0.06] cursor-pointer">
            <div>
              <p className="text-xs font-medium">Voice Output</p>
              <p className="text-[10px] text-muted">AI reads responses aloud</p>
            </div>
            <div
              onClick={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
              className={cn(
                'w-10 h-5 rounded-full transition-colors relative cursor-pointer',
                settings.voiceEnabled ? 'bg-primary' : 'bg-white/20'
              )}
            >
              <div className={cn(
                'w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform duration-300',
                settings.voiceEnabled ? 'translate-x-5' : 'translate-x-0.5'
              )} />
            </div>
          </label>
        </div>

        <div className="p-3 rounded-xl glass border border-white/[0.06] text-[10px] text-muted space-y-1">
          <p className="flex items-center gap-1 font-medium text-white/80">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Tips:
          </p>
          <p>Ask for product recommendations with budget</p>
          <p>Compare any two products</p>
          <p>Track orders with order ID</p>
          <p>Get personalized picks based on your history</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ───── main component ───── */

export function AIShoppingAssistant() {
  const {
    isOpen, messages, isTyping, unreadCount, hasOpened, showSettings,
    toggle, open, addMessage, setTyping, setSessionId, clearSession,
    toggleSettings, settings, addNotification,
  } = useChatStore();
  const { connected, send, subscribe } = useWebSocket();
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !showSettings) inputRef.current?.focus();
  }, [isOpen, showSettings]);

  useEffect(() => {
    const unsub = subscribe('chat_response', (data) => {
      const d = data.data as { content?: string; type?: 'text' | 'carousel' | 'comparison'; products?: ChatProductItem[]; suggestions?: string[] };
      const msg: ChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'assistant',
        content: d.content || '',
        type: d.type || 'text',
        products: d.products,
        suggestions: d.suggestions,
        timestamp: Date.now(),
        rating: null,
      };
      addMessage(msg);
      setTyping(false);

      if (settings.voiceEnabled && d.type === 'text') {
        const clean = (d.content || '').replace(/\*\*/g, '').replace(/[•●]/g, '');
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
      }
    });
    return () => unsub();
  }, [subscribe, addMessage, setTyping, settings.voiceEnabled]);

  useEffect(() => {
    const unsub = subscribe('typing', (data) => {
      setTyping(data.status === true);
    });
    return () => unsub();
  }, [subscribe, setTyping]);

  useEffect(() => {
    const unsub = subscribe('notification', (data) => {
      const d = data.data as { type?: 'price_drop' | 'back_in_stock' | 'flash_sale' | 'new_recommendation'; title?: string; message?: string; product_id?: string; product_name?: string };
      if (d?.type && d?.title) {
        const n: ProactiveNotification = {
          id: `notif-${Date.now()}`,
          type: d.type,
          title: d.title,
          message: d.message || '',
          productId: d.product_id,
          productName: d.product_name,
          timestamp: Date.now(),
          read: false,
        };
        addNotification(n);
      }
    });
    return () => unsub();
  }, [subscribe, addNotification]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInput('');
    setShowSuggestions(false);

    setTyping(true);

    const sendViaRest = () => {
      import('@/lib/api').then(({ chatApi }) => {
        chatApi.sendMessage(text, useChatStore.getState().sessionId || undefined)
          .then((res: { data: { response: string; type?: string; session_id: string; products?: ChatProductItem[]; suggestions?: string[] } }) => {
            const msg: ChatMessage = {
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: res.data.response || '',
              type: (res.data.type as 'text' | 'carousel' | 'comparison') || 'text',
              products: res.data.products,
              suggestions: res.data.suggestions,
              timestamp: Date.now(),
              rating: null,
            };
            addMessage(msg);
            if (res.data.session_id) {
              setSessionId(res.data.session_id);
            }
            setTyping(false);
          })
          .catch(() => {
            addMessage({
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: "I'm having trouble connecting. Please try again.",
              timestamp: Date.now(),
              rating: null,
            });
            setTyping(false);
          });
      });
    };

    const sendViaWS = () => {
      send({
        event: 'chat_message',
        content: text,
        session_id: useChatStore.getState().sessionId || undefined,
        language: settings.language,
      });
    };

    if (connected) {
      sendViaWS();
    } else {
      sendViaRest();
    }
  }, [input, isTyping, connected, addMessage, send, setTyping, setSessionId, settings.language]);

  const router = useRouter();

  const handleSuggestionClick = useCallback((label: string) => {
    if (label === 'My AI Shopper') {
      toggle();
      setTimeout(() => router.push('/ai-shopper'), 300);
      return;
    }
    if (label === 'Track this product') {
      setInput('I want to track a product and get notified when the price drops');
    } else if (label === 'Find gift for...') {
      setInput('Help me find a gift for...');
    } else if (label === 'Auto-buy when price drops') {
      setInput('Set up auto-buy for a product when the price drops to my target');
    } else {
      setInput(label);
    }
    setShowSuggestions(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [router, toggle]);

  const handleVoiceToggle = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = settings.language === 'ta' ? 'ta-IN' :
                       settings.language === 'hi' ? 'hi-IN' :
                       settings.language === 'te' ? 'te-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: Event) => {
      const ev = event as unknown as { results: Array<Array<{ transcript: string }>> };
      const transcript = ev.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setTimeout(() => handleSend(), 300);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    setIsListening(true);
    recognition.start();
  }, [isListening, settings.language, handleSend]);

  const handleFabMouseMove = useCallback((e: React.MouseEvent) => {
    const btn = fabRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const dist = Math.sqrt(x * x + y * y);
    if (dist < 100) {
      const strength = Math.max(0, 1 - dist / 100);
      btn.style.transform = `translate(${x * strength * 0.3}px, ${y * strength * 0.3}px)`;
    }
  }, []);

  const handleFabMouseLeave = useCallback(() => {
    const btn = fabRef.current;
    if (btn) btn.style.transform = '';
  }, []);

  const suggestions = messages.length <= 1 ? SUGGESTIONS : [];

  return (
    <>
      <motion.button
        ref={fabRef as any}
        onMouseMove={handleFabMouseMove}
        onMouseLeave={handleFabMouseLeave}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={toggle}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full glass-pill flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          boxShadow: isOpen
            ? '0 0 0 0 rgba(108,99,255,0)'
            : '0 0 20px 4px rgba(108,99,255,0.3), 0 0 60px 12px rgba(108,99,255,0.1)',
        }}
      >
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[--accent] text-white text-[9px] font-bold flex items-center justify-center shadow-lg"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <InfinityLoopIcon size={24} variant="simplified" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[85vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-white/[0.08] glass-strong"
          >
            <AnimatePresence>
              {showSettings && <SettingsPanel onClose={toggleSettings} />}
            </AnimatePresence>

            <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-white/[0.02] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 relative overflow-hidden">
                    <InfinityLoopIcon size={20} variant="simplified" />
                    <span className="absolute inset-0 rounded-full animate-pulse-glow opacity-30" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent)' }} />
                  </div>
                  <span className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0A0A0F]',
                    connected ? 'bg-emerald-400' : 'bg-red-400'
                  )} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-space">CogniCart AI</h3>
                  <p className="text-[10px] text-muted flex items-center gap-1">
                    <span className={cn('w-1.5 h-1.5 rounded-full inline-block', connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400')} />
                    {connected ? 'Online' : 'Connecting...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={toggleSettings}
                  className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all" title="Settings">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
                <button onClick={() => clearSession()}
                  className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all" title="New conversation">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                </button>
                <button onClick={toggle}
                  className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all" title="Close">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center px-6"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 relative">
                    <InfinityLoopIcon size={28} variant="simplified" />
                    <motion.div
                      className="absolute inset-0 rounded-full border border-primary/30"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                  <h3 className="text-sm font-semibold mb-1 font-space">How can I help you shop smarter?</h3>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Ask me about products, orders, deals, or anything about CogniCart!
                  </p>
                </motion.div>
              )}

              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} onSuggestionClick={handleSuggestionClick} />
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="glass rounded-2xl rounded-tl-sm p-3 border border-white/[0.04]">
                    <TypingDots />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-2 overflow-hidden flex-shrink-0"
                >
                  <p className="text-[10px] text-muted mb-2 font-medium">Quick actions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((s, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.9, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={() => handleSuggestionClick(s.label)}
                        className="text-[10px] px-2.5 py-1.5 rounded-full glass-pill border border-white/[0.08] text-muted hover:text-white hover:border-primary/30 hover:bg-white/[0.03] hover-glow-primary transition-all whitespace-nowrap flex items-center gap-1"
                      >
                        {icons[s.icon]}
                        {s.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-3 pt-2 border-t border-white/[0.06] bg-white/[0.01] flex-shrink-0">
              <div className="relative flex items-center gap-2">
                <button
                  onClick={handleVoiceToggle}
                  disabled={!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)}
                  className={cn(
                    'p-2 rounded-xl transition-all flex-shrink-0',
                    isListening
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse-glow'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  )}
                  title={isListening ? 'Listening...' : 'Voice input'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                </button>

                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isListening ? 'Listening...' : 'Ask me anything...'}
                  className="flex-1 glass-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-primary/40 transition-all"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-black font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95 flex items-center justify-center flex-shrink-0"
                >
                  {isTyping ? (
                    <div className="w-4 h-4 border-2 border-black/40 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  )}
                </button>
              </div>
              <p className="text-[9px] text-muted mt-1.5 text-center">
                CogniCart AI — {settings.language.toUpperCase()} · {connected ? 'Connected' : 'Offline'}
                {settings.voiceEnabled && ' · Voice ON'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
