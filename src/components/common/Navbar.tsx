'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Copy, Check, Sparkles, Flame, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { KawaiiAvatar } from '@/lib/avatars';
import { SoundToggle } from './SoundToggle';
import { soundEngine } from '@/lib/sound/soundEngine';

export function Navbar() {
  const { profile, signOut } = useAuth();
  const { room, partner, isPartnerOnline, isPartnerReconnecting, leaveRoom } = useRoom();
  const [copied, setCopied] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    soundEngine.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-kawaii-border/60 transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          onClick={() => soundEngine.playClick()}
          className="flex items-center gap-2 group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-300 flex items-center justify-center text-white shadow-kawaii-sm group-hover:rotate-6 transition-transform">
            <Heart className="w-5 h-5 fill-white text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-heading font-bold text-xl text-kawaii-text tracking-tight">UsTwo</span>
              <span className="text-base">💗</span>
            </div>
            <p className="text-[10px] text-kawaii-muted font-medium -mt-1 hidden sm:block">Two hearts, one little world</p>
          </div>
        </Link>

        {/* Center: Room Code & Partner Status */}
        {room && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Room Code Pill */}
            <button
              onClick={handleCopyCode}
              title="Click to copy invite code"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200/60 text-xs font-semibold text-pink-700 transition-all duration-200 active:scale-95"
            >
              <span className="text-pink-500 font-bold">{room.code}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-pink-400" />
              )}
            </button>

            {/* Partner Presence Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-kawaii-cream border border-kawaii-peach/50 text-xs text-kawaii-text">
              <div className="relative">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isPartnerOnline
                      ? 'bg-emerald-400 ring-4 ring-emerald-100 animate-pulse'
                      : isPartnerReconnecting
                      ? 'bg-amber-400 ring-4 ring-amber-100 animate-bounce'
                      : 'bg-gray-300'
                  }`}
                />
              </div>
              <span className="font-medium">
                {isPartnerOnline
                  ? `${partner?.profile?.nickname || 'Partner'} online 💕`
                  : isPartnerReconnecting
                  ? 'Reconnecting... ⏳'
                  : 'Waiting for partner... 🌸'}
              </span>
            </div>

            {/* Streak */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{room.streak_days || 1}d</span>
            </div>
          </div>
        )}

        {/* Right: Sound & Profile */}
        <div className="flex items-center gap-2">
          <SoundToggle />

          {profile ? (
            <div className="relative">
              <button
                onClick={() => {
                  soundEngine.playPop();
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-white hover:bg-pink-50 border border-kawaii-border shadow-sm transition-all active:scale-95"
              >
                <KawaiiAvatar id={profile.avatar_id} size={30} />
                <span className="text-xs font-semibold text-kawaii-text max-w-[80px] truncate hidden sm:inline">
                  {profile.nickname}
                </span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-3xl bg-white shadow-kawaii border border-kawaii-border p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-3 p-2 bg-pink-50/60 rounded-2xl mb-2">
                    <KawaiiAvatar id={profile.avatar_id} size={42} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-kawaii-text truncate">{profile.nickname}</p>
                      <p className="text-[11px] text-pink-600 truncate">{profile.custom_status || 'Playing together 💗'}</p>
                    </div>
                  </div>

                  {room && (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        leaveRoom();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium mb-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Leave Room</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      signOut();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-kawaii-muted hover:text-kawaii-text hover:bg-gray-50 rounded-xl transition-colors font-medium"
                  >
                    <Users className="w-4 h-4" />
                    <span>Switch / Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              onClick={() => soundEngine.playClick()}
              className="px-4 py-2 rounded-full bg-kawaii-pink hover:bg-kawaii-pink-deep text-white text-xs font-semibold shadow-kawaii-sm transition-all active:scale-95"
            >
              Sign In 💗
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

