import React from 'react'
import { motion } from 'framer-motion'
import { notifications } from '../data/mock'

export default function NotificationCenter() {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Notification Center</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[--highlight] text-black font-bold">
            {notifications.filter(n => !n.read).length} new
          </span>
        </div>
        <button className="text-xs text-[--secondary] hover:underline">Mark All Read</button>
      </div>

      <div className="glass rounded-xl p-4 space-y-2">
        {notifications.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${!n.read ? 'bg-[--primary]/8 border border-[--primary]/10' : 'hover:bg-white/4'
              }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${!n.read ? 'bg-[--primary]/15' : 'bg-white/6'
              }`}>
              {n.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{n.title}</span>
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[--primary]" />}
              </div>
              <div className="text-[11px] text-[--muted] mt-0.5">{n.message}</div>
              <div className="text-[10px] text-[--muted] mt-1">{n.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
