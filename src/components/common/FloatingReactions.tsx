'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoom } from '@/context/RoomContext';

export function FloatingReactions() {
  const { reactions } = useRoom();

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, scale: 0.5, x: r.x, y: r.y }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.4, 1.6, 1.8],
              y: r.y - 240,
              x: r.x + (Math.random() * 80 - 40),
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, ease: 'easeOut' }}
            className="absolute text-4xl select-none filter drop-shadow-md"
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

