'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  MessageCircleHeart,
  Gamepad2,
  Gift,
  Calendar,
  BookmarkCheck,
  ArrowRight,
  Smile,
  Lock,
} from 'lucide-react';
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
    toggleReady,
    updateMood,
    sendReaction,
  } = useRoom();

  const [showMoodMenu, setShowMoodMenu] = useState(false);

  const getMoodEmoji = (moodId?: string) => {
    return MOODS.find((m) => m.id === moodId)?.emoji || '😊';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="kawaii-card p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-xs font-extrabold text-pink-700 mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Room {room?.code}</span>
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-kawaii-text">
              Our Little World 💗
            </h1>
            <p className="text-xs sm:text-sm text-kawaii-text-muted font-medium mt-1">
              Two hearts connected in real time. Choose a game or share a sweet moment!
            </p>
          </div>

          {/* Connection Status Pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 border border-pink-100 shadow-xs">
            <div
              className={`w-3 h-3 rounded-full ${
                isPartnerOnline
                  ? 'bg-emerald-400 ring-4 ring-emerald-100 animate-pulse'
                  : isPartnerReconnecting
                  ? 'bg-amber-400 ring-4 ring-amber-100 animate-bounce'
                  : 'bg-rose-300 ring-4 ring-rose-100'
              }`}
            />
            <span className="text-xs font-extrabold text-kawaii-text">
              {isPartnerOnline
                ? 'Partner Connected 💕'
                : isPartnerReconnecting
                ? 'Partner Reconnecting... ⏳'
                : 'Waiting for Partner 🌸'}
            </span>
          </div>
        </div>

        {/* Both Avatars Side by Side with Pulsing Heart Connector */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-14 relative">
          {/* Player 1 (Me) */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-400 via-rose-300 to-pink-300 shadow-kawaii"
              >
                <KawaiiAvatar id={profile?.avatar_id || 'bunny'} size={88} className="w-full h-full" />
              </motion.div>
              {/* Mood Badge */}
              <button
                onClick={() => {
                  soundEngine.playPop();
                  setShowMoodMenu(!showMoodMenu);
                }}
                title="Change your mood"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-pink-200 shadow-md flex items-center justify-center text-base hover:scale-115 active:scale-95 transition-all touch-target cursor-pointer"
              >
                {getMoodEmoji(myMember?.mood)}
              </button>
            </div>
            <p className="font-heading font-extrabold text-sm text-kawaii-text mt-2.5">
              {profile?.nickname || 'You'} <span className="text-xs text-pink-500 font-semibold">(You)</span>
            </p>

            {/* Ready State */}
            <div className="mt-1 flex items-center gap-1 text-xs">
              {myMember?.is_ready ? (
                <span className="flex items-center gap-1 font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Ready!
                </span>
              ) : (
                <span className="flex items-center gap-1 text-kawaii-text-muted font-bold bg-pink-50/70 px-2 py-0.5 rounded-full">
                  <Circle className="w-3.5 h-3.5" /> Not ready
                </span>
              )}
            </div>

            {/* Mood Dropdown */}
            <AnimatePresence>
              {showMoodMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute top-28 z-30 p-2 bg-white rounded-3xl shadow-kawaii border border-pink-200 grid grid-cols-4 gap-1.5"
                >
                  {MOODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        updateMood(m.id);
                        setShowMoodMenu(false);
                      }}
                      className="flex flex-col items-center p-2 rounded-2xl hover:bg-pink-50 transition-all text-xs touch-target cursor-pointer"
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-[10px] text-kawaii-text font-bold mt-0.5">{m.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Heart Connector */}
          <div className="flex flex-col items-center justify-center my-1 sm:my-0">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-kawaii-pink shadow-kawaii-sm"
            >
              <Heart className="w-6 h-6 fill-kawaii-pink text-kawaii-pink" />
            </motion.div>
            <span className="text-[10px] font-extrabold text-pink-600 mt-1 uppercase tracking-wider">UsTwo</span>
          </div>

          {/* Player 2 (Partner) */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`w-24 h-24 rounded-full p-1 shadow-kawaii transition-all ${
                  isPartnerOnline
                    ? 'bg-gradient-to-tr from-purple-400 via-indigo-300 to-purple-300 ring-4 ring-purple-100'
                    : 'bg-gray-200 opacity-60'
                }`}
              >
                <KawaiiAvatar
                  id={partner?.profile?.avatar_id || 'kitty'}
                  size={88}
                  className="w-full h-full"
                />
              </motion.div>
              {/* Partner Mood Badge */}
              {isPartnerOnline && (
                <div
                  title={`Partner is feeling ${partner?.mood || 'happy'}`}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-purple-200 shadow-md flex items-center justify-center text-base"
                >
                  {getMoodEmoji(partner?.mood)}
                </div>
              )}
            </div>
            <p className="font-heading font-extrabold text-sm text-kawaii-text mt-2.5">
              {partner?.profile?.nickname || 'Partner'}
            </p>

            {/* Ready State */}
            <div className="mt-1 flex items-center gap-1 text-xs">
              {isPartnerOnline ? (
                partner?.is_ready ? (
                  <span className="flex items-center gap-1 font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Ready!
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-kawaii-text-muted font-bold bg-pink-50/70 px-2 py-0.5 rounded-full">
                    <Circle className="w-3.5 h-3.5" /> Waiting...
                  </span>
                )
              ) : (
                <span className="text-xs text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-full">Offline</span>
              )}
            </div>
          </div>
        </div>

        {/* Ready Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={toggleReady}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm transition-all shadow-kawaii active:scale-95 flex items-center justify-center gap-2 cursor-pointer touch-target ${
              myMember?.is_ready
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 hover:from-pink-600 hover:to-rose-500 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{myMember?.is_ready ? "I'm Ready! (Tap to unready)" : "I'm Ready to Play! 💗"}</span>
          </motion.button>

          <Link
            href="/games"
            onClick={() => soundEngine.playClick()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-pink-50/70 text-kawaii-pink border-2 border-pink-200 font-extrabold text-sm transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2 touch-target"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Browse All 12 Games 🎮</span>
          </Link>
        </div>
      </motion.div>

      {/* Live Reactions Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-xs border border-pink-100 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-xs font-extrabold text-kawaii-text-muted whitespace-nowrap hidden sm:inline">
          Send Love:
        </span>
        <div className="flex items-center gap-2 flex-1 justify-around">
          {REACTION_EMOJIS.map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.35 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => sendReaction(emoji)}
              className="text-2xl p-1 select-none cursor-pointer touch-target flex items-center justify-center"
              title={`Send ${emoji}`}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Highlights & Previews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Question Preview */}
        <Link
          href="/corner?tab=daily"
          onClick={() => soundEngine.playClick()}
          className="kawaii-card-interactive p-5 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Daily Streak</span>
              </span>
              <span className="text-xs font-bold text-pink-600">Answer 🌸</span>
            </div>
            <h3 className="font-heading font-extrabold text-sm text-kawaii-text mt-1 group-hover:text-kawaii-pink transition-colors">
              Today&apos;s Couple Question
            </h3>
            <p className="text-xs text-kawaii-text-muted font-medium mt-1 leading-relaxed">
              &ldquo;What is one small thing that made you smile thinking of me this week?&rdquo;
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-pink-50 flex items-center justify-between text-xs font-bold text-pink-600">
            <span>Lock in your answer</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Bucket List Preview */}
        <Link
          href="/corner?tab=bucket"
          onClick={() => soundEngine.playClick()}
          className="kawaii-card-interactive p-5 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700">
                <BookmarkCheck className="w-3.5 h-3.5 text-pink-500" />
                <span>Bucket List</span>
              </span>
              <span className="text-xs font-bold text-emerald-600">1 Completed ✨</span>
            </div>
            <h3 className="font-heading font-extrabold text-sm text-kawaii-text mt-1 group-hover:text-kawaii-pink transition-colors">
              Our Shared Dreams
            </h3>
            <p className="text-xs text-kawaii-text-muted font-medium mt-1 leading-relaxed">
              Watch cherry blossoms in Japan, cook homemade pasta from scratch...
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-pink-50 flex items-center justify-between text-xs font-bold text-pink-600">
            <span>View all couple goals</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Love Notes Preview */}
        <Link
          href="/notes"
          onClick={() => soundEngine.playClick()}
          className="kawaii-card-interactive p-5 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700">
                <MessageCircleHeart className="w-3.5 h-3.5 text-purple-500" />
                <span>Mailbox</span>
              </span>
              <span className="text-xs font-bold text-purple-600">Sweet Letters 💌</span>
            </div>
            <h3 className="font-heading font-extrabold text-sm text-kawaii-text mt-1 group-hover:text-kawaii-pink transition-colors">
              Love Notes
            </h3>
            <p className="text-xs text-kawaii-text-muted font-medium mt-1 leading-relaxed">
              Send sweet digital letters with pastel stationery & stickers.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-pink-50 flex items-center justify-between text-xs font-bold text-purple-600">
            <span>Write a letter</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Quick Corner Activities */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/corner?tab=bucket"
          onClick={() => soundEngine.playClick()}
          className="kawaii-card-interactive p-4 flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <span className="font-heading font-extrabold text-xs sm:text-sm text-kawaii-text">Our Bucket List</span>
          <span className="text-[10px] text-kawaii-text-muted font-bold mt-0.5">Dreams together</span>
        </Link>

        <Link
          href="/notes"
          onClick={() => soundEngine.playClick()}
          className="kawaii-card-interactive p-4 flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <MessageCircleHeart className="w-6 h-6" />
          </div>
          <span className="font-heading font-extrabold text-xs sm:text-sm text-kawaii-text">Love Notes</span>
          <span className="text-[10px] text-kawaii-text-muted font-bold mt-0.5">Letters & stickers</span>
        </Link>

        <Link
          href="/corner?tab=calendar"
          onClick={() => soundEngine.playClick()}
          className="kawaii-card-interactive p-4 flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="font-heading font-extrabold text-xs sm:text-sm text-kawaii-text">Our Calendar</span>
          <span className="text-[10px] text-kawaii-text-muted font-bold mt-0.5">Dates & milestones</span>
        </Link>

        <Link
          href="/corner?tab=gifts"
          onClick={() => soundEngine.playClick()}
          className="kawaii-card-interactive p-4 flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Gift className="w-6 h-6" />
          </div>
          <span className="font-heading font-extrabold text-xs sm:text-sm text-kawaii-text">Gift Box</span>
          <span className="text-[10px] text-kawaii-text-muted font-bold mt-0.5">Send flowers & bears</span>
        </Link>
      </div>
    </div>
  );
}
