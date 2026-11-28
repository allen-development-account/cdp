import React, { useEffect, useRef } from 'react';

interface ConfettiCannonCanvasProps {
  triggerKey: number;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  aspect: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  tiltAngle: number;
  tiltSpeed: number;
  alpha: number;
  shape: 'rect' | 'ribbon';
}

const CONFETTI_COLORS = [
  '#1473E6',
  '#38BDF8',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#8B5CF6',
  '#F97316',
  '#22D3EE'
];

export const ConfettiCannonCanvas: React.FC<ConfettiCannonCanvasProps> = ({ triggerKey }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: ConfettiParticle[] = [];

    const spawnBurst = (side: 'left' | 'right', count: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const originX = side === 'left' ? -10 : w + 10;
      const originY = h * 0.72;

      for (let i = 0; i < count; i++) {
        // Angle upward & inward from left or right cannon
        const spreadDeg = 22 + Math.random() * 44;
        const rad =
          side === 'left'
            ? (-spreadDeg * Math.PI) / 180
            : (-(180 - spreadDeg) * Math.PI) / 180;
        const speed = 11 + Math.random() * 14;

        particles.push({
          x: originX,
          y: originY + (Math.random() - 0.5) * 40,
          vx: Math.cos(rad) * speed,
          vy: Math.sin(rad) * speed - Math.random() * 3,
          size: 7 + Math.random() * 7,
          aspect: 0.45 + Math.random() * 0.45,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.22,
          tiltAngle: Math.random() * Math.PI,
          tiltSpeed: 0.08 + Math.random() * 0.1,
          alpha: 1,
          shape: Math.random() > 0.35 ? 'rect' : 'ribbon'
        });
      }
    };

    // Wave 1: Simultaneous left and right cannon blast
    spawnBurst('left', 90);
    spawnBurst('right', 90);

    // Wave 2: Secondary festive cannon blast
    const wave2Timer = window.setTimeout(() => {
      spawnBurst('left', 65);
      spawnBurst('right', 65);
    }, 360);

    let rafId = 0;
    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= 0.985;
        p.vy = p.vy * 0.988 + 0.34; // gentle gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.tiltAngle += p.tiltSpeed;

        if (p.y > h * 0.88) {
          p.alpha -= 0.025;
        }

        if (p.alpha <= 0 || p.y > h + 40) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        const scaleY = Math.cos(p.tiltAngle);
        ctx.fillStyle = p.color;

        if (p.shape === 'ribbon') {
          ctx.fillRect(-p.size * 0.7, (-p.size * 0.35) * scaleY, p.size * 1.4, p.size * 0.5 * Math.abs(scaleY) + 1.5);
        } else {
          ctx.fillRect(-p.size / 2, (-p.size * p.aspect) / 2, p.size, p.size * p.aspect * (0.35 + 0.65 * Math.abs(scaleY)));
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        rafId = window.requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.clearTimeout(wave2Timer);
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [triggerKey]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};
