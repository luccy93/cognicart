'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number; y: number; size: number; opacity: number;
  speed: number; delay: number; angle: number; length: number;
}

export function ShootingStars({ count = 8 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    starsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 6 + 2,
      delay: Math.random() * 3,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      length: Math.random() * 80 + 40,
    }));

    let lastTime = 0;
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        star.delay -= dt;
        if (star.delay > 0) return;

        ctx.save();
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
          star.x - Math.cos(star.angle) * star.length,
          star.y + Math.sin(star.angle) * star.length
        );
        const gradient = ctx.createLinearGradient(
          star.x, star.y,
          star.x - Math.cos(star.angle) * star.length,
          star.y + Math.sin(star.angle) * star.length
        );
        gradient.addColorStop(0, 'rgba(108, 99, 255, 0.8)');
        gradient.addColorStop(0.3, 'rgba(0, 229, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(108, 99, 255, 0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.size;
        ctx.stroke();
        ctx.restore();

        star.x += Math.cos(star.angle) * star.speed * dt * 60;
        star.y -= Math.sin(star.angle) * star.speed * dt * 60;

        if (star.x > canvas.width + star.length || star.y < -star.length) {
          star.x = -star.length;
          star.y = Math.random() * canvas.height * 0.5;
          star.delay = Math.random() * 4;
        }
      });

      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
}
