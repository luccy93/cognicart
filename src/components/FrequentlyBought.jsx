import React from 'react'
import { motion } from 'framer-motion'
import { bundles } from '../data/mock'

export default function FrequentlyBought() {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Frequently Bought Together</h2>
        <button className="text-xs text-[--secondary] hover:underline">View All Bundles</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bundles.map((bundle, i) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="glass rounded-xl p-4 card-3d group"
          >
            <div className="h-28 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 mb-3 relative">
              <img src={bundle.image} alt="Bundle" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-[--highlight] text-black font-bold">-{bundle.discount}%</span>
            </div>

            <div className="space-y-1 mb-3">
              {bundle.products.map((p, j) => (
                <div key={j} className="flex items-center gap-2 text-xs text-[--muted]">
                  <span className="w-1 h-1 rounded-full bg-[--primary]" />
                  <span>+ {p}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">${bundle.bundlePrice}</div>
                <div className="text-[10px] text-[--muted] line-through">${bundle.originalPrice}</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[--highlight] to-[#ff8a58] text-black font-medium text-xs"
              >
                Add Bundle
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
