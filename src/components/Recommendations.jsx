import React from 'react'
import { recommendations } from '../data/mock'
import { motion } from 'framer-motion'

export default function Recommendations() {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Recommended For You</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[--primary]/15 text-[--primary] border border-[--primary]/20">AI Powered</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-[--muted]">Based on your recent activity</div>
          <button className="text-xs text-[--secondary] hover:underline">View All</button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {recommendations.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="min-w-[250px] glass rounded-xl p-3 card-3d group flex-shrink-0"
          >
            <div className="h-36 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 mb-3 relative">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {item.badge && (
                <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-[--highlight] text-black font-medium">{item.badge}</span>
              )}
              <div className="absolute top-2 right-2 glass px-2 py-0.5 rounded text-[10px] font-medium text-[--secondary]">
                {item.match}% Match
              </div>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{item.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-white">${item.price}</span>
                  <span className="text-[10px] text-[--muted] line-through">${item.originalPrice}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[11px] text-yellow-400">{'★'.repeat(Math.round(Number(item.rating)))}</span>
                  <span className="text-[10px] text-[--muted]">({item.reviews})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-3 py-2 rounded-lg bg-[--primary] text-black font-medium text-xs hover:bg-[--primary]/90 transition-colors"
              >
                Add to Cart
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/6 transition-colors"
              >
                <span className="text-sm">♡</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/6 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
