'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-kawaii-border/70 pb-safe shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => soundEngine.playClick()}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 ${
                isActive ? 'text-kawaii-pink font-bold' : 'text-kawaii-muted hover:text-kawaii-text'
              }`}
            >
              <div
                className={`p-1 rounded-2xl transition-all ${
                  isActive ? 'bg-pink-100/70 text-kawaii-pink' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

