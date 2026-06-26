import React from 'react'
import { motion } from 'framer-motion'
import { wishlistItems } from '../data/mock'

export default function WishlistPreview() {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Wishlist Preview</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[--highlight]/15 text-[--highlight] border border-[--highlight]/20">{wishlistItems.length} items</span>
        </div>
        <button className="text-xs text-[--secondary] hover:underline">View All</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {wishlistItems.slice(0, 4).map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ x: 4 }}
            className="glass rounded-lg p-3 flex items-center gap-3 group"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{item.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-white">${item.price}</span>
                <span className="text-[10px] text-[--muted] line-through">${item.originalPrice}</span>
              </div>
              {item.priceDrop && (
                <div className="text-[10px] text-[--secondary] mt-0.5">📉 Price dropped!</div>
              )}
            </div>
            <button className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">🛒</button>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
