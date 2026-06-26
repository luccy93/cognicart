import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const quickSuggestions = [
  'What do you recommend?',
  'Find me a gift',
  'Best gaming deals?',
  'Track my order'
]

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hey Alex! I\'m your AI shopping assistant. How can I help you today?', isUser: false }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, { id: Date.now(), text: input, isUser: true }])
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `Great choice! I found some amazing products matching "${input}". Would you like me to show you the top picks?`,
        isUser: false
      }])
    }, 800)
    setInput('')
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-gradient-to-br from-[--secondary] to-[--primary] text-black flex items-center justify-center shadow-lg z-50 shadow-[--primary]/30 group"
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-6 bottom-24 w-80 glass rounded-xl shadow-2xl border border-white/6 overflow-hidden z-50"
          >
            <div className="p-3 border-b border-white/6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[--secondary] to-[--primary] flex items-center justify-center text-sm">🤖</div>
              <div>
                <div className="text-sm font-medium">AI Assistant</div>
                <div className="text-[10px] text-[--secondary] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[--secondary] animate-pulse" />
                  Online
                </div>
              </div>
            </div>

            <div className="h-64 overflow-y-auto p-3 space-y-3">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${msg.isUser
                    ? 'bg-[--primary] text-black'
                    : 'bg-white/6 text-white'
                    }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {messages.length === 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {quickSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s); setTimeout(() => setInput(''), 100) }}
                    className="text-[10px] px-2 py-1 rounded-full bg-white/6 hover:bg-white/10 text-[--muted] hover:text-white transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="p-3 border-t border-white/6">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="flex-1 bg-white/6 rounded-lg px-3 py-2 text-xs outline-none text-white placeholder-[--muted]"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  className="px-3 py-2 rounded-lg bg-[--primary] text-black text-xs font-medium"
                >
                  Send
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
