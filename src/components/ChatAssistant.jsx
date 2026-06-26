import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles, Zap } from 'lucide-react'
import { useUIStore } from '../stores/garageStore'

const mockResponses = [
{ keywords: ['hello', 'hi', 'hey', 'yo'], reply: 'Hey there! GearSkin AI here. Ready to find your perfect riding gear? Ask me anything!' },
{ keywords: ['recommend', 'suggest', 'what should', 'best'], reply: 'Based on your garage and browsing history, I\'d recommend checking out our new line of carbon fiber helmets — 97% match for your profile!' },
{ keywords: ['helmet', 'helmet'], reply: 'We have 48 helmets in stock. Top pick: AGV K3 SV — rated 4.8★ with 98% rider satisfaction. Compatible with your Yamaha R15 V4!' },
{ keywords: ['exhaust', 'exhaust system', 'muffler'], reply: 'Performance exhausts transform your ride completely. The Akrapovic line is our #1 seller for KTM Duke owners. Want me to check compatibility?' },
{ keywords: ['jacket', 'riding jacket'], reply: 'Alpinestars GP Plus is the top-rated riding jacket this month. Pro tip: measure your chest and arm length for the perfect fit.' },
{ keywords: ['compatible', 'fit', 'garage', 'vehicle'], reply: 'Your garage has a Yamaha R15 V4 (2024), KTM Duke 390 (2023), and Hyundai i20 (2022). Most products in our catalog are compatible with these. Use the compatibility filter!' },
{ keywords: ['price', 'cost', 'budget', 'cheap', 'expensive', 'affordable'], reply: 'Our gear ranges from $29 to $499. The sweet spot for quality riding gear is $80-$200. Want me to show you the best value picks?' },
{ keywords: ['order', 'shipping', 'delivery', 'track'], reply: 'Most orders ship within 24 hours. Free shipping on orders over $100. Express delivery (2-day) available at checkout for $12.' },
{ keywords: ['return', 'refund', 'exchange', 'replace'], reply: '30-day hassle-free returns on all products. We\'ll send you a prepaid label — just pack it up and drop it off. Refunds processed within 5 business days.' },
{ keywords: ['discount', 'sale', 'deal', 'offer', 'coupon'], reply: 'We\'ve got active flash sales right now with up to 40% off select exhaust systems and helmets. Check the Flash Sale section on the homepage!' },
{ keywords: ['garage', 'my garage', 'vehicle'], reply: 'Your Garage is looking good! You have 3 vehicles saved. Adding more helps us give you even better product recommendations and compatibility checks.' },
{ keywords: ['trending', 'popular', 'hot', 'trending now'], reply: 'Trending right now: carbon fiber accessories, LED lighting kits, and quick shifters are flying off the shelves. The community loves performance upgrades this season!' },
{ keywords: ['rating', 'review', 'top rated'], reply: 'Our top-rated products: 1) AGV K3 SV Helmet (4.8★), 2) Alpinestars GP Plus Jacket (4.7★), 3) Akrapovic Exhaust (4.9★). All verified rider reviews!' },
]

function getReply(msg) {
const lower = msg.toLowerCase()
for (const entry of mockResponses) {
if (entry.keywords.some(k => lower.includes(k))) return entry.reply
}
const fallbacks = [
'Great question! Based on your riding style and garage, I think you\'d love our new smart helmet collection. Check the New Arrivals section!',
'I\'m analyzing thousands of products to find your perfect match... How about exploring our Performance Parts category? Riders with similar taste love it!',
'Excellent! Let me connect you with the best gear. Are you looking for something specific like helmets, exhausts, or riding jackets?',
'Our AI recommends checking out the Limited Edition section — exclusive drops that sell out fast. Don\'t miss the carbon fiber series!',
]
return fallbacks[Math.floor(Math.random() * fallbacks.length)]
}

const suggestions = ['Find me a helmet', 'Best exhaust for Duke 390', 'Check compatibility', 'Show me deals', 'Recommend a jacket']

