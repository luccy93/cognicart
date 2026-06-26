'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CreditCardIcon, PlusIcon, CheckIcon, TrashIcon, StarIcon, ArrowLeftIcon, RefreshIcon, ShieldIcon } from '@/components/ui/emoji-icons';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const fallbackCards = [
  { id: 'c1', brand: 'Visa', last4: '4242', name: 'John Doe', expiry: '12/28', isDefault: true, color: 'from-blue-600 to-blue-800' },
  { id: 'c2', brand: 'Mastercard', last4: '5678', name: 'John Doe', expiry: '09/27', isDefault: false, color: 'from-orange-500 to-red-500' },
  { id: 'c3', brand: 'Amex', last4: '3456', name: 'John Doe', expiry: '03/29', isDefault: false, color: 'from-blue-400 to-indigo-500' },
];

const fallbackRefunds = [
  { id: 'r1', order: '#ORD-7838', amount: 329, status: 'completed', date: 'Dec 12, 2025', reason: 'Damaged in transit' },
  { id: 'r2', order: '#ORD-7835', amount: 199, status: 'processing', date: 'Dec 10, 2025', reason: 'Wrong item received' },
  { id: 'r3', order: '#ORD-7832', amount: 79, status: 'completed', date: 'Dec 5, 2025', reason: 'Changed mind' },
];

