import React from 'react'
import { motion } from 'framer-motion'
import { trendingProducts } from '../data/mock'

export default function TrendingProducts() {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Trending Products</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[--highlight]/15 text-[--highlight] border border-[--highlight]/20">🔥 Popular</span>
        </div>
        <button className="text-xs text-[--secondary] hover:underline">View All</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {trendingProducts.slice(0, 4).map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass rounded-xl p-3 card-3d group"
          >
            <div className="h-28 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 mb-2 relative">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[--highlight]/90 text-black font-medium">{item.badge}</span>
            </div>
            <div className="text-sm font-medium truncate">{item.name}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-white">${item.price}</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-yellow-400">★</span>
                <span className="text-[10px] text-[--muted]">{item.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-[--muted]">
              <span>🔥 {item.popularityScore}%</span>
              <span>♥ {item.likes >= 1000 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
