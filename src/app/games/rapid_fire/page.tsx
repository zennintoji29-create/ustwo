'use client';

import React, { useState, useEffect } from 'react';
import { GameShell } from '@/components/games/GameShell';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { soundEngine } from '@/lib/sound/soundEngine';
import { Timer, Zap, Check, ArrowRight, Sparkles } from 'lucide-react';

const RAPID_PROMPTS = [
  'First food that comes to your mind right now! 🍕',
  'One city in the world we must visit next year! ✈️',
  'What color shirt looks best on me? 👕',
  'Favorite movie we have ever watched together! 🍿',
  'What is our couple anthem song? 🎵',
  'If we had 1 hour of free time together right now, what are we doing? 🧸',
  'Best dessert in the world! 🍰',
];

export default function RapidFirePage() {
  const { profile } = useAuth();
  const { partner, activeGame, updateGameSession } = useRoom();

  const [promptIdx, setPromptIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [myAnswer, setMyAnswer] = useState('');
  const [partnerAnswer, setPartnerAnswer] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});

  const currentPrompt = RAPID_PROMPTS[promptIdx] || RAPID_PROMPTS[0];

  const initGame = () => {
    soundEngine.playPop();
    setPromptIdx(0);
    setTimeLeft(10);
    setIsRunning(true);
    setMyAnswer('');
    setPartnerAnswer('');
    setIsRevealed(false);
    const initScores = { [profile?.id || 'p1']: 0, ...(partner ? { [partner.user_id]: 0 } : {}) };
    setScores(initScores);

    updateGameSession({
      game_type: 'rapid_fire',
      round_number: 1,
      total_rounds: RAPID_PROMPTS.length,
      scores: initScores,
      game_state: { promptIdx: 0, answers: {}, isRevealed: false },
    });
  };

  useEffect(() => {
    if (activeGame?.game_type === 'rapid_fire' && activeGame.game_state) {
      setPromptIdx(activeGame.game_state.promptIdx || 0);
      const answers = activeGame.game_state.answers || {};
      if (profile) setMyAnswer(answers[profile.id] || '');
      if (partner) setPartnerAnswer(answers[partner.user_id] || '');
      setIsRevealed(activeGame.game_state.isRevealed || false);
      setScores(activeGame.scores || {});
    } else {
      initGame();
    }
  }, [activeGame?.id, activeGame?.game_state]);

  // Synchronized countdown timer
  useEffect(() => {
    if (!isRunning || isRevealed) return;
    if (timeLeft <= 0) {
      soundEngine.playError();
      setIsRunning(false);
      setIsRevealed(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 4 && t > 1) {
          soundEngine.playClick();
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isRevealed]);

  const handleLockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myAnswer.trim() || isRevealed || !profile) return;
    soundEngine.playMatch();

    const currentAnswers = activeGame?.game_state?.answers || {};
    const updatedAnswers = { ...currentAnswers, [profile.id]: myAnswer.trim() };

    // In local demo without 2nd player, simulate partner response
    if (!partner) {
      updatedAnswers['partner_mock'] = myAnswer.trim();
      setPartnerAnswer(myAnswer.trim());
      setIsRevealed(true);
      setIsRunning(false);
    }

    const bothLocked = partner ? Boolean(updatedAnswers[profile.id] && updatedAnswers[partner.user_id]) : true;

    if (bothLocked) {
      setIsRevealed(true);
      setIsRunning(false);
    }

    updateGameSession({
      game_state: {
        promptIdx,
        answers: updatedAnswers,
        isRevealed: bothLocked,
      },
    });
  };

  const nextPrompt = () => {
    soundEngine.playPop();
    const nextIdx = (promptIdx + 1) % RAPID_PROMPTS.length;
    setPromptIdx(nextIdx);
    setTimeLeft(10);
    setIsRunning(true);
    setMyAnswer('');
    setPartnerAnswer('');
    setIsRevealed(false);

    updateGameSession({
      round_number: nextIdx + 1,
      scores,
      game_state: {
        promptIdx: nextIdx,
        answers: {},
        isRevealed: false,
      },
    });
  };

  const awardSyncPoint = () => {
    soundEngine.playWin();
    const currentId = profile?.id || 'p1';
    const nextScores = { ...scores, [currentId]: (scores[currentId] || 0) + 1 };
    setScores(nextScores);
    updateGameSession({ scores: nextScores });
  };

  return (
    <GameShell
      title="Rapid Fire ⚡"
      gameType="rapid_fire"
      roundNumber={promptIdx + 1}
      totalRounds={RAPID_PROMPTS.length}
      scores={scores}
      onResetGame={initGame}
    >
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* Timer Bar */}
        <div className="space-y-1.5 text-center">
          <div className="flex items-center justify-between text-xs font-bold text-kawaii-muted px-1">
            <span className="flex items-center gap-1 text-orange-600">
              <Zap className="w-4 h-4 fill-orange-500" /> Rapid Fire
            </span>
            <span className={`text-sm ${timeLeft <= 3 ? 'text-rose-600 font-extrabold animate-ping' : 'text-kawaii-text'}`}>
              {timeLeft}s remaining
            </span>
          </div>
          <div className="w-full h-3 bg-pink-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 3 ? 'bg-rose-500' : 'bg-gradient-to-r from-orange-400 to-pink-500'
              }`}
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Prompt Card */}
        <div className="p-6 rounded-4xl bg-orange-50/70 border border-orange-200 text-center shadow-kawaii-sm">
          <span className="inline-block px-3 py-1 rounded-full bg-white text-orange-800 text-[11px] font-bold mb-2">
            Round #{promptIdx + 1}
          </span>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-kawaii-text">
            {currentPrompt}
          </h3>
        </div>

        {/* Answer Form */}
        {!isRevealed ? (
          <form onSubmit={handleLockIn} className="space-y-3">
            <input
              type="text"
              required
              autoFocus
              placeholder="Quick! Type your answer..."
              value={myAnswer}
              onChange={(e) => setMyAnswer(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-orange-200 bg-white text-center font-bold text-base text-kawaii-text focus:outline-orange-400"
            />
            <button
              type="submit"
              disabled={!myAnswer.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm shadow-kawaii active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>Lock in Answer!</span>
            </button>
          </form>
        ) : (
          /* Simultaneous Reveal */
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-3xl bg-pink-50 border border-pink-200">
                <p className="text-[10px] font-bold text-pink-700 uppercase">You wrote</p>
                <p className="font-bold text-base text-kawaii-text mt-1">{myAnswer || 'No answer ⏳'}</p>
              </div>
              <div className="p-4 rounded-3xl bg-purple-50 border border-purple-200">
                <p className="text-[10px] font-bold text-purple-700 uppercase">Partner wrote</p>
                <p className="font-bold text-base text-kawaii-text mt-1">{partnerAnswer || 'No answer ⏳'}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={awardSyncPoint}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Answers Matched! (+1 pt) 🎉</span>
              </button>
              <button
                onClick={nextPrompt}
                className="px-5 py-2.5 rounded-xl bg-kawaii-pink hover:bg-kawaii-pink-deep text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Next Round</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}

