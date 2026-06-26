import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'recommendations', label: 'Recommendations', icon: '✨' },
  { id: 'explore', label: 'Explore Products', icon: '🛍' },
  { id: 'wishlist', label: 'Wishlist', icon: '❤️', badge: 6 },
  { id: 'cart', label: 'Cart', icon: '🛒', badge: 3 },
  { id: 'orders', label: 'Orders', icon: '📦' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', badge: 3 },
  { id: 'settings', label: 'Settings', icon: '⚙' }
]

export default function LeftSidebar({ collapsed, setCollapsed, activeSection, setActiveSection }) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`fixed left-0 top-0 h-full z-30 pt-24 transition-all duration-300 ${collapsed ? 'w-20' : 'w-56'}`}
    >
      <div className="h-full glass rounded-r-xl mx-2 mb-4 p-2 flex flex-col overflow-hidden">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-2 p-2 rounded-lg hover:bg-white/6 text-[--muted] self-end"
        >
          <svg className="w-4 h-4 transition-transform" style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeSection === item.id
                ? 'bg-gradient-to-r from-[--primary]/20 to-transparent text-white shadow-[inset_2px_0_0_--primary]'
                : 'text-[--muted] hover:text-white hover:bg-white/4'
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 text-left whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && (
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[--highlight] text-black ${collapsed ? 'ml-0' : ''}`}>
                  {item.badge}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className={`mt-auto pt-2 border-t border-white/6 ${collapsed ? 'text-center' : ''}`}>
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-[10px] text-black font-bold">C</div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="text-xs font-medium">CogniCart</div>
                  <div className="text-[10px] text-[--muted]">v2.0 AI</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
