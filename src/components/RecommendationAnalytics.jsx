import React from 'react'
import { motion } from 'framer-motion'
import { recommendationAnalytics } from '../data/mock'

function MiniChart({ data, color = '#6C63FF' }) {
  const max = Math.max(...data.map(d => d.accuracy))
  const min = Math.min(...data.map(d => d.accuracy))
  const range = max - min || 1
  const w = 200
  const h = 40
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((d.accuracy - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        fill="url(#chartGrad)"
        points={`0,${h} ${points} ${w},${h}`}
      />
    </svg>
  )
}

export default function RecommendationAnalytics() {
  const metrics = [
    { label: 'Precision@K', value: recommendationAnalytics.precisionAtK, color: '#6C63FF', suffix: '' },
    { label: 'Recall@K', value: recommendationAnalytics.recallAtK, color: '#00E5FF', suffix: '' },
    { label: 'User Satisfaction', value: recommendationAnalytics.userSatisfaction, color: '#FF6B35', suffix: '%' },
    { label: 'AI Accuracy', value: recommendationAnalytics.accuracy, color: '#00E587', suffix: '%' }
  ]

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Recommendation Analytics</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[--primary]/15 text-[--primary] border border-[--primary]/20">Real-time</span>
        </div>
      </div>

      <div className="glass rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-lg p-3"
              style={{ background: `${m.color}08`, border: `1px solid ${m.color}15` }}
            >
              <div className="text-[10px] text-[--muted]">{m.label}</div>
              <div className="text-lg font-bold text-white">
                {typeof m.value === 'number' ? m.value.toFixed(m.value % 1 === 0 ? 0 : 2) : m.value}{m.suffix}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-white/6 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[--muted]">Accuracy Trend (12 months)</span>
            <span className="text-[10px] text-[--secondary]">+2.4% vs last month</span>
          </div>
          <MiniChart data={recommendationAnalytics.history} color="#6C63FF" />
        </div>
      </div>
    </section>
  )
}
