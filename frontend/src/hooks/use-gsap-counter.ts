'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function useGsapCounter(end: number, duration: number = 1.5, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const objRef = useRef({ val: 0 });

  useEffect(() => {
    if (!startOnView) {
      gsap.to(objRef.current, {
        val: end,
        duration,
        ease: 'power3.out',
        onUpdate: () => setCount(Math.round(objRef.current.val)),
      });
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(objRef.current, {
            val: end,
            duration,
            ease: 'power3.out',
            onUpdate: () => setCount(Math.round(objRef.current.val)),
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  return { count, ref };
}
