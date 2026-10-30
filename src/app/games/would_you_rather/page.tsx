'use client';

import React, { useState, useEffect } from 'react';
import { GameShell } from '@/components/games/GameShell';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { WOULD_YOU_RATHER_QUESTIONS, WouldYouRatherItem } from '@/lib/games/data';
import { soundEngine } from '@/lib/sound/soundEngine';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { KawaiiAvatar } from '@/lib/avatars';

export default function WouldYouRatherPage() {
  const { profile } = useAuth();
  const { partner, activeGame, updateGameSession } = useRoom();

  const [questionIdx, setQuestionIdx] = useState(0);
  const [myChoice, setMyChoice] = useState<'A' | 'B' | null>(null);
  const [partnerChoice, setPartnerChoice] = useState<'A' | 'B' | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [harmonyPoints, setHarmonyPoints] = useState(0);

  const currentItem = WOULD_YOU_RATHER_QUESTIONS[questionIdx] || WOULD_YOU_RATHER_QUESTIONS[0];

  const initGame = () => {
    soundEngine.playPop();
    setQuestionIdx(0);
    setMyChoice(null);
    setPartnerChoice(null);
    setIsRevealed(false);
    setHarmonyPoints(0);

    updateGameSession({
      game_type: 'would_you_rather',
      round_number: 1,
      total_rounds: WOULD_YOU_RATHER_QUESTIONS.length,
      game_state: {
        questionIdx: 0,
        choices: {},
        isRevealed: false,
        harmony: 0,
      },
    });
  };

  useEffect(() => {
    if (activeGame?.game_type === 'would_you_rather' && activeGame.game_state) {
      setQuestionIdx(activeGame.game_state.questionIdx || 0);
      const choices = activeGame.game_state.choices || {};
      if (profile) setMyChoice(choices[profile.id] || null);
      if (partner) setPartnerChoice(choices[partner.user_id] || null);
      setIsRevealed(activeGame.game_state.isRevealed || false);
      setHarmonyPoints(activeGame.game_state.harmony || 0);
    } else {
      initGame();
    }
  }, [activeGame?.id, activeGame?.game_state]);

  const selectChoice = (choice: 'A' | 'B') => {
    if (isRevealed || !profile) return;
    soundEngine.playClick();
    setMyChoice(choice);

    const currentChoices = activeGame?.game_state?.choices || {};
    const updatedChoices = { ...currentChoices, [profile.id]: choice };

    // Check if partner also already chosen
    const otherChoice = partner ? updatedChoices[partner.user_id] : choice; // In local test, auto matches
    const bothChosen = partner ? Boolean(updatedChoices[profile.id] && updatedChoices[partner.user_id]) : true;

    if (bothChosen) {
      soundEngine.playMatch();
      const isMatch = updatedChoices[profile.id] === otherChoice;
      const nextHarmony = isMatch ? harmonyPoints + 1 : harmonyPoints;
      setHarmonyPoints(nextHarmony);
      setIsRevealed(true);

      updateGameSession({
        game_state: {
          questionIdx,
          choices: updatedChoices,
          isRevealed: true,
          harmony: nextHarmony,
        },
      });
    } else {
      updateGameSession({
        game_state: {
          questionIdx,
          choices: updatedChoices,
          isRevealed: false,
          harmony: harmonyPoints,
        },
      });
    }
  };

  const nextQuestion = () => {
    soundEngine.playPop();
    const nextIdx = (questionIdx + 1) % WOULD_YOU_RATHER_QUESTIONS.length;
    setQuestionIdx(nextIdx);
    setMyChoice(null);
    setPartnerChoice(null);
    setIsRevealed(false);

    updateGameSession({
      round_number: nextIdx + 1,
      game_state: {
        questionIdx: nextIdx,
        choices: {},
        isRevealed: false,
        harmony: harmonyPoints,
      },
    });
  };

  const isMatched = myChoice && partnerChoice && myChoice === partnerChoice;

  return (
    <GameShell
      title="Would You Rather? 🤔"
      gameType="would_you_rather"
      roundNumber={questionIdx + 1}
      totalRounds={WOULD_YOU_RATHER_QUESTIONS.length}
      onResetGame={initGame}
    >
      <div className="max-w-md mx-auto w-full space-y-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-2">
            <Heart className="w-3.5 h-3.5 fill-pink-500" />
            <span>Couple Harmony: {harmonyPoints} matches</span>
          </span>
          <h3 className="font-heading font-extrabold text-xl text-kawaii-text">
            Which would you choose?
          </h3>
        </div>

        {/* Options A & B */}
        <div className="space-y-3">
          {/* Option A */}
          <button
            onClick={() => selectChoice('A')}
            disabled={isRevealed}
            className={`w-full p-5 rounded-3xl border-2 text-left transition-all active:scale-98 cursor-pointer shadow-sm relative overflow-hidden ${
              myChoice === 'A'
                ? 'bg-pink-50 border-pink-400 ring-2 ring-pink-200'
                : 'bg-white hover:bg-pink-50/50 border-pink-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-heading font-extrabold text-sm text-pink-600 mb-1">Option A</span>
              {isRevealed && partnerChoice === 'A' && (
                <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                  <KawaiiAvatar id={partner?.profile?.avatar_id || 'kitty'} size={22} />
                  <span>Partner Picked</span>
                </span>
              )}
            </div>
            <p className="font-bold text-sm sm:text-base text-kawaii-text">{currentItem.optionA}</p>
          </button>

          {/* Option B */}
          <button
            onClick={() => selectChoice('B')}
            disabled={isRevealed}
            className={`w-full p-5 rounded-3xl border-2 text-left transition-all active:scale-98 cursor-pointer shadow-sm relative overflow-hidden ${
              myChoice === 'B'
                ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200'
                : 'bg-white hover:bg-purple-50/50 border-purple-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-heading font-extrabold text-sm text-purple-600 mb-1">Option B</span>
              {isRevealed && partnerChoice === 'B' && (
                <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                  <KawaiiAvatar id={partner?.profile?.avatar_id || 'kitty'} size={22} />
                  <span>Partner Picked</span>
                </span>
              )}
            </div>
            <p className="font-bold text-sm sm:text-base text-kawaii-text">{currentItem.optionB}</p>
          </button>
        </div>

        {/* Status / Reveal */}
        {!isRevealed ? (
          <p className="text-center text-xs text-kawaii-muted">
            {myChoice
              ? 'Choice locked in! Waiting for partner to choose...'
              : 'Pick Option A or Option B above!'}
          </p>
        ) : (
          <div className="space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div
              className={`p-4 rounded-3xl border ${
                isMatched
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-pink-50 border-pink-200 text-pink-800'
              }`}
            >
              <p className="font-heading font-extrabold text-base">
                {isMatched ? '🎉 100% Match! Two hearts think alike!' : '💕 Cute opposites! Variety is the spice of love!'}
              </p>
            </div>

            <button
              onClick={nextQuestion}
              className="w-full py-3.5 rounded-2xl bg-kawaii-pink hover:bg-kawaii-pink-deep text-white font-bold text-xs sm:text-sm shadow-kawaii active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next Dilemma</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}

