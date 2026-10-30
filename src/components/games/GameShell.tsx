'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Heart, Home } from 'lucide-react';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { KawaiiAvatar } from '@/lib/avatars';
import { soundEngine } from '@/lib/sound/soundEngine';

interface GameShellProps {
  title: string;
  gameType: string;
  currentTurnId?: string | null;
  roundNumber?: number;
  totalRounds?: number;
  scores?: Record<string, number>;
  winnerId?: string | null;
  onResetGame?: () => void;
  children: React.ReactNode;
}

export function GameShell({
  title,
  currentTurnId,
  roundNumber = 1,
  totalRounds = 5,
  scores = {},
  winnerId,
  onResetGame,
  children,
}: GameShellProps) {
  const { profile } = useAuth();
  const { partner, isPartnerOnline } = useRoom();

  const isMyTurn = currentTurnId === profile?.id;
  const isGameOver = Boolean(winnerId);
  const prevTurnRef = useRef<string | null | undefined>(currentTurnId);

  const triggerConfetti = () => {
    soundEngine.playWin();
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#FF6B95', '#F7B8D0', '#E8DDFB', '#FFDCCB', '#FFD6E7', '#FDE047'],
    });
  };

  useEffect(() => {
    if (winnerId) {
      triggerConfetti();
    }
  }, [winnerId]);

  // Audio cues when turn changes to me
  useEffect(() => {
    if (prevTurnRef.current !== currentTurnId && currentTurnId === profile?.id) {
      soundEngine.playPop();
    }
    prevTurnRef.current = currentTurnId;
  }, [currentTurnId, profile?.id]);

  const myScore = profile ? scores[profile.id] || 0 : 0;
  const partnerScore = partner ? scores[partner.user_id] || 0 : 0;

  const winnerIsMe = winnerId === profile?.id;
  const isTie = winnerId === 'tie' || (winnerId && myScore === partnerScore);
  const winningAvatar = isTie
    ? 'bunny'
    : winnerIsMe
    ? profile?.avatar_id || 'bunny'
    : partner?.profile?.avatar_id || 'kitty';
  const winnerName = isTie
    ? 'Both of You!'
    : winnerIsMe
    ? profile?.nickname || 'You'
    : partner?.profile?.nickname || 'Partner';

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-4 relative">
      {/* Game Header Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 shadow-sm border border-pink-100 flex items-center justify-between gap-2">
        <Link
          href="/games"
          onClick={() => soundEngine.playClick()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-kawaii-pink text-xs font-bold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Games</span>
        </Link>

        {/* Title & Round */}
        <div className="text-center">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-kawaii-text">{title}</h2>
          <span className="text-[11px] font-bold text-kawaii-muted">
            Round {roundNumber} of {totalRounds}
          </span>
        </div>

        {/* Reset / Rematch */}
        {onResetGame && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onResetGame();
            }}
            title="Reset Game / Rematch"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-pink-50 text-kawaii-muted hover:text-kawaii-pink border border-pink-100 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rematch</span>
          </button>
        )}
      </div>

      {/* Scoreboard & Turn Banner */}
      <div className="bg-white/85 rounded-3xl p-3 sm:p-4 shadow-sm border border-pink-100 flex items-center justify-between gap-3">
        {/* Player 1 (Me) */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <KawaiiAvatar id={profile?.avatar_id || 'bunny'} size={40} />
            {isMyTurn && !isGameOver && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-kawaii-text truncate max-w-[80px] sm:max-w-[120px]">
              {profile?.nickname || 'You'}
            </p>
            <p className="text-xs font-extrabold text-pink-600">{myScore} pts</p>
          </div>
        </div>

        {/* Turn Status Badge */}
        <div className="text-center px-3.5 py-1.5 rounded-2xl bg-pink-50/90 border border-pink-200">
          {isGameOver ? (
            <span className="text-xs font-extrabold text-pink-700 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
              <span>Game Complete!</span>
            </span>
          ) : currentTurnId ? (
            <motion.span
              animate={isMyTurn ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`text-xs font-bold flex items-center gap-1 ${
                isMyTurn ? 'text-emerald-700' : 'text-purple-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>{isMyTurn ? 'Your Turn! 🌸' : `${partner?.profile?.nickname || 'Partner'}’s Turn ⏳`}</span>
            </motion.span>
          ) : (
            <span className="text-xs font-bold text-pink-700">Both Playing 💕</span>
          )}
        </div>

        {/* Player 2 (Partner) */}
        <div className="flex items-center gap-2 flex-row-reverse text-right">
          <div className="relative">
            <KawaiiAvatar id={partner?.profile?.avatar_id || 'kitty'} size={40} />
            {!isMyTurn && currentTurnId === partner?.user_id && !isGameOver && (
              <span className="absolute -top-1 -left-1 w-3 h-3 bg-purple-400 border-2 border-white rounded-full animate-ping" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-kawaii-text truncate max-w-[80px] sm:max-w-[120px]">
              {partner?.profile?.nickname || 'Partner'}
            </p>
            <p className="text-xs font-extrabold text-purple-600">{partnerScore} pts</p>
          </div>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="bg-white/95 rounded-4xl p-4 sm:p-6 shadow-kawaii border border-pink-100 min-h-[420px] flex flex-col justify-center relative">
        {children}
      </div>

      {/* Full-Screen Victory Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-white rounded-4xl p-6 shadow-kawaii border-2 border-pink-200 text-center space-y-4"
            >
              <div className="inline-flex p-3 rounded-full bg-amber-100 text-amber-500 mb-1 shadow-xs">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <h3 className="font-heading font-extrabold text-2xl text-kawaii-text">
                  {isTie ? 'Sweet Perfect Tie! 💕' : `${winnerName} Wins! 🎉`}
                </h3>
                <p className="text-xs text-kawaii-muted font-medium mt-1">
                  What a fun game! You two are so connected.
                </p>
              </div>

              {/* Mascot Pair */}
              <div className="flex items-center justify-center gap-3 py-2">
                <KawaiiAvatar id={profile?.avatar_id || 'bunny'} size={60} />
                <Heart className="w-6 h-6 text-pink-400 fill-pink-400 animate-pulse" />
                <KawaiiAvatar id={partner?.profile?.avatar_id || 'kitty'} size={60} />
              </div>

              {/* Scores Card */}
              <div className="flex items-center justify-around p-3 bg-pink-50/70 rounded-2xl border border-pink-100 text-center">
                <div>
                  <span className="text-[11px] font-bold text-kawaii-muted">
                    {profile?.nickname || 'You'}
                  </span>
                  <p className="text-base font-extrabold text-pink-600">{myScore} pts</p>
                </div>
                <div className="w-px h-8 bg-pink-200" />
                <div>
                  <span className="text-[11px] font-bold text-kawaii-muted">
                    {partner?.profile?.nickname || 'Partner'}
                  </span>
                  <p className="text-base font-extrabold text-purple-600">{partnerScore} pts</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {onResetGame && (
                  <button
                    onClick={() => {
                      soundEngine.playPop();
                      onResetGame();
                    }}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-xs shadow-kawaii active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Rematch</span>
                  </button>
                )}
                <Link
                  href="/games"
                  onClick={() => soundEngine.playClick()}
                  className="px-4 py-3 rounded-2xl bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Home className="w-4 h-4" />
                  <span>Lobby</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
