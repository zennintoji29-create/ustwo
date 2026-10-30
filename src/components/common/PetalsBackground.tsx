'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingItem {
  id: number;
  symbol: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export function PetalsBackground() {
  const [items, setItems] = useState<FloatingItem[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const symbols = ['🌸', '✨', '☁️', '💗', '🍓', '⭐'];
    const generated: FloatingItem[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      symbol: symbols[i % symbols.length],
      x: Math.random() * 95,
      size: Math.random() * 10 + 16,
      duration: Math.random() * 8 + 12,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.2 + 0.15,
    }));
    setItems(generated);
  }, []);

  if (reducedMotion || items.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{
            y: '-10vh',
            x: `${item.x}vw`,
            rotate: 0,
            opacity: 0,
          }}
          animate={{
            y: '110vh',
            x: `${item.x + (item.id % 2 === 0 ? 4 : -4)}vw`,
            rotate: 360,
            opacity: [0, item.opacity, item.opacity, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: 'linear',
          }}
          style={{ fontSize: `${item.size}px` }}
          className="absolute filter blur-[0.4px]"
        >
          {item.symbol}
        </motion.div>
      ))}
    </div>
  );
}

