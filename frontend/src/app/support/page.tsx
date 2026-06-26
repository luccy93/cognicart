'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HelpIcon, DocumentIcon, ChatIcon, SearchIcon, PlusIcon, ArrowRightIcon, ClockIcon, CheckCircleIcon, AlertIcon } from '@/components/ui/emoji-icons';

const tickets = [
  { id: 'TK-001', subject: 'Order not delivered yet', status: 'open', priority: 'high', date: 'Dec 15, 2025', lastUpdate: '2h ago' },
  { id: 'TK-002', subject: 'Wrong item received', status: 'in_progress', priority: 'urgent', date: 'Dec 14, 2025', lastUpdate: '1h ago' },
  { id: 'TK-003', subject: 'Refund status inquiry', status: 'resolved', priority: 'normal', date: 'Dec 10, 2025', lastUpdate: '3d ago' },
  { id: 'TK-004', subject: 'Account access issue', status: 'closed', priority: 'low', date: 'Dec 5, 2025', lastUpdate: '1w ago' },
];

const kbArticles = [
  { slug: 'return-policy', title: 'Return & Refund Policy', category: 'Orders', readTime: '3 min' },
  { slug: 'tracking-order', title: 'How to Track Your Order', category: 'Orders', readTime: '2 min' },
  { slug: 'payment-methods', title: 'Accepted Payment Methods', category: 'Payments', readTime: '2 min' },
  { slug: 'prime-benefits', title: 'Understanding Prime Benefits', category: 'Membership', readTime: '4 min' },
  { slug: 'seller-guide', title: 'Seller Onboarding Guide', category: 'Sellers', readTime: '5 min' },
];

const statusColors: Record<string, string> = {
  open: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/20',
  in_progress: 'bg-blue-400/15 text-blue-400 border-blue-400/20',
  resolved: 'bg-[--secondary]/15 text-[--secondary] border-[--secondary]/20',
  closed: 'bg-white/10 text-[--muted] border-white/10',
};

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'kb'>('tickets');
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [searchKB, setSearchKB] = useState('');

  const filteredKb = kbArticles.filter(a => a.title.toLowerCase().includes(searchKB.toLowerCase()) || a.category.toLowerCase().includes(searchKB.toLowerCase()));

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">SUPPORT</span>
          </div>
          <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-space">Support Center</h1>
            <p className="text-xs text-[--muted] mt-1">Get help with orders, accounts, and more</p>
          </div>
          {activeTab === 'tickets' && (
            <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}><PlusIcon size={14} /> New Ticket</Button>
          )}
        </motion.div>

        <div className="flex gap-2 mb-6">
          {(['tickets', 'kb'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'glass text-[--muted] hover:text-white'}`}>
              {tab === 'tickets' ? 'My Tickets' : 'Knowledge Base'}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold">Create Support Ticket</h3>
                <input value={subject} onChange={e => setSubject(e.target.value)} className="glass-input text-sm" placeholder="Subject" />
                <textarea value={message} onChange={e => setMessage(e.target.value)} className="glass-input text-sm h-24 resize-none" placeholder="Describe your issue..." />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setSubject(''); setMessage(''); }}>Cancel</Button>
                  <Button variant="primary" size="sm" disabled={!subject || !message}>Submit Ticket</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'tickets' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            {tickets.length === 0 ? (
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-12 text-center">
                <HelpIcon size={24} className="mx-auto mb-3 text-[--muted]" />
                <h3 className="text-lg font-semibold mb-1">No tickets yet</h3><p className="text-xs text-[--muted]">Create a ticket to get help</p>
              </motion.div>
            ) : (
              tickets.map((ticket, i) => (
                <motion.div key={ticket.id} variants={itemVariants} className="glass-card rounded-xl p-4 hover:bg-white/[0.04] transition-colors">
                  <Link href={`/support/tickets/${ticket.id}`} className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><h3 className="text-sm font-semibold truncate">{ticket.subject}</h3><span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColors[ticket.status] || statusColors.open}`}>{ticket.status.replace('_', ' ')}</span></div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-[--muted]">
                        <span>{ticket.id}</span><span>{ticket.date}</span><span>Priority: {ticket.priority}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0"><span className="text-[10px] text-[--muted]">{ticket.lastUpdate}</span><ArrowRightIcon size={12} className="text-[--muted]" /></div>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'kb' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="relative max-w-md">
              <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" />
              <input value={searchKB} onChange={e => setSearchKB(e.target.value)} placeholder="Search articles..." className="glass-input pl-9 text-sm" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKb.map((article, i) => (
                <Link key={article.slug} href={`/support/kb/${article.slug}`}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} className="glass-card rounded-xl p-5">
                    <DocumentIcon size={20} className="text-[--secondary] mb-2" />
                    <h3 className="text-sm font-semibold">{article.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-[--muted]">
                      <span className="px-2 py-0.5 rounded-full bg-white/5">{article.category}</span>
                      <ClockIcon size={10} /> {article.readTime} read
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
