import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { flashDeals } from '../data/mock'

function CountdownTimer({ endsIn }) {
  const [time, setTime] = useState(endsIn)
  useEffect(() => {
    const timer = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(timer)
  }, [endsIn])

  const h = Math.floor(time / 3600)
  const m = Math.floor((time % 3600) / 60)
  const s = time % 60

  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      <span className="glass px-1.5 py-0.5 rounded font-bold">{String(h).padStart(2, '0')}</span>
      <span className="text-[--muted]">:</span>
      <span className="glass px-1.5 py-0.5 rounded font-bold">{String(m).padStart(2, '0')}</span>
      <span className="text-[--muted]">:</span>
      <span className="glass px-1.5 py-0.5 rounded font-bold">{String(s).padStart(2, '0')}</span>
    </div>
  )
}

export default function FlashDeals() {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">⚡ Flash Deals</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[--highlight]/20 text-[--highlight] border border-[--highlight]/30 animate-pulse">Limited Time</span>
        </div>
        <button className="text-xs text-[--secondary] hover:underline">View All Deals</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {flashDeals.map((deal, i) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="glass rounded-xl p-4 card-3d group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[--highlight]/10 rounded-bl-full" />
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 flex-shrink-0">
                <img src={deal.image} alt={deal.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{deal.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-white">${deal.price}</span>
                  <span className="text-xs text-[--muted] line-through">${deal.originalPrice}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[--highlight]/20 text-[--highlight] font-bold">-{deal.discount}%</span>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[--muted]">Stock: {deal.stock}/{deal.totalStock}</span>
                <span className="text-[--muted]">Ends in:</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/6 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(deal.stock / deal.totalStock) * 100}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[--highlight] to-[#ff8a58]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[--muted]">{deal.stock} remaining</span>
                <CountdownTimer endsIn={deal.endsIn} />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-[--highlight] to-[#ff8a58] text-black font-medium text-xs"
            >
              Grab Deal
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
