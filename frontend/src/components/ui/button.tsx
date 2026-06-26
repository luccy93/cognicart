'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef, useRef, useState, useCallback, useMemo } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit';
  ripple?: boolean;
  magnetic?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = 'primary', size = 'md', className, disabled, loading, onClick, type = 'button', ripple = true, magnetic },
  ref
) {
  const innerRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const combinedRef = useCombinedRefs(ref, innerRef);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && innerRef.current) {
      const rect = innerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRipples(prev => [...prev, { x, y, id }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    }
    onClick?.(e);
  }, [ripple, onClick]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (magnetic && innerRef.current) {
      const rect = innerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      innerRef.current.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    }
  }, [magnetic]);

  const handleMouseLeave = useCallback(() => {
    if (magnetic && innerRef.current) {
      innerRef.current.style.transform = 'translate(0, 0)';
    }
  }, [magnetic]);

  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/20',
    glass: 'glass glass-hover text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <motion.button
      ref={combinedRef as React.Ref<HTMLButtonElement>}
      type={type}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ripple-container',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
      {ripples.map(r => (
        <span
          key={r.id}
          className="ripple-effect"
          style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20 }}
        />
      ))}
    </motion.button>
  );
});

function useCombinedRefs<T>(
  forwardedRef: React.Ref<T> | undefined,
  localRef: React.RefObject<T | null>
) {
  const refCallback = useMemo(() => (node: T | null) => {
    localRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<T | null>).current = node;
  }, [forwardedRef, localRef]);
  return refCallback;
}
