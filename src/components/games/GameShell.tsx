'use client';

import React from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy } from 'lucide-react';
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

  const triggerConfetti = () => {
    soundEngine.playWin();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B95', '#F7B8D0', '#E8DDFB', '#FFDCCB', '#FFD6E7'],
    });
  };

  React.useEffect(() => {
    if (winnerId) {
      triggerConfetti();
    }
  }, [winnerId]);

  const myScore = profile ? scores[profile.id] || 0 : 0;
  const partnerScore = partner ? scores[partner.user_id] || 0 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      {/* Game Header Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-pink-100 flex items-center justify-between gap-2">
        <Link
          href="/games"
          onClick={() => soundEngine.playClick()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-kawaii-pink text-xs font-bold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        {/* Title & Round */}
        <div className="text-center">
          <h2 className="font-heading font-bold text-base sm:text-lg text-kawaii-text">{title}</h2>
          <span className="text-[11px] font-semibold text-kawaii-muted">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-pink-50 text-kawaii-muted hover:text-kawaii-pink border border-pink-100 text-xs font-bold transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rematch</span>
          </button>
        )}
      </div>

      {/* Scoreboard & Turn Banner */}
      <div className="bg-white/80 rounded-3xl p-3 sm:p-4 shadow-sm border border-pink-100 flex items-center justify-between gap-3">
        {/* Player 1 (Me) */}
        <div className="flex items-center gap-2">
          <KawaiiAvatar id={profile?.avatar_id || 'bunny'} size={38} />
          <div>
            <p className="text-xs font-bold text-kawaii-text truncate max-w-[80px] sm:max-w-[120px]">
              {profile?.nickname || 'You'}
            </p>
            <p className="text-xs font-extrabold text-pink-600">{myScore} pts</p>
          </div>
        </div>

        {/* Turn Status Badge */}
        <div className="text-center px-3 py-1.5 rounded-2xl bg-pink-50/80 border border-pink-200">
          {isGameOver ? (
            <span className="text-xs font-bold text-pink-700 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Game Complete!</span>
            </span>
          ) : currentTurnId ? (
            <span
              className={`text-xs font-bold flex items-center gap-1 ${
                isMyTurn ? 'text-emerald-700 animate-pulse' : 'text-purple-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isMyTurn ? 'Your Turn! 🌸' : `${partner?.profile?.nickname || 'Partner'}’s Turn ⏳`}</span>
            </span>
          ) : (
            <span className="text-xs font-bold text-pink-700">Both Playing 💕</span>
          )}
        </div>

        {/* Player 2 (Partner) */}
        <div className="flex items-center gap-2 flex-row-reverse text-right">
          <KawaiiAvatar id={partner?.profile?.avatar_id || 'kitty'} size={38} />
          <div>
            <p className="text-xs font-bold text-kawaii-text truncate max-w-[80px] sm:max-w-[120px]">
              {partner?.profile?.nickname || 'Partner'}
            </p>
            <p className="text-xs font-extrabold text-purple-600">{partnerScore} pts</p>
          </div>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="bg-white/95 rounded-4xl p-4 sm:p-6 shadow-kawaii border border-pink-100 min-h-[420px] flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
}