const fallbackTransactions = [
  { id: 'tx1', order: '#ORD-7842', amount: 418.87, date: 'Dec 15, 2025', status: 'completed', method: 'Visa **** 4242' },
  { id: 'tx2', order: '#ORD-7841', amount: 1411.87, date: 'Dec 10, 2025', status: 'completed', method: 'Mastercard **** 5678' },
  { id: 'tx3', order: '#ORD-7840', amount: 522.86, date: 'Dec 5, 2025', status: 'completed', method: 'Visa **** 4242' },
  { id: 'tx4', order: '#ORD-7839', amount: 365.28, date: 'Nov 28, 2025', status: 'refunded', method: 'Amex **** 3456' },
];

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'cards' | 'transactions' | 'refunds'>('cards');
  const [cards, setCards] = useState(fallbackCards);
  const [transactions, setTransactions] = useState(fallbackTransactions);
  const [refunds, setRefunds] = useState(fallbackRefunds);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState({ cards: true, transactions: true, refunds: true });
  const [newCard, setNewCard] = useState({ cardNumber: '', name: '', expiry: '', cvc: '' });
  const [addingCard, setAddingCard] = useState(false);

  useEffect(() => {
    fetchCards();
    fetchTransactions();
    fetchRefunds();
  }, []);

  const fetchCards = async () => {
    try {
      const { data } = await api.get('/payments/saved-cards');
      if (data && data.length) setCards(data);
    } catch {
      // fallback to mock data
    } finally {
      setLoading(prev => ({ ...prev, cards: false }));
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/payments/transactions');
      if (data && data.length) setTransactions(data);
    } catch {
      // fallback to mock data
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  const fetchRefunds = async () => {
    try {
      const { data } = await api.get('/payments/refunds');
      if (data && data.length) setRefunds(data);
    } catch {
      // fallback to mock data
    } finally {
      setLoading(prev => ({ ...prev, refunds: false }));
    }
  };

  const setDefault = async (id: string) => {
    try {
      await api.put(`/payments/saved-cards/${id}/default`);
      setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
      toast.success('Default card updated');
    } catch {
      toast.error('Failed to update default card');
    }
  };

  const deleteCard = async (id: string) => {
    try {
      await api.delete(`/payments/saved-cards/${id}`);
      setCards(prev => prev.filter(c => c.id !== id));
      toast.success('Card removed');
    } catch {
      toast.error('Failed to remove card');
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCard(true);
    try {
      await api.post('/payments/saved-cards', {
        card_number: newCard.cardNumber.replace(/\s/g, ''),
        cardholder_name: newCard.name,
        expiry_date: newCard.expiry,
        cvc: newCard.cvc,
      });
      toast.success('Card added successfully');
      setShowAdd(false);
      setNewCard({ cardNumber: '', name: '', expiry: '', cvc: '' });
      fetchCards();
    } catch {
      toast.error('Failed to add card');
    } finally {
      setAddingCard(false);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">PAYMENTS</span>
          </div>
          <Link href="/dashboard" className="text-xs text-[--muted] hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold font-space">Payment Methods</h1><p className="text-xs text-[--muted] mt-1">Manage your saved cards and view transaction history</p></div>
          {activeTab === 'cards' && !loading.cards && <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}><PlusIcon size={14} /> Add Card</Button>}
        </motion.div>

        <div className="flex gap-2 mb-6">
          {(['cards', 'transactions', 'refunds'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? 'bg-gradient-to-r from-[--primary] to-[--secondary] text-black' : 'glass text-[--muted] hover:text-white'}`}>
              {tab === 'cards' ? 'Saved Cards' : tab === 'transactions' ? 'Transactions' : 'Refunds'}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              <form onSubmit={handleAddCard} className="glass-card rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold">Add New Card</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      className="glass-input text-sm"
                      placeholder="Card Number"
                      value={newCard.cardNumber}
                      onChange={e => setNewCard(prev => ({ ...prev, cardNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <input
                    className="glass-input text-sm"
                    placeholder="Name on Card"
                    value={newCard.name}
                    onChange={e => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="glass-input text-sm"
                      placeholder="MM/YY"
                      value={newCard.expiry}
                      onChange={e => setNewCard(prev => ({ ...prev, expiry: e.target.value }))}
                      required
                    />
                    <input
                      className="glass-input text-sm"
                      placeholder="CVC"
                      value={newCard.cvc}
                      onChange={e => setNewCard(prev => ({ ...prev, cvc: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button variant="primary" size="sm" type="submit" disabled={addingCard}>
                    {addingCard ? <RefreshIcon size={12} className="animate-spin" /> : null}
                    {addingCard ? 'Saving...' : 'Save Card'}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'cards' && (
          loading.cards ? (
            <div className="flex items-center justify-center py-16">
              <RefreshIcon size={20} className="text-[--muted] animate-spin" />
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              {cards.map((card, i) => (
                <motion.div key={card.id} variants={itemVariants} className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${card.color} relative overflow-hidden`}>
                  <div className="absolute top-4 right-4"><CreditCardIcon size={20} className="text-white/60" /></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-white/80 text-xs font-medium">{card.brand}</span>
                      {card.isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white">Default</span>}
                    </div>
                    <p className="text-lg tracking-widest text-white/90 font-mono">**** **** **** {card.last4}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div><p className="text-[10px] text-white/60">Cardholder</p><p className="text-xs text-white/90">{card.name}</p></div>
                      <div><p className="text-[10px] text-white/60">Expires</p><p className="text-xs text-white/90">{card.expiry}</p></div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {!card.isDefault && <Button variant="ghost" size="sm" className="text-white/80 hover:text-white" onClick={() => setDefault(card.id)}><StarIcon size={10} /> Set Default</Button>}
                      <Button variant="ghost" size="sm" className="text-red-300 hover:text-red-200" onClick={() => deleteCard(card.id)}><TrashIcon size={10} /> Remove</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        )}

        {activeTab === 'transactions' && (
          loading.transactions ? (
            <div className="flex items-center justify-center py-16">
              <RefreshIcon size={20} className="text-[--muted] animate-spin" />
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-white/5 text-[--muted]">
                    <th className="text-left p-4 font-medium">Order</th><th className="text-left p-4 font-medium">Date</th><th className="text-left p-4 font-medium">Amount</th><th className="text-left p-4 font-medium">Method</th><th className="text-left p-4 font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {transactions.map((tx, i) => (
                      <motion.tr key={tx.id} variants={itemVariants} transition={{ delay: i * 0.03 }} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-medium">{tx.order}</td>
                        <td className="p-4 text-[--muted]">{tx.date}</td>
                        <td className="p-4">${tx.amount.toFixed(2)}</td>
                        <td className="p-4 text-[--muted]">{tx.method}</td>
                        <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tx.status === 'completed' ? 'bg-[--secondary]/15 text-[--secondary] border border-[--secondary]/20' : 'bg-yellow-400/15 text-yellow-400 border border-yellow-400/20'}`}>{tx.status}</span></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )
        )}

        {activeTab === 'refunds' && (
          loading.refunds ? (
            <div className="flex items-center justify-center py-16">
              <RefreshIcon size={20} className="text-[--muted] animate-spin" />
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
              {refunds.map((ref, i) => (
                <motion.div key={ref.id} variants={itemVariants} className="glass-card rounded-xl p-4 flex items-center justify-between">
                  <div><p className="text-sm font-medium">{ref.order}</p><p className="text-xs text-[--muted]">{ref.reason} · {ref.date}</p></div>
                  <div className="text-right"><p className="text-sm font-bold text-[--secondary]">${ref.amount.toFixed(2)}</p><span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${ref.status === 'completed' ? 'bg-[--secondary]/15 text-[--secondary] border-[--secondary]/20' : 'bg-yellow-400/15 text-yellow-400 border-yellow-400/20'}`}>{ref.status}</span></div>
                </motion.div>
              ))}
            </motion.div>
          )
        )}
      </main>
    </div>
  );
}
