import React from 'react'
import { motion } from 'framer-motion'
import { activityTimeline } from '../data/mock'

const typeColors = {
  view: '#6C63FF',
  wishlist: '#FF6B35',
  purchase: '#00E587',
  rating: '#FFD700',
  review: '#00E5FF',
  compare: '#FF6B9D'
}

export default function ActivityTimeline() {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Personalized Activity Timeline</h2>
        <button className="text-xs text-[--secondary] hover:underline">View All</button>
      </div>

      <div className="glass rounded-xl p-4">
        <div className="space-y-0">
          {activityTimeline.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative flex gap-3 pb-4 last:pb-0"
            >
              {i < activityTimeline.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-white/6" />
              )}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 relative z-10"
                style={{ background: `${typeColors[item.type] || '#6C63FF'}20`, border: `1px solid ${typeColors[item.type] || '#6C63FF'}30` }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="text-sm">
                  <span className="text-white font-medium">{item.action}</span>{' '}
                  <span className="text-[--muted]">{item.item}</span>
                </div>
                <div className="text-[10px] text-[--muted] mt-0.5">{item.time}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
