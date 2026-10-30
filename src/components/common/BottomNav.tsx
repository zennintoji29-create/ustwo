'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Gamepad2, Sparkles, HeartHandshake, Image as ImageIcon } from 'lucide-react';
import { soundEngine } from '@/lib/sound/soundEngine';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Lobby', href: '/', icon: Home },
    { label: 'Games', href: '/games', icon: Gamepad2 },
    { label: 'Our Corner', href: '/corner', icon: Sparkles },
    { label: 'Love Notes', href: '/notes', icon: HeartHandshake },
    { label: 'Memories', href: '/memories', icon: ImageIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-kawaii-border/90 pb-safe shadow-lg">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => soundEngine.playClick()}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 touch-target ${
                isActive ? 'text-kawaii-pink font-extrabold' : 'text-kawaii-text-muted hover:text-kawaii-text'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActivePill"
                  className="absolute inset-x-2 inset-y-1.5 bg-pink-100/70 rounded-2xl z-0"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <div className="relative z-10 p-1">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.6] text-kawaii-pink' : 'stroke-[1.8]'}`} />
              </div>
              <span className="relative z-10 text-[10px] tracking-tight font-heading mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
