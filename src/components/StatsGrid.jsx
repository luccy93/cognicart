import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { stats } from '../data/mock'

function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1.5 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value
    const incrementTime = Math.floor(duration * 1000 / 60)
    const increment = end / 60
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(start)
    }, incrementTime)
    return () => clearInterval(timer)
  }, [value, duration])

  return <>{prefix}{typeof value === 'number' ? count.toFixed(value % 1 === 0 ? 0 : 1) : value}{suffix}</>
}

function MiniSparkline({ color = '#6C63FF' }) {
  const points = Array.from({ length: 20 }, (_, i) => ({
    x: i * 4,
    y: 12 - Math.sin(i * 0.5 + Math.random() * 0.5) * 6 + Math.random() * 4
  }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  return (
    <svg width="80" height="24" className="opacity-50">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${points[points.length - 1].x},24 L0,24 Z`} fill={`url(#grad-${color.replace('#', '')})`} />
    </svg>
  )
}

export default function StatsGrid() {
  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="glass rounded-xl p-4 card-3d group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: `${s.color}15` }}
                >
                  {s.icon}
                </div>
                <div className="text-xs text-[--muted]">{s.label}</div>
              </div>
              <span className="text-[11px] text-[--secondary] font-medium">{s.trend}</span>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div className="text-2xl font-bold text-white">
                <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <MiniSparkline color={s.color} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
