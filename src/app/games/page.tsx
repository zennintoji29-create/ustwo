'use client';

import React from 'react';
import Link from 'next/link';
import {
  Brain,
  Heart,
  Sparkles,
  HelpCircle,
  Flame,
  Laugh,
  Palette,
  Timer,
  SmilePlus,
  Mail,
  Camera,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useRoom } from '@/context/RoomContext';
import { GameType } from '@/types/database';
import { soundEngine } from '@/lib/sound/soundEngine';

interface GameInfo {
  type: GameType;
  title: string;
  tagline: string;
  icon: any;
  color: string;
  accent: string;
  category: 'core' | 'quiz' | 'realtime' | 'deep';
  duration: string;
}

const ALL_GAMES: GameInfo[] = [
  {
    type: 'memory_match',
    title: 'Memory Match',
    tagline: 'Match cute pastel icons in turns with 4 difficulty levels',
    icon: Brain,
    color: 'from-pink-400 to-rose-300',
    accent: 'text-pink-600 bg-pink-50 border-pink-200',
    category: 'core',
    duration: '3-5 min',
  },
  {
    type: 'tic_tac_toe',
    title: 'Tic-Tac-Toe: Love Edition',
    tagline: 'Hearts vs Stars! Classic strategy with cute animated win states',
    icon: Sparkles,
    color: 'from-rose-400 to-pink-400',
    accent: 'text-rose-600 bg-rose-50 border-rose-200',
    category: 'core',
    duration: '1-3 min',
  },
  {
    type: 'how_well_do_you_know_me',
    title: 'How Well Do You Know Me?',
    tagline: 'Answer cute questions and guess your partner’s true response',
    icon: Heart,
    color: 'from-fuchsia-400 to-pink-400',
    accent: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200',
    category: 'quiz',
    duration: '5-10 min',
  },
  {
    type: 'truth_or_dare',
    title: 'Truth or Dare 🎀',
    tagline: 'Romantic, cute & playful truths and safe couple dares',
    icon: Flame,
    color: 'from-amber-400 to-rose-300',
    accent: 'text-amber-700 bg-amber-50 border-amber-200',
    category: 'core',
    duration: '5-15 min',
  },
  {
    type: 'would_you_rather',
    title: 'Would You Rather? 🤔',
    tagline: 'Choose between two cute dilemmas and see if your hearts align',
    icon: HelpCircle,
    color: 'from-blue-400 to-indigo-300',
    accent: 'text-blue-700 bg-blue-50 border-blue-200',
    category: 'quiz',
    duration: '3-5 min',
  },
  {
    type: 'guess_my_answer',
    title: 'Guess My Answer 🎯',
    tagline: 'Secretly select your answer and let your love predict it',
    icon: Layers,
    color: 'from-teal-400 to-emerald-300',
    accent: 'text-teal-700 bg-teal-50 border-teal-200',
    category: 'quiz',
    duration: '3-5 min',
  },
  {
    type: 'draw_and_guess',
    title: 'Draw & Guess 🎨',
    tagline: 'Live synchronized whiteboard drawing game with brush tools',
    icon: Palette,
    color: 'from-purple-400 to-pink-300',
    accent: 'text-purple-700 bg-purple-50 border-purple-200',
    category: 'realtime',
    duration: '5-10 min',
  },
  {
    type: 'who_is_more_likely',
    title: 'Who Is More Likely To...? 😂',
    tagline: 'Vote on hilarious couple situations and reveal votes together',
    icon: Laugh,
    color: 'from-amber-400 to-yellow-300',
    accent: 'text-amber-800 bg-amber-50 border-amber-200',
    category: 'quiz',
    duration: '3-5 min',
  },
  {
    type: 'rapid_fire',
    title: 'Rapid Fire ⚡',
    tagline: 'Fast synchronized 10-second countdown couple question challenge',
    icon: Timer,
    color: 'from-orange-400 to-rose-400',
    accent: 'text-orange-700 bg-orange-50 border-orange-200',
    category: 'realtime',
    duration: '2-4 min',
  },
  {
    type: 'emoji_decoder',
    title: 'Emoji Decoder 😭',
    tagline: 'Decipher romantic and pop culture phrases written in emojis',
    icon: SmilePlus,
    color: 'from-pink-400 to-yellow-300',
    accent: 'text-pink-700 bg-pink-50 border-pink-200',
    category: 'quiz',
    duration: '3-6 min',
  },
  {
    type: 'secret_questions',
    title: 'Secret Questions 💌',
    tagline: 'Answer deep questions in private lockboxes, then mutually reveal',
    icon: Mail,
    color: 'from-indigo-400 to-purple-300',
    accent: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    category: 'deep',
    duration: '5-10 min',
  },
  {
    type: 'memory_lane',
    title: 'Our Memory Lane 📸',
    tagline: 'Timeline of shared moments, special dates & memory quizzes',
    icon: Camera,
    color: 'from-rose-400 to-amber-300',
    accent: 'text-rose-700 bg-rose-50 border-rose-200',
    category: 'deep',
    duration: '5-15 min',
  },
];

export default function GamesDirectoryPage() {
  const { room, isPartnerOnline } = useRoom();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Directory Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/80 text-pink-700 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>All 12 Playable Multiplayer Games</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-kawaii-text">
          Couple Game Collection 🎮
        </h1>
        <p className="text-xs sm:text-sm text-kawaii-muted mt-1.5">
          Pick any game below. Both players’ turns, scores, and actions are synchronized across the internet in real time!
        </p>
      </div>

      {/* Partner Status Hint */}
      {!isPartnerOnline && (
        <div className="p-3 bg-pink-50/80 rounded-2xl border border-pink-200 text-xs text-pink-800 text-center max-w-md mx-auto">
          Tip: Invite your partner to your room so both of you play on two separate devices!
        </div>
      )}

      {/* Grid of 12 Games */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {ALL_GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <Link
              key={game.type}
              href={`/games/${game.type}`}
              onClick={() => soundEngine.playClick()}
              className="group bg-white/90 hover:bg-white rounded-3xl p-5 border border-pink-100 shadow-sm hover:shadow-kawaii transition-all duration-200 active:scale-98 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${game.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${game.accent}`}>
                    {game.duration}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base sm:text-lg text-kawaii-text group-hover:text-kawaii-pink transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs text-kawaii-muted mt-1 leading-relaxed">
                  {game.tagline}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between text-xs font-bold text-kawaii-pink">
                <span>Play Together 💗</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
