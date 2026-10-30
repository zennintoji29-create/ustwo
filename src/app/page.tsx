'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Gamepad2,
  ArrowRight,
  Lock,
  Zap,
  BookHeart,
  Palette,
  MessageCircleHeart,
  CalendarHeart,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { RoomSetup } from '@/components/lobby/RoomSetup';
import { RoomLobby } from '@/components/lobby/RoomLobby';
import { KawaiiAvatar } from '@/lib/avatars';
import { soundEngine } from '@/lib/sound/soundEngine';

const FEATURE_GAMES = [
  {
    id: 'draw_and_guess',
    name: 'Draw & Guess',
    tagline: 'Real-time canvas stroke sync',
    icon: Palette,
    color: 'from-pink-400 to-rose-400',
    bg: 'bg-pink-50',
    badge: 'Live Sync',
  },
  {
    id: 'secret_questions',
    name: 'Secret Vault',
    tagline: 'Mutual unlock answers',
    icon: Lock,
    color: 'from-purple-400 to-indigo-400',
    bg: 'bg-purple-50',
    badge: 'Private',
  },
  {
    id: 'memory_match',
    name: 'Memory Match',
    tagline: 'Cute pairs & bonus turns',
    icon: Sparkles,
    color: 'from-amber-400 to-orange-400',
    bg: 'bg-amber-50',
    badge: 'Classic',
  },
  {
    id: 'rapid_fire',
    name: 'Rapid Fire',
    tagline: '10-sec quick reaction',
    icon: Flame,
    color: 'from-rose-400 to-red-400',
    bg: 'bg-rose-50',
    badge: 'Fast',
  },
  {
    id: 'love_notes',
    name: 'Love Notes',
    tagline: 'Digital pastel stationery',
    icon: BookHeart,
    color: 'from-emerald-400 to-teal-400',
    bg: 'bg-emerald-50',
    badge: 'Keepsake',
  },
  {
    id: 'daily_corner',
    name: 'Daily Question',
    tagline: 'Answer streaks together',
    icon: MessageCircleHeart,
    color: 'from-cyan-400 to-blue-400',
    bg: 'bg-cyan-50',
    badge: 'Daily',
  },
];

const MASCOT_MESSAGES = [
  'Welcome to our secret haven! 🌸',
  'Ready to play and make memories? 💖',
  'Distance means so little when you mean so much! ✨',
  'You two are the cutest couple ever! 🎀',
  'Click any game to get started! 🎮',
];

