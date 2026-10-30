'use client';

import React, { useState, useEffect } from 'react';
import { GameShell } from '@/components/games/GameShell';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { GUESS_MY_ANSWER_ITEMS, GuessMyAnswerItem } from '@/lib/games/data';
import { soundEngine } from '@/lib/sound/soundEngine';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export default function GuessMyAnswerPage() {
  const { profile } = useAuth();
  const { partner, activeGame, updateGameSession } = useRoom();

  const [questionIdx, setQuestionIdx] = useState(0);
  const [actualChoice, setActualChoice] = useState<number | null>(null);
  const [guessChoice, setGuessChoice] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});

  const currentItem = GUESS_MY_ANSWER_ITEMS[questionIdx] || GUESS_MY_ANSWER_ITEMS[0];
  const isTargetPartner = questionIdx % 2 === 0 ? profile?.id : partner?.user_id;
  const isMyTurnToPickAnswer = isTargetPartner === profile?.id;

  const initGame = () => {
    soundEngine.playPop();
    setQuestionIdx(0);
    setActualChoice(null);
    setGuessChoice(null);
    setIsRevealed(false);
    const initScores = { [profile?.id || 'p1']: 0, ...(partner ? { [partner.user_id]: 0 } : {}) };
    setScores(initScores);

    updateGameSession({
      game_type: 'guess_my_answer',
      round_number: 1,
      total_rounds: GUESS_MY_ANSWER_ITEMS.length,
      scores: initScores,
      game_state: {
        questionIdx: 0,
        actualChoice: null,
        guessChoice: null,
        isRevealed: false,
      },
    });
  };

  useEffect(() => {
    if (activeGame?.game_type === 'guess_my_answer' && activeGame.game_state) {
      setQuestionIdx(activeGame.game_state.questionIdx || 0);
      setActualChoice(activeGame.game_state.actualChoice);
      setGuessChoice(activeGame.game_state.guessChoice);
      setIsRevealed(activeGame.game_state.isRevealed || false);
      setScores(activeGame.scores || {});
    } else {
      initGame();
    }
  }, [activeGame?.id, activeGame?.game_state]);

  const handlePickOption = (idx: number) => {
    if (isRevealed) return;
    soundEngine.playClick();

    if (isMyTurnToPickAnswer) {
      setActualChoice(idx);
      updateGameSession({
        game_state: {
          questionIdx,
          actualChoice: idx,
          guessChoice,
          isRevealed: guessChoice !== null,
        },
      });
      if (guessChoice !== null) {
        checkReveal(idx, guessChoice);
      }
    } else {
      setGuessChoice(idx);
      updateGameSession({
        game_state: {
          questionIdx,
          actualChoice,
          guessChoice: idx,
          isRevealed: actualChoice !== null,
        },
      });
      if (actualChoice !== null) {
        checkReveal(actualChoice, idx);
      }
    }
  };

  const checkReveal = (actual: number, guess: number) => {
    soundEngine.playMatch();
    setIsRevealed(true);
    const isCorrect = actual === guess;
    const guessingUserId = !isMyTurnToPickAnswer ? (profile?.id || 'p1') : (partner?.user_id || 'partner');

    const nextScores = {
      ...scores,
      ...(isCorrect ? { [guessingUserId]: (scores[guessingUserId] || 0) + 1 } : {}),
    };
    setScores(nextScores);

    updateGameSession({
      scores: nextScores,
      game_state: {
        questionIdx,
        actualChoice: actual,
        guessChoice: guess,
        isRevealed: true,
      },
    });
  };

  const nextQuestion = () => {
    soundEngine.playPop();
    const nextIdx = (questionIdx + 1) % GUESS_MY_ANSWER_ITEMS.length;
    setQuestionIdx(nextIdx);
    setActualChoice(null);
    setGuessChoice(null);
    setIsRevealed(false);

    updateGameSession({
      round_number: nextIdx + 1,
      scores,
      game_state: {
        questionIdx: nextIdx,
        actualChoice: null,
        guessChoice: null,
        isRevealed: false,
      },
    });
  };

  return (
    <GameShell
      title="Guess My Answer 🎯"
      gameType="guess_my_answer"
      roundNumber={questionIdx + 1}
      totalRounds={GUESS_MY_ANSWER_ITEMS.length}
      scores={scores}
      onResetGame={initGame}
    >
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* Question Prompt */}
        <div className="p-5 rounded-3xl bg-pink-50/80 border border-pink-200 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white text-pink-700 text-[11px] font-bold mb-2">
            Round {questionIdx + 1}
          </span>
          <h3 className="font-heading font-bold text-lg sm:text-xl text-kawaii-text">
            {currentItem.question}
          </h3>
          <p className="text-xs text-pink-600 font-medium mt-2">
            {isMyTurnToPickAnswer
              ? 'Select your secret honest answer below:'
              : `Predict what ${partner?.profile?.nickname || 'your partner'} would pick:`}
          </p>
        </div>

        {/* 4 Options */}
        <div className="space-y-2.5">
          {currentItem.options.map((opt, idx) => {
            const isActual = actualChoice === idx;
            const isGuess = guessChoice === idx;

            let borderStyle = 'border-pink-100 bg-white hover:bg-pink-50/50';
            if (isRevealed) {
              if (isActual && isGuess) {
                borderStyle = 'border-emerald-400 bg-emerald-50 text-emerald-900 font-bold';
              } else if (isActual) {
                borderStyle = 'border-pink-400 bg-pink-50 font-bold';
              } else if (isGuess) {
                borderStyle = 'border-purple-300 bg-purple-50 line-through opacity-70';
              }
            } else {
              if ((isMyTurnToPickAnswer && isActual) || (!isMyTurnToPickAnswer && isGuess)) {
                borderStyle = 'border-pink-400 bg-pink-50 font-bold';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handlePickOption(idx)}
                disabled={isRevealed}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all active:scale-98 cursor-pointer shadow-xs flex items-center justify-between gap-3 ${borderStyle}`}
              >
                <span className="text-xs sm:text-sm text-kawaii-text font-medium">{opt}</span>
                {isRevealed && isActual && isGuess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Correct!
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Reveal or Next Button */}
        {isRevealed && (
          <div className="space-y-3 animate-in zoom-in-95 duration-200">
            <div className="p-3 bg-pink-50 rounded-2xl text-center text-xs font-bold text-pink-800">
              {actualChoice === guessChoice
                ? '🎉 Spot on prediction! +1 Point!'
                : '🌸 Good try! Now you know each other even better!'}
            </div>
            <button
              onClick={nextQuestion}
              className="w-full py-3.5 rounded-2xl bg-kawaii-pink hover:bg-kawaii-pink-deep text-white font-bold text-xs sm:text-sm shadow-kawaii active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}

