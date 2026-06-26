import React from 'react'
import { motion } from 'framer-motion'
import { communityHighlights } from '../data/mock'

export default function CommunityHighlights() {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Community Highlights</h2>
        <button className="text-xs text-[--secondary] hover:underline">View All</button>
      </div>

      <div className="space-y-3">
        {communityHighlights.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ x: 4 }}
            className="glass rounded-xl p-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                {item.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{item.user}</span>
                  <span className="text-[10px] text-[--muted]">on</span>
                  <span className="text-xs text-[--secondary]">{item.product}</span>
                </div>
                <div className="text-[11px] text-[--muted] mt-1 leading-relaxed">"{item.review}"</div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[11px] text-yellow-400">{'★'.repeat(item.rating)}</span>
                  <span className="text-[10px] text-[--muted]">❤️ {item.likes}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