export default function HomePage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { room } = useRoom();
  const [bubbleMessage, setBubbleMessage] = useState('We were waiting for you! 🌸');

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="w-18 h-18 rounded-full bg-pink-100 flex items-center justify-center shadow-kawaii-sm"
        >
          <Heart className="w-9 h-9 text-kawaii-pink fill-kawaii-pink" />
        </motion.div>
        <p className="mt-4 text-xs font-bold text-kawaii-muted tracking-wide animate-pulse">
          Opening our little world... 🌸
        </p>
      </div>
    );
  }

  // Not signed in / no profile
  if (!profile) {
    const handleMascotClick = (avatar: string) => {
      soundEngine.playPop();
      const randomMsg = MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)];
      setBubbleMessage(randomMsg);
    };

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden">
        {/* Floating Decorative Elements */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 left-6 sm:left-16 text-3xl sm:text-4xl opacity-40 select-none pointer-events-none"
        >
          🌸
        </motion.div>
        <motion.div
          animate={{ y: [0, 14, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-16 right-8 sm:right-20 text-3xl sm:text-4xl opacity-35 select-none pointer-events-none"
        >
          ✨
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-24 left-10 sm:left-24 text-3xl opacity-35 select-none pointer-events-none"
        >
          ☁️
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-16 right-10 sm:right-24 text-3xl opacity-40 select-none pointer-events-none"
        >
          🍓
        </motion.div>

        <div className="w-full max-w-2xl text-center space-y-6 z-10">
          {/* Interactive Mascot Pair with Speech Bubble */}
          <div className="relative inline-flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={bubbleMessage}
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                className="mb-3 px-4 py-1.5 rounded-2xl bg-white border border-pink-200 text-kawaii-text font-bold text-xs shadow-kawaii-sm relative select-none"
              >
                <span>{bubbleMessage}</span>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-pink-200 rotate-45" />
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-3 sm:gap-5">
              <motion.button
                whileHover={{ scale: 1.1, rotate: -4 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleMascotClick('bunny')}
                title="Click Bunny!"
                className="relative cursor-pointer transition-transform group"
              >
                <KawaiiAvatar id="bunny" size={76} className="shadow-kawaii" />
                <span className="absolute -bottom-1 -right-1 text-xl select-none group-hover:scale-125 transition-transform">
                  🎀
                </span>
              </motion.button>

              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-11 h-11 rounded-full bg-pink-100 flex items-center justify-center text-kawaii-pink shadow-xs border border-pink-200"
              >
                <Heart className="w-6 h-6 fill-kawaii-pink text-kawaii-pink" />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 4 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleMascotClick('kitty')}
                title="Click Kitty!"
                className="relative cursor-pointer transition-transform group"
              >
                <KawaiiAvatar id="kitty" size={76} className="shadow-kawaii" />
                <span className="absolute -bottom-1 -right-1 text-xl select-none group-hover:scale-125 transition-transform">
                  🌸
                </span>
              </motion.button>
            </div>
          </div>

          {/* Hero Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/90 text-pink-700 text-xs font-extrabold mb-3 border border-pink-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>A Private Kawaii World for Two</span>
            </div>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-kawaii-text tracking-tight leading-tight">
              UsTwo <span className="text-pink-500">💗</span>
            </h1>
            <p className="text-sm sm:text-base text-kawaii-muted font-medium mt-2.5 max-w-lg mx-auto leading-relaxed">
              Two hearts, one private room. Synchronize turns, reveal secret answers, draw live together, and keep your sweet memories saved forever.
            </p>
          </div>

          {/* Primary Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/auth"
              onClick={() => soundEngine.playClick()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-3xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-sm shadow-kawaii hover:shadow-kawaii-hover transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Step Inside Our World 🌸</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/games"
              onClick={() => soundEngine.playClick()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-3xl bg-white hover:bg-pink-50 border border-pink-200 text-kawaii-text font-bold text-sm shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-4 h-4 text-kawaii-pink" />
              <span>Explore All 12 Games</span>
            </Link>
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-2 max-w-lg mx-auto text-center">
            <div className="p-3 bg-white/80 rounded-3xl border border-pink-100 shadow-2xs">
              <span className="text-xl">🔒</span>
              <p className="font-bold text-xs text-kawaii-text mt-1">Strictly 2 People</p>
              <p className="text-[10px] text-kawaii-muted">Invite link only</p>
            </div>
            <div className="p-3 bg-white/80 rounded-3xl border border-pink-100 shadow-2xs">
              <span className="text-xl">⚡</span>
              <p className="font-bold text-xs text-kawaii-text mt-1">Real-Time Sync</p>
              <p className="text-[10px] text-kawaii-muted">Zero-lag turns & canvas</p>
            </div>
            <div className="p-3 bg-white/80 rounded-3xl border border-pink-100 shadow-2xs">
              <span className="text-xl">💌</span>
              <p className="font-bold text-xs text-kawaii-text mt-1">Safe Reconnect</p>
              <p className="text-[10px] text-kawaii-muted">State never lost</p>
            </div>
          </div>

          {/* Feature Showcase Grid */}
          <div className="pt-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              <h2 className="font-heading font-bold text-xs sm:text-sm text-kawaii-muted uppercase tracking-wider">
                What Awaits Inside
              </h2>
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              {FEATURE_GAMES.map((feat) => {
                const IconComponent = feat.icon;
                return (
                  <motion.div
                    key={feat.id}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className={`p-3.5 rounded-3xl ${feat.bg} border border-pink-100 shadow-xs flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-8 h-8 rounded-2xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-xs`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-white/80 text-[9px] font-extrabold text-pink-700 border border-pink-200">
                          {feat.badge}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-xs sm:text-sm text-kawaii-text">
                        {feat.name}
                      </h3>
                      <p className="text-[11px] text-kawaii-muted font-medium mt-0.5 line-clamp-2">
                        {feat.tagline}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile exists, but not in a room yet
  if (!room) {
    return <RoomSetup />;
  }

  // Active room member
  return <RoomLobby />;
}
