'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Gamepad2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { RoomSetup } from '@/components/lobby/RoomSetup';
import { RoomLobby } from '@/components/lobby/RoomLobby';
import { KawaiiAvatar } from '@/lib/avatars';
import { soundEngine } from '@/lib/sound/soundEngine';

export default function HomePage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { room } = useRoom();

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center animate-bounce">
          <Heart className="w-8 h-8 text-kawaii-pink fill-kawaii-pink animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-semibold text-kawaii-muted">Opening our little world... 🌸</p>
      </div>
    );
  }

  // Not signed in / no profile
  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Decorative Floating Elements */}
        <div className="absolute top-12 left-10 text-3xl opacity-40 animate-float-slow select-none">🌸</div>
        <div className="absolute top-20 right-14 text-4xl opacity-30 animate-float-reverse select-none">✨</div>
        <div className="absolute bottom-24 left-16 text-3xl opacity-30 animate-float-reverse select-none">☁️</div>
        <div className="absolute bottom-16 right-20 text-3xl opacity-40 animate-float-slow select-none">🍓</div>

        <div className="w-full max-w-xl text-center space-y-6 z-10">
          {/* Animated Mascot Pair */}
          <div className="flex items-center justify-center gap-4 animate-float-slow">
            <div className="relative">
              <KawaiiAvatar id="bunny" size={80} className="shadow-kawaii" />
              <span className="absolute -bottom-1 -right-1 text-xl select-none">🎀</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-kawaii-pink shadow-sm">
              <Heart className="w-6 h-6 fill-kawaii-pink text-kawaii-pink animate-pulse" />
            </div>
            <div className="relative">
              <KawaiiAvatar id="kitty" size={80} className="shadow-kawaii" />
              <span className="absolute -bottom-1 -right-1 text-xl select-none">🌸</span>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-100/80 text-pink-700 text-xs font-bold mb-3 border border-pink-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>A Little Kawaii World for Two</span>
            </div>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-kawaii-text tracking-tight leading-tight">
              UsTwo <span className="text-pink-500">💗</span>
            </h1>
            <p className="text-base sm:text-lg text-kawaii-muted font-medium mt-2 max-w-md mx-auto">
              Two hearts, one little world. Play 12 synchronized multiplayer games, ask secret questions, and share sweet moments together.
            </p>
          </div>

          {/* Quick CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/auth"
              onClick={() => soundEngine.playClick()}
              className="w-full sm:w-auto px-8 py-4 rounded-3xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-sm shadow-kawaii hover:shadow-kawaii-hover transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Step Inside Our World 🌸</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/games"
              onClick={() => soundEngine.playClick()}
              className="w-full sm:w-auto px-6 py-4 rounded-3xl bg-white hover:bg-pink-50 border border-pink-200 text-kawaii-text font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-4 h-4 text-kawaii-pink" />
              <span>Explore All 12 Games</span>
            </Link>
          </div>

          {/* Features Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-6 max-w-md mx-auto text-center">
            <div className="p-3 bg-white/70 rounded-2xl border border-pink-100 shadow-2xs">
              <span className="text-xl">🔒</span>
              <p className="font-bold text-xs text-kawaii-text mt-1">Strictly 2 People</p>
              <p className="text-[10px] text-kawaii-muted">Private & encrypted</p>
            </div>
            <div className="p-3 bg-white/70 rounded-2xl border border-pink-100 shadow-2xs">
              <span className="text-xl">⚡</span>
              <p className="font-bold text-xs text-kawaii-text mt-1">Real-Time Sync</p>
              <p className="text-[10px] text-kawaii-muted">Turns & drawings</p>
            </div>
            <div className="p-3 bg-white/70 rounded-2xl border border-pink-100 shadow-2xs">
              <span className="text-xl">💌</span>
              <p className="font-bold text-xs text-kawaii-text mt-1">Our Memory Lane</p>
              <p className="text-[10px] text-kawaii-muted">Saved forever</p>
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
