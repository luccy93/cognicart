'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ChatIcon, ClockIcon, UserIcon, CheckCircleIcon, PaperclipIcon } from '@/components/ui/emoji-icons';

const ticketData = {
  id: 'TK-001', subject: 'Order not delivered yet', status: 'open', priority: 'high', date: 'Dec 15, 2025',
  description: 'My order #ORD-7842 was supposed to be delivered on Dec 14 but it still shows as "In Transit". The tracking number is 1Z999AA10123456784. Can you please look into this?',
  messages: [
    { id: 'm1', from: 'You', avatar: 'Y', content: 'My order #ORD-7842 was supposed to be delivered on Dec 14 but it still shows as "In Transit". Can you help?', time: 'Dec 15, 2025 10:30 AM', isAgent: false },
    { id: 'm2', from: 'Sarah (Support)', avatar: 'S', content: 'Hi! Thank you for reaching out. Let me look into this for you. I can see your package is with the carrier and there was a minor delay due to weather conditions. Expected delivery is now Dec 17.', time: 'Dec 15, 2025 11:15 AM', isAgent: true },
    { id: 'm3', from: 'You', avatar: 'Y', content: 'Thank you for the update. Will I be compensated for the delay?', time: 'Dec 15, 2025 11:45 AM', isAgent: false },
    { id: 'm4', from: 'Sarah (Support)', avatar: 'S', content: 'Absolutely! I\'ve applied a $10 credit to your account for the inconvenience. You should see it reflected immediately. Let me know if there\'s anything else I can help with!', time: 'Dec 15, 2025 12:00 PM', isAgent: true },
  ],
};

export default function TicketDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setNewMessage('');
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">TICKET #{id}</span>
          </div>
          <Link href="/support" className="text-xs text-[--muted] hover:text-white flex items-center gap-1"><ArrowLeftIcon size={12} /> Back to Support</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold">{ticketData.subject}</h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${ticketData.status === 'open' ? 'bg-yellow-400/15 text-yellow-400 border-yellow-400/20' : ''}`}>{ticketData.status}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-[--muted]">
                <span>{ticketData.id}</span><span>{ticketData.date}</span><span>Priority: {ticketData.priority}</span>
              </div>
              <p className="text-xs text-[--muted] mt-3">{ticketData.description}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="ghost" size="sm">Resolve</Button>
              <Button variant="danger" size="sm">Close</Button>
            </div>
          </div>
        </motion.div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2"><ChatIcon size={14} /> Conversation</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {ticketData.messages.map((msg, i) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-3 ${msg.isAgent ? '' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${msg.isAgent ? 'bg-[--secondary]/20 text-[--secondary]' : 'bg-[--primary]/20 text-[--primary]'}`}>
                  {msg.avatar}
                </div>
                <div className={`flex-1 max-w-[80%] ${msg.isAgent ? '' : 'text-right'}`}>
                  <div className={`rounded-xl p-3 text-xs ${msg.isAgent ? 'glass' : 'bg-gradient-to-r from-[--primary]/20 to-[--secondary]/20'}`}>
                    <p className="font-medium text-[10px] mb-1">{msg.from}</p>
                    <p className="text-[--text]">{msg.content}</p>
                  </div>
                  <p className="text-[10px] text-[--muted] mt-1">{msg.time}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-white/5">
            <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your message..." className="glass-input text-sm flex-1" onKeyDown={e => e.key === 'Enter' && sendMessage()} />
            <Button variant="primary" size="sm" onClick={sendMessage} disabled={!newMessage.trim()}><ChatIcon size={14} /> Send</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
