import React from 'react'
import { motion } from 'framer-motion'
import { categories } from '../data/mock'

export default function TopCategories() {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Top Categories</h2>
        <button className="text-xs text-[--secondary] hover:underline">Browse All</button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className="glass rounded-xl p-4 card-3d group cursor-pointer text-center"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} bg-opacity-20 flex items-center justify-center text-lg mx-auto mb-2 group-hover:scale-110 transition-transform`}>
              {cat.icon}
            </div>
            <div className="text-xs font-medium">{cat.name}</div>
            <div className="text-[10px] text-[--muted] mt-0.5">{cat.count} items</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
