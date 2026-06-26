import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useUIStore } from '../stores/garageStore'
import { useCartStore } from '../stores/cartStore'
import { formatPrice } from '../lib/utils'

export default function CartDrawer() {
const { cartOpen, toggleCart } = useUIStore()
const { items, removeItem, updateQuantity, getTotal, getCount } = useCartStore()

return (
<AnimatePresence>
{cartOpen && (
<>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
onClick={toggleCart}
/>
<motion.div
initial={{ x: '100%' }}
animate={{ x: 0 }}
exit={{ x: '100%' }}
transition={{ type: 'spring', damping: 25, stiffness: 200 }}
className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[--surface] border-l border-white/5 z-50 flex flex-col"
>
<div className="flex items-center justify-between p-6 border-b border-white/5">
<div>
<h2 className="font-heading text-2xl">Your Cart</h2>
<p className="text-sm text-[--muted]">{getCount()} {getCount() === 1 ? 'item' : 'items'}</p>
</div>
<button onClick={toggleCart} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
<X className="w-5 h-5" />
</button>
</div>

<div className="flex-1 overflow-y-auto p-6 space-y-4">
{items.length === 0 ? (
<div className="text-center pt-20">
<ShoppingBag className="w-16 h-16 text-[--muted] mx-auto mb-4 opacity-30" />
<p className="text-[--muted]">Your cart is empty</p>
</div>
) : (
items.map((item) => (
<motion.div
key={item.id}
layout
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -10 }}
className="flex gap-4 glass-card rounded-xl p-3"
>
<img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
<div className="flex-1 min-w-0">
<h4 className="font-medium text-sm truncate">{item.name}</h4>
<p className="text-[--primary] font-semibold mt-1">{formatPrice(item.price)}</p>
<div className="flex items-center gap-2 mt-2">
<button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded hover:bg-white/5"><Minus className="w-3 h-3" /></button>
<span className="w-8 text-center text-sm">{item.quantity}</span>
<button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded hover:bg-white/5"><Plus className="w-3 h-3" /></button>
</div>
</div>
<button onClick={() => removeItem(item.id)} className="p-1 text-[--muted] hover:text-[--danger] transition-colors">
<Trash2 className="w-4 h-4" />
</button>
</motion.div>
))
)}
</div>

{items.length > 0 && (
<div className="border-t border-white/5 p-6 space-y-4">
<div className="flex items-center justify-between text-lg">
<span className="text-[--muted]">Total</span>
<span className="font-bold font-display text-2xl text-[--primary]">{formatPrice(getTotal())}</span>
</div>
<button className="btn-gear w-full py-3 rounded-xl text-lg font-semibold flex items-center justify-center gap-2">
Checkout <ArrowRight className="w-5 h-5" />
</button>
</div>
)}
</motion.div>
</>
)}
</AnimatePresence>
)
}
