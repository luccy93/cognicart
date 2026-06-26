'use client';

interface InfinityLoopIconProps {
  size?: number;
  className?: string;
  animated?: boolean;
  variant?: 'full' | 'simplified' | 'avatar' | 'favicon';
}

export function InfinityLoopIcon({ size = 40, className = '', animated = false, variant = 'full' }: InfinityLoopIconProps) {
  const s = size;

  if (variant === 'favicon') {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="fav-grad" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <path d="M 50,50 C 42,30 18,28 14,42 C 10,56 22,72 36,70 C 46,68 50,56 50,50 C 50,50 50,50 50,50 C 58,30 82,28 86,42 C 90,56 78,72 64,70 C 54,68 50,56 50,50" fill="none" stroke="url(#fav-grad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (variant === 'simplified') {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="sim-blue" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="sim-cyan" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#0097A7" />
          </linearGradient>
        </defs>
        <path d="M 50,50 C 42,30 18,28 14,42 C 10,56 22,72 36,70 C 46,68 50,56 50,50" fill="none" stroke="url(#sim-blue)" strokeWidth="12" strokeLinecap="round" />
        <path d="M 50,50 C 58,30 82,28 86,42 C 90,56 78,72 64,70 C 54,68 50,56 50,50" fill="none" stroke="url(#sim-cyan)" strokeWidth="12" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === 'avatar') {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="ava-blue" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="ava-cyan" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#0097A7" />
          </linearGradient>
          <linearGradient id="ava-purple" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <filter id="ava-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ava-glow-bg">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="50" cy="50" r="48" fill="rgba(108,99,255,0.06)" stroke="rgba(108,99,255,0.12)" strokeWidth="1" />
        <circle cx="50" cy="50" r="36" fill="rgba(0,229,255,0.04)" stroke="rgba(0,229,255,0.08)" strokeWidth="0.5" />
        <path d="M 50,50 C 42,32 20,30 16,44 C 12,58 24,72 38,70 C 48,68 50,56 50,50" fill="none" stroke="url(#ava-blue)" strokeWidth="10" strokeLinecap="round" filter="url(#ava-glow)" />
        <path d="M 50,50 C 58,32 80,30 84,44 C 88,58 76,72 62,70 C 52,68 50,56 50,50" fill="none" stroke="url(#ava-cyan)" strokeWidth="10" strokeLinecap="round" filter="url(#ava-glow)" />
        <circle cx="50" cy="50" r="5" fill="url(#ava-purple)" filter="url(#ava-glow-bg)" />
      </svg>
    );
  }

  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#0097A7" />
        </linearGradient>
        <linearGradient id="purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <filter id="glow-filter">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-strong">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#glow-filter)">
        {/* Left infinity lobe (Deep Blue - Discovery/Search) */}
        <path d="M 50,50 C 42,30 18,28 14,42 C 10,56 22,72 36,70 C 46,68 50,56 50,50"
              fill="none" stroke="url(#blue-grad)" strokeWidth="12" strokeLinecap="round" />
        {/* Glass highlight on left lobe */}
        <path d="M 50,50 C 42,30 18,28 14,42"
              fill="none" stroke="white" strokeWidth="2" opacity="0.15" strokeLinecap="round" />

        {/* Right infinity lobe (Cyan - Commerce/Cart) */}
        <path d="M 50,50 C 58,30 82,28 86,42 C 90,56 78,72 64,70 C 54,68 50,56 50,50"
              fill="none" stroke="url(#cyan-grad)" strokeWidth="12" strokeLinecap="round" />
        {/* Glass highlight on right lobe */}
        <path d="M 50,50 C 58,30 82,28 86,42"
              fill="none" stroke="white" strokeWidth="2" opacity="0.15" strokeLinecap="round" />
      </g>

      {/* Search icon in left loop */}
      <g opacity="0.9" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none">
        <circle cx="26" cy="46" r="5" />
        <line x1="29.5" y1="49.5" x2="33" y2="53" />
      </g>

      {/* Cart icon in right loop */}
      <g opacity="0.9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M 72,44 L 75,44 L 78,52 L 84,52" />
        <circle cx="76.5" cy="54" r="1.5" />
        <circle cx="82.5" cy="54" r="1.5" />
      </g>

      {/* Center intersection - Analytics bar chart (Purple) */}
      <g filter="url(#glow-strong)">
        <rect x="46" y="48" width="2.5" height="6" rx="0.5" fill="url(#purple-grad)" />
        <rect x="49.5" y="50" width="2.5" height="4" rx="0.5" fill="url(#purple-grad)" />
        <rect x="53" y="46" width="2.5" height="8" rx="0.5" fill="url(#purple-grad)" />
      </g>

      {/* Center crossing circle */}
      <circle cx="50" cy="50" r="10" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />

      {/* Purple sparkles below center */}
      <g opacity="0.8">
        <circle cx="47" cy="78" r="1.5" fill="#8B5CF6" />
        <circle cx="53" cy="82" r="1" fill="#8B5CF6" opacity="0.6" />
        <circle cx="50" cy="86" r="2" fill="#8B5CF6" opacity="0.9" filter="url(#glow-filter)" />
      </g>
    </svg>
  );
}