export default function ChatAssistant() {
const { chatOpen, toggleChat } = useUIStore()
const [messages, setMessages] = useState([
{ role: 'ai', text: 'Hey! I\'m GearSkin AI. Ask me about products, compatibility, or anything riding-related! 🏍️' }
])
const [input, setInput] = useState('')
const [typing, setTyping] = useState(false)
const bottomRef = useRef(null)

useEffect(() => {
if (chatOpen) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
}, [messages, chatOpen])

function handleSend(msg) {
const text = (msg || input).trim()
if (!text) return
setInput('')
setMessages(prev => [...prev, { role: 'user', text }])
setTyping(true)

setTimeout(() => {
const reply = getReply(text)
setMessages(prev => [...prev, { role: 'ai', text: reply }])
setTyping(false)
}, 800 + Math.random() * 600)
}

return (
<>
<motion.button
whileHover={{ scale: 1.08 }}
whileTap={{ scale: 0.95 }}
onClick={toggleChat}
className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-gradient-to-br from-[--primary] to-[#FF8C42] text-black flex items-center justify-center shadow-lg z-50 neon-glow"
>
{chatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
</motion.button>

<AnimatePresence>
{chatOpen && (
<motion.div
initial={{ opacity: 0, y: 20, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: 20, scale: 0.95 }}
transition={{ type: 'spring', damping: 25, stiffness: 300 }}
className="fixed right-6 bottom-24 w-[380px] h-[560px] glass-card rounded-2xl flex flex-col z-50 overflow-hidden"
>
<div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-gradient-to-r from-[--primary]/5 to-[--secondary]/5">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[--primary] to-[#FF8C42] flex items-center justify-center text-black font-bold"><Zap className="w-5 h-5" /></div>
<div>
<div className="font-display text-base font-semibold">GearSkin AI</div>
<div className="flex items-center gap-1 text-xs text-[--secondary]">
<Sparkles className="w-3 h-3" /> Online • Ready to help
</div>
</div>
</div>
<button onClick={toggleChat} className="p-1.5 rounded-lg hover:bg-white/5 text-[--muted]"><X className="w-4 h-4" /></button>
</div>

<div className="flex-1 overflow-y-auto p-4 space-y-3">
{messages.map((msg, i) => (
<motion.div
key={i}
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.2 }}
className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
>
<div className={`max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
msg.role === 'user'
? 'bg-gradient-to-r from-[--primary] to-[#FF8C42] text-black rounded-br-sm'
: 'bg-white/5 text-white rounded-bl-sm'
}`}>
{msg.text}
</div>
</motion.div>
))}
{typing && (
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
<div className="bg-white/5 px-4 py-3 rounded-xl rounded-bl-sm">
<div className="flex gap-1">
{[0, 1, 2].map(i => <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} className="w-2 h-2 rounded-full bg-[--primary]" />)}
</div>
</div>
</motion.div>
)}
<div ref={bottomRef} />
</div>

{messages.length === 1 && (
<div className="px-4 pb-2">
<p className="text-[10px] text-[--muted] mb-2 uppercase tracking-wider">Suggestions</p>
<div className="flex flex-wrap gap-2">
{suggestions.map((s) => (
<button key={s} onClick={() => handleSend(s)} className="text-xs px-3 py-1.5 rounded-full glass hover:border-[--primary]/30 transition-colors">{s}</button>
))}
</div>
</div>
)}

<form onSubmit={e => { e.preventDefault(); handleSend() }} className="p-4 border-t border-white/5 flex gap-2">
<input
value={input}
onChange={e => setInput(e.target.value)}
placeholder="Ask about products..."
className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[--primary] transition-colors placeholder:text-[--muted]"
/>
<button
type="submit"
className="p-2.5 rounded-xl bg-gradient-to-r from-[--primary] to-[#FF8C42] text-black"
>
<Send className="w-4 h-4" />
</button>
</form>
</motion.div>
)}
</AnimatePresence>
</>
)
}
