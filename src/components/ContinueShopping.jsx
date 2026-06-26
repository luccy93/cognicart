import React from 'react'
import { motion } from 'framer-motion'
import { recentlyViewed } from '../data/mock'

export default function ContinueShopping() {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Continue Shopping</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[--secondary]/15 text-[--secondary] border border-[--secondary]/20">Recently Viewed</span>
        </div>
        <button className="text-xs text-[--secondary] hover:underline">View History</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recentlyViewed.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass rounded-xl p-3 card-3d group"
          >
            <div className="h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 mb-2">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="text-sm font-medium truncate">{item.name}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-white">${item.price}</span>
              <span className="text-[10px] text-yellow-400">★ {item.rating}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-[--muted]">{item.lastViewed}</span>
              <button className="text-[10px] text-[--primary] hover:underline">Buy Again</button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
