import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-12 pt-8 pb-8 border-t border-white/6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</div>
              <span className="text-xs font-bold tracking-wider">COGNICART</span>
            </div>
            <div className="text-[10px] text-[--muted] leading-relaxed">Intelligence Behind Every Purchase — AI-powered personalized shopping experience.</div>
          </div>
          <div>
            <div className="text-xs font-medium mb-3">Company</div>
            <div className="space-y-1.5">
              {['About', 'Careers', 'Press', 'Blog'].map((item, i) => (
                <div key={i} className="text-[10px] text-[--muted] hover:text-white cursor-pointer transition-colors">{item}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium mb-3">Support</div>
            <div className="space-y-1.5">
              {['Contact', 'FAQ', 'Privacy Policy', 'Terms of Service'].map((item, i) => (
                <div key={i} className="text-[10px] text-[--muted] hover:text-white cursor-pointer transition-colors">{item}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium mb-3">Connect</div>
            <div className="space-y-1.5">
              {['Twitter', 'Instagram', 'LinkedIn', 'Discord'].map((item, i) => (
                <div key={i} className="text-[10px] text-[--muted] hover:text-white cursor-pointer transition-colors">{item}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-[10px] text-[--muted] text-center pt-4 border-t border-white/6">
          © {new Date().getFullYear()} CogniCart — Intelligence Behind Every Purchase. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
