import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Bike, Car, Wrench, X } from 'lucide-react'
import { useGarageStore } from '../stores/garageStore'

const vehicleBrands = ['Yamaha', 'KTM', 'Royal Enfield', 'Hyundai', 'Honda', 'Bajaj', 'TVS', 'Maruti', 'BMW', 'Ducati']

export default function MyGarage() {
const { vehicles, addVehicle, removeVehicle } = useGarageStore()
const [showForm, setShowForm] = useState(false)
const [form, setForm] = useState({ brand: '', model: '', year: '', type: 'Bike', color: '', variant: '' })

const handleAdd = (e) => {
e.preventDefault()
if (!form.brand || !form.model) return
addVehicle({ ...form, image: `https://picsum.photos/seed/${form.brand}${form.model}/400/300` })
setForm({ brand: '', model: '', year: '', type: 'Bike', color: '', variant: '' })
setShowForm(false)
}

return (
<section className="py-16">
<div className="max-w-7xl mx-auto px-6">
<div className="flex items-end justify-between mb-8">
<div>
<h2 className="section-heading text-4xl md:text-5xl">My Garage</h2>
<p className="text-[--muted] mt-2">Your vehicles. Your gear. Perfect compatibility.</p>
</div>
<button onClick={() => setShowForm(true)} className="btn-gear px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
<Plus className="w-4 h-4" /> Add Vehicle
</button>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{vehicles.map((v, i) => (
<motion.div
key={v.id}
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: i * 0.1 }}
layout
className="glass-card rounded-xl overflow-hidden group"
>
<div className="h-40 overflow-hidden relative">
<img src={v.image} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
<div className="absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-bold glass">{v.type}</div>
<button onClick={() => removeVehicle(v.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[--danger]/20">
<Trash2 className="w-4 h-4 text-[--danger]" />
</button>
</div>
<div className="p-4">
<h3 className="font-display text-lg font-semibold">{v.brand} {v.model}</h3>
<div className="flex items-center gap-3 text-sm text-[--muted] mt-1">
<span>{v.year}</span>
<span>•</span>
<span>{v.color}</span>
{v.variant && <><span>•</span><span>{v.variant}</span></>}
</div>
<div className="flex gap-2 mt-4">
<button className="flex-1 btn-gear py-2 rounded-lg text-sm font-semibold">Shop Compatible</button>
<button className="btn-ghost px-3 py-2 rounded-lg text-sm">View</button>
</div>
</div>
</motion.div>
))}
</div>

<AnimatePresence>
{showForm && (
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
onClick={() => setShowForm(false)}
>
<motion.div
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0.9, opacity: 0 }}
className="glass-card rounded-2xl p-8 max-w-md w-full"
onClick={e => e.stopPropagation()}
>
<div className="flex items-center justify-between mb-6">
<h3 className="font-heading text-2xl">Add Vehicle</h3>
<button onClick={() => setShowForm(false)} className="p-1 hover:bg-white/5 rounded"><X className="w-5 h-5" /></button>
</div>
<form onSubmit={handleAdd} className="space-y-4">
<div className="grid grid-cols-2 gap-4">
<div>
<label className="text-xs text-[--muted] mb-1 block">Brand</label>
<select value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[--primary]">
<option value="">Select</option>
{vehicleBrands.map(b => <option key={b} value={b}>{b}</option>)}
</select>
</div>
<div>
<label className="text-xs text-[--muted] mb-1 block">Model</label>
<input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="e.g. R15 V4" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[--primary]" />
</div>
</div>
<div className="grid grid-cols-2 gap-4">
<div>
<label className="text-xs text-[--muted] mb-1 block">Year</label>
<input value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="2024" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[--primary]" />
</div>
<div>
<label className="text-xs text-[--muted] mb-1 block">Type</label>
<div className="flex gap-2">
<button type="button" onClick={() => setForm({ ...form, type: 'Bike' })} className={form.type === 'Bike' ? 'btn-gear flex-1 py-2 rounded-lg text-sm' : 'btn-ghost flex-1 py-2 rounded-lg text-sm'}>Bike</button>
<button type="button" onClick={() => setForm({ ...form, type: 'Car' })} className={form.type === 'Car' ? 'btn-gear flex-1 py-2 rounded-lg text-sm' : 'btn-ghost flex-1 py-2 rounded-lg text-sm'}>Car</button>
</div>
</div>
</div>
<div className="grid grid-cols-2 gap-4">
<div>
<label className="text-xs text-[--muted] mb-1 block">Color</label>
<input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="Racing Blue" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[--primary]" />
</div>
<div>
<label className="text-xs text-[--muted] mb-1 block">Variant</label>
<input value={form.variant} onChange={e => setForm({ ...form, variant: e.target.value })} placeholder="N Line" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[--primary]" />
</div>
</div>
<button type="submit" className="btn-gear w-full py-3 rounded-xl font-semibold mt-2">Add to Garage</button>
</form>
</motion.div>
</motion.div>
)}
</AnimatePresence>
</div>
</section>
)
}
