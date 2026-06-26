import React from 'react'
import { motion } from 'framer-motion'
import { orderSummary } from '../data/mock'

export default function OrderSummary() {
  const items = [
    { label: 'Active Orders', value: orderSummary.active, icon: '📦', color: '#00E5FF' },
    { label: 'Delivered', value: orderSummary.delivered, icon: '✅', color: '#00E587' },
    { label: 'Pending', value: orderSummary.pending, icon: '⏳', color: '#FFD700' },
    { label: 'Cancelled', value: orderSummary.cancelled, icon: '❌', color: '#FF6B35' }
  ]

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <button className="text-xs text-[--secondary] hover:underline">View Orders</button>
      </div>

      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-lg p-3 text-center"
              style={{ background: `${item.color}08`, border: `1px solid ${item.color}15` }}
            >
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="text-xl font-bold text-white">{item.value}</div>
              <div className="text-[10px] text-[--muted] mt-0.5">{item.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/6 flex items-center justify-between text-xs">
          <span className="text-[--muted]">Total Orders</span>
          <span className="font-bold text-white">{orderSummary.total}</span>
        </div>
      </div>
    </section>
  )
}
