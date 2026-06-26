import React from 'react'
import { motion } from 'framer-motion'
import { user, stats } from '../data/mock'

function CircularProgress({ value, size = 60, stroke = 5, color = '#6C63FF', label }) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease' }}
        />
      </svg>
      <div className="absolute flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-xs font-bold">{value}%</span>
      </div>
      {label && <span className="text-[10px] text-[--muted]">{label}</span>}
    </div>
  )
}

export default function AIInsightsPanel() {
  const aiScore = stats.find(s => s.label === 'AI Accuracy')?.value || 98.4

  return (
    <motion.aside
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4"
    >
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">AI Shopping Insights</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[--primary]/15 text-[--primary] border border-[--primary]/20">Live</span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-[--muted] mb-2">Preferred Categories</div>
            <div className="flex flex-wrap gap-1.5">
              {user.preferences.map((p, i) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-[--primary]/10 text-white border border-[--primary]/20">{p}</span>
              ))}
            </div>
          </div>

          <div className="border-t border-white/6 pt-3">
            <div className="text-xs text-[--muted] mb-2">Recommendation Confidence</div>
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <CircularProgress value={aiScore} color="#6C63FF" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{aiScore}%</div>
                <div className="text-[10px] text-[--muted]">Confidence across personalized models</div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/6 pt-3">
            <div className="text-xs text-[--muted] mb-2">Shopping Trends</div>
            <div className="space-y-2">
              {[
                { label: 'Electronics', value: 75, color: '#6C63FF' },
                { label: 'Gaming', value: 62, color: '#00E5FF' },
                { label: 'Wearables', value: 48, color: '#FF6B35' }
              ].map((t, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-[--muted]">{t.label}</span>
                    <span className="text-white">{t.value}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${t.value}%` }}
                      transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: t.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/6 pt-3">
            <div className="text-xs text-[--muted] mb-2">Predicted Next Purchase</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-sm">🎯</div>
              <div>
                <div className="text-sm font-medium">{user.predictedNextPurchase}</div>
                <div className="text-[10px] text-[--secondary]">{user.predictedConfidence}% confidence</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">User Progress</h3>
          <span className="text-[10px] text-[--muted]">{user.tier}</span>
        </div>
        <div className="text-center mb-3">
          <div className="text-2xl font-bold text-white">{user.level}</div>
          <div className="text-xs text-[--muted]">{user.loyaltyPoints.toLocaleString()} points earned</div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-[--muted]">Next Tier Progress</span>
            <span className="text-white">{user.levelProgress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${user.levelProgress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-[--primary] to-[--secondary]"
            />
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
