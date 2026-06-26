import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { user } from '../data/mock'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const dropdownRef = useRef()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false) }
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClick)
    return () => { window.removeEventListener('scroll', handleScroll); document.removeEventListener('mousedown', handleClick) }
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-[--bg]/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'
        }`}
    >
      <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-[--primary]/20">C</div>
            <span className="font-bold tracking-widest text-sm">COGNICART</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[--primary]/20 text-[--primary] font-medium hidden sm:block">AI 2.0</span>
          </div>
        </div>

        <div className={`hidden md:flex items-center glass rounded-full px-4 py-1.5 transition-all duration-300 ${searchFocused ? 'shadow-[0_0_20px_rgba(108,99,255,0.15)] border border-[--primary]/30' : ''
          }`}>
          <svg className="w-4 h-4 text-[--muted] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            placeholder="Search or ask AI..."
            className="bg-transparent outline-none text-sm w-72 text-white placeholder-[--muted]"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <button className="text-[--secondary] ml-2 text-[11px] font-medium px-2 py-0.5 rounded hover:bg-white/6 transition-colors">AI</button>
          <button className="text-[--muted] ml-1 p-1 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {[
            { icon: '🔔', badge: 3, tooltip: 'Notifications' },
            { icon: '❤️', badge: 6, tooltip: 'Wishlist' },
            { icon: '🛒', badge: 3, tooltip: 'Cart' },
            { icon: '💬', badge: 2, tooltip: 'Messages' },
            { icon: '🤖', tooltip: 'AI Assistant' }
          ].map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-lg hover:bg-white/6 transition-colors"
              title={item.tooltip}
            >
              <span className="text-lg">{item.icon}</span>
              {item.badge && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[--highlight] text-black text-[9px] font-bold flex items-center justify-center">{item.badge}</span>
              )}
            </motion.button>
          ))}

          <div className="relative ml-2" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/6 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold shadow-lg">{user.avatar}</div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium leading-tight">{user.name}</div>
                <div className="text-[10px] text-[--muted] leading-tight">{user.tier} Member</div>
              </div>
              <svg className={`w-3 h-3 text-[--muted] transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 glass rounded-xl p-1.5 shadow-xl border border-white/6"
                >
                  {[
                    { label: 'Profile', icon: '👤' },
                    { label: 'Orders', icon: '📦' },
                    { label: 'Wishlist', icon: '❤️' },
                    { label: 'Settings', icon: '⚙' },
                    { label: 'Logout', icon: '🚪', divider: true }
                  ].map((item, i) => (
                    <button
                      key={i}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[--muted] hover:text-white hover:bg-white/6 transition-colors ${item.divider ? 'mt-1 border-t border-white/6 pt-2.5' : ''
                        }`}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
