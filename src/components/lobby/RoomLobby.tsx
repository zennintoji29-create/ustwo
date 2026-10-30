'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Flame, CheckCircle2, Circle, MessageCircleHeart, Gamepad2, Gift, Calendar, BookmarkCheck } from 'lucide-react';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { KawaiiAvatar } from '@/lib/avatars';
import { MemberMood } from '@/types/database';
import { soundEngine } from '@/lib/sound/soundEngine';

const MOODS: Array<{ id: MemberMood; label: string; emoji: string }> = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'in_love', label: 'In Love', emoji: '🥰' },
  { id: 'cuddly', label: 'Cuddly', emoji: '🧸' },
  { id: 'playful', label: 'Playful', emoji: '😜' },
  { id: 'sleepy', label: 'Sleepy', emoji: '😴' },
  { id: 'cozy', label: 'Cozy', emoji: '☕' },
  { id: 'hungry', label: 'Hungry', emoji: '🍰' },
];

const REACTION_EMOJIS = ['💗', '💖', '✨', '💋', '🧸', '🌹', '🧋', '💌', '🌸', '🍓'];

export function RoomLobby() {
  const { profile } = useAuth();
  const {
    room,
    myMember,
    partner,
    isPartnerOnline,
    isPartnerReconnecting,
    connectionStatus,
    toggleReady,
    updateMood,
    sendReaction,
  } = useRoom();

  const [showMoodMenu, setShowMoodMenu] = useState(false);

  const getMoodEmoji = (moodId?: string) => {
    return MOODS.find((m) => m.id === moodId)?.emoji || '😊';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Welcome Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-100/80 via-white/90 to-purple-100/70 backdrop-blur-xl rounded-4xl p-6 sm:p-8 shadow-kawaii border border-pink-200/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-pink-200 text-xs font-semibold text-kawaii-pink mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Room {room?.code}</span>
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-kawaii-text">
              Our Little World 💗
            </h1>
            <p className="text-xs sm:text-sm text-kawaii-muted mt-1">
              Two hearts connected in real time. Choose a game or share a sweet moment!
            </p>
          </div>

          {/* Connection Status Pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 border border-pink-100 shadow-sm">
            <div
              className={`w-3 h-3 rounded-full ${
                isPartnerOnline
                  ? 'bg-emerald-400 ring-4 ring-emerald-100 animate-pulse'
                  : isPartnerReconnecting
                  ? 'bg-amber-400 ring-4 ring-amber-100 animate-bounce'
                  : 'bg-rose-300 ring-4 ring-rose-100'
              }`}
            />
            <span className="text-xs font-bold text-kawaii-text">
              {isPartnerOnline
                ? 'Partner Connected 💕'
                : isPartnerReconnecting
                ? 'Partner Reconnecting... ⏳'
                : 'Waiting for Partner 🌸'}
            </span>
          </div>
        </div>

        {/* Both Avatars Side by Side */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 relative">
          {/* Player 1 (Me) */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-400 to-rose-300 shadow-kawaii">
                <KawaiiAvatar id={profile?.avatar_id || 'bunny'} size={88} className="w-full h-full" />
              </div>
              {/* Mood Badge */}
              <button
                onClick={() => {
                  soundEngine.playPop();
                  setShowMoodMenu(!showMoodMenu);
                }}
                title="Change your mood"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-pink-200 shadow-md flex items-center justify-center text-base hover:scale-110 active:scale-95 transition-all"
              >
                {getMoodEmoji(myMember?.mood)}
              </button>
            </div>
            <p className="font-heading font-bold text-sm text-kawaii-text mt-2">
              {profile?.nickname || 'You'} <span className="text-xs text-pink-500 font-normal">(You)</span>
            </p>

            {/* Ready State */}
            <div className="mt-1 flex items-center gap-1 text-xs">
              {myMember?.is_ready ? (
                <span className="flex items-center gap-1 font-bold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Ready!
                </span>
              ) : (
                <span className="flex items-center gap-1 text-kawaii-muted font-medium">
                  <Circle className="w-3.5 h-3.5" /> Not ready
                </span>
              )}
            </div>

            {/* Mood Dropdown */}
            {showMoodMenu && (
              <div className="absolute top-28 z-30 p-2 bg-white rounded-3xl shadow-kawaii border border-pink-200 grid grid-cols-4 gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      updateMood(m.id);
                      setShowMoodMenu(false);
                    }}
                    className="flex flex-col items-center p-2 rounded-2xl hover:bg-pink-50 transition-all text-xs"
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className="text-[10px] text-kawaii-text mt-0.5">{m.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Heart In Between */}
          <div className="flex flex-col items-center justify-center my-2 sm:my-0">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-kawaii-pink shadow-kawaii-sm animate-pulse-subtle">
              <Heart className="w-6 h-6 fill-kawaii-pink text-kawaii-pink" />
            </div>
            <span className="text-[11px] font-bold text-pink-700 mt-1">UsTwo</span>
          </div>

          {/* Player 2 (Partner) */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div
                className={`w-24 h-24 rounded-full p-1 shadow-kawaii transition-all ${
                  isPartnerOnline
                    ? 'bg-gradient-to-tr from-purple-400 to-indigo-300 ring-4 ring-purple-100'
                    : 'bg-gray-200 opacity-60'
                }`}
              >
                <KawaiiAvatar
                  id={partner?.profile?.avatar_id || 'kitty'}
                  size={88}
                  className="w-full h-full"
                />
              </div>
              {/* Partner Mood Badge */}
              {isPartnerOnline && (
                <div
                  title={`Partner is feeling ${partner?.mood || 'happy'}`}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-purple-200 shadow-md flex items-center justify-center text-base"
                >
                  {getMoodEmoji(partner?.mood)}
                </div>
              )}
            </div>
            <p className="font-heading font-bold text-sm text-kawaii-text mt-2">
              {partner?.profile?.nickname || 'Partner'}
            </p>

            {/* Ready State */}
            <div className="mt-1 flex items-center gap-1 text-xs">
              {isPartnerOnline ? (
                partner?.is_ready ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Ready!
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-kawaii-muted font-medium">
                    <Circle className="w-3.5 h-3.5" /> Waiting...
                  </span>
                )
              ) : (
                <span className="text-xs text-rose-500 font-medium">Offline</span>
              )}
            </div>
          </div>
        </div>

        {/* Ready Action Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={toggleReady}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-kawaii active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
              myMember?.is_ready
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{myMember?.is_ready ? "I'm Ready! (Click to unready)" : "I'm Ready to Play! 💗"}</span>
          </button>

          <Link
            href="/games"
            onClick={() => soundEngine.playClick()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-pink-50 text-kawaii-pink border border-pink-200 font-bold text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Browse Games (12) 🎮</span>
          </Link>
        </div>
      </div>

      {/* Live Reactions Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-pink-100 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-kawaii-muted whitespace-nowrap hidden sm:inline">
          Send Love:
        </span>
        <div className="flex items-center gap-2 flex-1 justify-around">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="text-2xl hover:scale-130 active:scale-90 transition-transform p-1 select-none cursor-pointer"
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Access to Our Little Corner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/corner"
          onClick={() => soundEngine.playClick()}
          className="group p-4 rounded-3xl bg-white/90 hover:bg-pink-50/50 border border-pink-100 shadow-sm transition-all active:scale-95 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <span className="font-heading font-bold text-xs sm:text-sm text-kawaii-text">Our Bucket List</span>
          <span className="text-[10px] text-kawaii-muted mt-0.5">Dreams together</span>
        </Link>

        <Link
          href="/notes"
          onClick={() => soundEngine.playClick()}
          className="group p-4 rounded-3xl bg-white/90 hover:bg-pink-50/50 border border-pink-100 shadow-sm transition-all active:scale-95 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <MessageCircleHeart className="w-6 h-6" />
          </div>
          <span className="font-heading font-bold text-xs sm:text-sm text-kawaii-text">Love Notes</span>
          <span className="text-[10px] text-kawaii-muted mt-0.5">Sweet letters & stickers</span>
        </Link>

        <Link
          href="/corner?tab=calendar"
          onClick={() => soundEngine.playClick()}
          className="group p-4 rounded-3xl bg-white/90 hover:bg-pink-50/50 border border-pink-100 shadow-sm transition-all active:scale-95 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="font-heading font-bold text-xs sm:text-sm text-kawaii-text">Our Calendar</span>
          <span className="text-[10px] text-kawaii-muted mt-0.5">Dates & milestones</span>
        </Link>

        <Link
          href="/corner?tab=gifts"
          onClick={() => soundEngine.playClick()}
          className="group p-4 rounded-3xl bg-white/90 hover:bg-pink-50/50 border border-pink-100 shadow-sm transition-all active:scale-95 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Gift className="w-6 h-6" />
          </div>
          <span className="font-heading font-bold text-xs sm:text-sm text-kawaii-text">Gift Box</span>
          <span className="text-[10px] text-kawaii-muted mt-0.5">Send flowers & bears</span>
        </Link>
      </div>
    </div>
  );
}

