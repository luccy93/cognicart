import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#050508',
        'bg-secondary': '#0A0A0F',
        surface: '#15151D',
        'surface-elevated': '#1C1C28',
        primary: '#6C63FF',
        secondary: '#00E5FF',
        accent: '#FF6B35',
        muted: '#8B8B9E',
      },
      fontFamily: {
        space: ['Space Grotesk', 'sans-serif'],
        satoshi: ['Satoshi', 'sans-serif'],
        clash: ['Clash Display', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4)',
        'glass-lg': '0 12px 48px rgba(0,0,0,0.5)',
        neon: '0 8px 40px rgba(108,99,255,0.08)',
        'neon-strong': '0 0 30px rgba(108,99,255,0.15)',
        glow: '0 0 20px rgba(0,229,255,0.08)',
        'glow-strong': '0 0 40px rgba(0,229,255,0.12)',
        'inner-glow': '0 0 0 1px rgba(108,99,255,0.04) inset',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(circle at 50% 50%, rgba(108,99,255,0.08) 0%, transparent 50%)',
        'aurora': 'radial-gradient(ellipse 80% 50% at 10% 20%, rgba(108,99,255,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 30%, rgba(0,229,255,0.04) 0%, transparent 60%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'pulse-secondary': 'pulse-secondary 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.2, 0.9, 0.4, 1) forwards',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.2, 0.9, 0.4, 1) forwards',
        'fade-in': 'fade-in 0.5s ease forwards',
        'spin-slow': 'spin-slow 8s linear infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'orbit': 'orbit 12s linear infinite',
        'border-glow': 'border-glow 3s ease-in-out infinite',
        'aurora-drift': 'aurora-drift 30s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(108,99,255,0.08)' },
          '50%': { boxShadow: '0 0 40px rgba(108,99,255,0.15)' },
        },
        'pulse-secondary': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,229,255,0.06)' },
          '50%': { boxShadow: '0 0 40px rgba(0,229,255,0.12)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(0.5deg)' },
          '66%': { transform: 'translateY(4px) rotate(-0.3deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.85)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        orbit: {
          from: { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          to: { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(108,99,255,0.1)', boxShadow: '0 0 15px rgba(108,99,255,0)' },
          '50%': { borderColor: 'rgba(108,99,255,0.2)', boxShadow: '0 0 20px rgba(108,99,255,0.05)' },
        },
        'aurora-drift': {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: '0.8' },
          '25%': { transform: 'translate(2%, -1%) scale(1.02)', opacity: '0.9' },
          '50%': { transform: 'translate(-1%, 1%) scale(0.98)', opacity: '1' },
          '75%': { transform: 'translate(1%, -0.5%) scale(1.01)', opacity: '0.85' },
          '100%': { transform: 'translate(-0.5%, 0.5%) scale(0.99)', opacity: '0.9' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.2, 0.9, 0.4, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
