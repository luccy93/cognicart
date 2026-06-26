'use client';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  variant?: 'full' | 'icon' | 'text';
}

const sizes = {
  sm: { icon: 32, text: 'text-sm', tagline: 'text-[8px]', gap: 'gap-2', spacing: 'tracking-[0.12em]' },
  md: { icon: 40, text: 'text-base', tagline: 'text-[9px]', gap: 'gap-2.5', spacing: 'tracking-[0.15em]' },
  lg: { icon: 52, text: 'text-xl', tagline: 'text-[10px]', gap: 'gap-3', spacing: 'tracking-[0.18em]' },
  xl: { icon: 72, text: 'text-3xl', tagline: 'text-xs', gap: 'gap-4', spacing: 'tracking-[0.2em]' },
};

function LogoIcon({ size: iconSize }: { size: number }) {
  const s = iconSize;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.42;
  const strokeW = s * 0.055;

  const cartW = s * 0.35;
  const cartH = s * 0.28;
  const cartX = cx - cartW / 2;
  const cartY = cy - cartH / 2 + s * 0.02;
  const handleX = cartX + cartW * 0.15;
  const handleY = cartY - s * 0.06;
  const wheelR = s * 0.035;

  const nodePositions = [
    { x: cx - s * 0.08, y: cy - s * 0.1 },
    { x: cx + s * 0.06, y: cy - s * 0.12 },
    { x: cx - s * 0.04, y: cy + s * 0.02 },
    { x: cx + s * 0.1, y: cy - s * 0.01 },
    { x: cx, y: cy + s * 0.1 },
    { x: cx - s * 0.1, y: cy + s * 0.06 },
  ];

  const connections = [
    [0, 2], [1, 3], [2, 4], [2, 5], [3, 4], [0, 5], [1, 2],
  ];

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="50%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#7B61FF" />
        </linearGradient>
        <linearGradient id="logo-grad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7B61FF" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="cart-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.9" />
        </linearGradient>
        <filter id="logo-glow">
          <feGaussianBlur stdDeviation={s * 0.04} result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="logo-glow-strong">
          <feGaussianBlur stdDeviation={s * 0.06} result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="inner-shadow">
          <feOffset dx="0" dy={s * 0.01} />
          <feGaussianBlur stdDeviation={s * 0.02} />
          <feComposite operator="out" in="SourceGraphic" />
          <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
          <feBlend in="SourceGraphic" mode="normal" />
        </filter>
      </defs>

      <g filter="url(#logo-glow)">
        <circle cx={cx} cy={cy} r={r + strokeW * 0.5} fill="none" stroke="url(#logo-grad)" strokeWidth={strokeW * 0.3} opacity="0.15" />
      </g>

      <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#logo-grad)" strokeWidth={strokeW} strokeLinecap="round" filter="url(#logo-glow-strong)" />

      <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#logo-grad2)" strokeWidth={strokeW * 0.2} strokeLinecap="round" strokeDasharray={`${s * 0.04} ${s * 0.06}`} opacity="0.5" />

      <path d={`M ${cx - r * 0.6} ${cy - r * 0.75} L ${cx + r * 0.6} ${cy - r * 0.75}`} stroke="url(#logo-grad)" strokeWidth={strokeW * 0.8} strokeLinecap="round" opacity="0.4" />

      <g opacity="0.6">
        <line x1={cx - r * 0.9} y1={cy - r * 0.5} x2={cx - r * 0.3} y2={cy - r * 0.5} stroke="url(#logo-grad)" strokeWidth={strokeW * 0.3} strokeLinecap="round" opacity="0.3" />
        <line x1={cx - r * 0.8} y1={cy - r * 0.35} x2={cx - r * 0.2} y2={cy - r * 0.35} stroke="url(#logo-grad)" strokeWidth={strokeW * 0.2} strokeLinecap="round" opacity="0.2" />
      </g>

      <g opacity="0.5">
        <line x1={cx + r * 0.3} y1={cy - r * 0.5} x2={cx + r * 0.9} y2={cy - r * 0.5} stroke="url(#logo-grad)" strokeWidth={strokeW * 0.3} strokeLinecap="round" opacity="0.3" />
        <line x1={cx + r * 0.2} y1={cy - r * 0.35} x2={cx + r * 0.8} y2={cy - r * 0.35} stroke="url(#logo-grad)" strokeWidth={strokeW * 0.2} strokeLinecap="round" opacity="0.2" />
      </g>

      <g filter="url(#inner-shadow)">
        <path d={`M ${cartX} ${cartY + cartH * 0.15} L ${cartX + cartW * 0.15} ${cartY + cartH * 0.6} L ${cartX + cartW * 0.7} ${cartY + cartH * 0.6} L ${cartX + cartW * 0.9} ${cartY + cartH * 0.15} Z`}
          fill="none" stroke="url(#cart-grad)" strokeWidth={strokeW * 0.7} strokeLinejoin="round" strokeLinecap="round" />

        <line x1={cartX + cartW * 0.15} y1={cartY + cartH * 0.35} x2={cartX + cartW * 0.85} y2={cartY + cartH * 0.35}
          stroke="url(#cart-grad)" strokeWidth={strokeW * 0.4} strokeLinecap="round" opacity="0.6" />

        <line x1={cartX + cartW * 0.3} y1={cartY + cartH * 0.45} x2={cartX + cartW * 0.7} y2={cartY + cartH * 0.45}
          stroke="url(#cart-grad)" strokeWidth={strokeW * 0.3} strokeLinecap="round" opacity="0.4" />

        <path d={`M ${handleX} ${handleY + s * 0.02} Q ${handleX + cartW * 0.15} ${handleY - s * 0.04} ${handleX + cartW * 0.2} ${handleY + s * 0.02}`}
          fill="none" stroke="url(#cart-grad)" strokeWidth={strokeW * 0.5} strokeLinecap="round" />

        <circle cx={cartX + cartW * 0.3} cy={cartY + cartH * 0.8} r={wheelR} fill="none" stroke="url(#cart-grad)" strokeWidth={strokeW * 0.4} />
        <circle cx={cartX + cartW * 0.7} cy={cartY + cartH * 0.8} r={wheelR} fill="none" stroke="url(#cart-grad)" strokeWidth={strokeW * 0.4} />
      </g>

      {connections.map(([i, j], idx) => (
        <line key={`conn-${idx}`} x1={nodePositions[i].x} y1={nodePositions[i].y} x2={nodePositions[j].x} y2={nodePositions[j].y}
          stroke="url(#logo-grad)" strokeWidth={strokeW * 0.25} strokeLinecap="round" opacity="0.5" />
      ))}

      {nodePositions.map((pos, idx) => (
        <g key={`node-${idx}`}>
          <circle cx={pos.x} cy={pos.y} r={s * 0.018} fill="#00D4FF" opacity="0.3" filter="url(#logo-glow)" />
          <circle cx={pos.x} cy={pos.y} r={s * 0.01} fill="#00E5FF" />
        </g>
      ))}

      <circle cx={cx} cy={cy} r={s * 0.005} fill="#7B61FF" opacity="0.6" filter="url(#logo-glow-strong)" />

      <g opacity="0.4">
        <line x1={cx - r * 0.35} y1={cy - r * 0.55} x2={cx - r * 0.25} y2={cy - r * 0.45}
          stroke="#00D4FF" strokeWidth={strokeW * 0.15} strokeLinecap="round" />
        <line x1={cx + r * 0.25} y1={cy - r * 0.45} x2={cx + r * 0.35} y2={cy - r * 0.55}
          stroke="#A855F7" strokeWidth={strokeW * 0.15} strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Logo({ size = 'md', showTagline = true, className = '', variant = 'full' }: LogoProps) {
  const s = sizes[size];

  if (variant === 'icon') {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`relative shrink-0 ${className}`}
      >
        <LogoIcon size={s.icon} />
      </motion.div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex items-center">
          <span className={`font-space font-bold ${s.text} ${s.spacing} text-white`}>COGNI</span>
          <span className={`font-space font-bold ${s.text} ${s.spacing}`}
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #00E5FF, #7B61FF, #A855F7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >CART</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center ${s.gap} ${className}`}
    >
      <motion.div
        whileHover={{ scale: 1.08, rotate: -3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="relative shrink-0"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#A855F7]/20 blur-xl" />
        <LogoIcon size={s.icon} />
      </motion.div>
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-space font-bold ${s.text} ${s.spacing} text-white`}>COGNI</span>
          <span
            className={`font-space font-bold ${s.text} ${s.spacing}`}
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #00E5FF, #7B61FF, #A855F7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.3))',
            }}
          >CART</span>
        </div>
        {showTagline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`flex items-center gap-1.5 text-[--muted] ${s.tagline} font-light uppercase tracking-[0.25em]`}
          >
            <span className="w-1 h-1 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#A855F7]" />
            <span>Intelligence Behind Every Purchase</span>
            <span className="w-1 h-1 rounded-full bg-gradient-to-r from-[#A855F7] to-[#00D4FF]" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
