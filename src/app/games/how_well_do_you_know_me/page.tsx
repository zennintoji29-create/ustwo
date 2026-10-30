'use client';

import React, { useState, useEffect } from 'react';
import { GameShell } from '@/components/games/GameShell';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS, QuizQuestion } from '@/lib/games/data';
import { soundEngine } from '@/lib/sound/soundEngine';
import { Sparkles, Check, Send, Eye } from 'lucide-react';

export default function HowWellDoYouKnowMePage() {
  const { profile } = useAuth();
  const { partner, activeGame, updateGameSession } = useRoom();

  const [questionIdx, setQuestionIdx] = useState(0);
  const [actualAnswer, setActualAnswer] = useState('');
  const [guessAnswer, setGuessAnswer] = useState('');
  const [phase, setPhase] = useState<'answering' | 'guessing' | 'revealed'>('answering');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [winnerId, setWinnerId] = useState<string | null>(null);

  const currentQ = HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS[questionIdx] || HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS[0];
  const isAnsweringPartner = questionIdx % 2 === 0 ? profile?.id : partner?.user_id;
  const isMyTurnToAnswer = isAnsweringPartner === profile?.id;

  const initGame = () => {
    soundEngine.playPop();
    setQuestionIdx(0);
    setActualAnswer('');
    setGuessAnswer('');
    setPhase('answering');
    const initScores = { [profile?.id || 'p1']: 0, ...(partner ? { [partner.user_id]: 0 } : {}) };
    setScores(initScores);
    setWinnerId(null);

    updateGameSession({
      game_type: 'how_well_do_you_know_me',
      round_number: 1,
      total_rounds: HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS.length,
      scores: initScores,
      game_state: { questionIdx: 0, actualAnswer: '', guessAnswer: '', phase: 'answering' },
    });
  };

  useEffect(() => {
    if (activeGame?.game_type === 'how_well_do_you_know_me' && activeGame.game_state) {
      setQuestionIdx(activeGame.game_state.questionIdx || 0);
      setActualAnswer(activeGame.game_state.actualAnswer || '');
      setGuessAnswer(activeGame.game_state.guessAnswer || '');
      setPhase(activeGame.game_state.phase || 'answering');
      setScores(activeGame.scores || {});
    }
  }, [activeGame?.id, activeGame?.game_state]);

  const submitActualAnswer = () => {
    if (!actualAnswer.trim()) return;
    soundEngine.playClick();
    setPhase('guessing');
    updateGameSession({
      game_state: {
        questionIdx,
        actualAnswer,
        guessAnswer: '',
        phase: 'guessing',
      },
    });
  };

  const submitGuess = () => {
    if (!guessAnswer.trim()) return;
    soundEngine.playPop();
    setPhase('revealed');
    updateGameSession({
      game_state: {
        questionIdx,
        actualAnswer,
        guessAnswer,
        phase: 'revealed',
      },
    });
  };

  const awardPointAndNext = (awarded: boolean) => {
    soundEngine.playMatch();
    const guessingUserId = isMyTurnToAnswer ? (partner?.user_id || 'partner') : (profile?.id || 'p1');
    const nextScores = {
      ...scores,
      ...(awarded ? { [guessingUserId]: (scores[guessingUserId] || 0) + 1 } : {}),
    };

    const nextIdx = questionIdx + 1;
    if (nextIdx >= HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS.length) {
      setWinnerId(guessingUserId);
      updateGameSession({
        winner_id: guessingUserId,
        scores: nextScores,
      });
      return;
    }

    setQuestionIdx(nextIdx);
    setActualAnswer('');
    setGuessAnswer('');
    setPhase('answering');
    setScores(nextScores);

    updateGameSession({
      round_number: nextIdx + 1,
      scores: nextScores,
      game_state: {
        questionIdx: nextIdx,
        actualAnswer: '',
        guessAnswer: '',
        phase: 'answering',
      },
    });
  };

  return (
    <GameShell
      title="How Well Do You Know Me? 💕"
      gameType="how_well_do_you_know_me"
      roundNumber={questionIdx + 1}
      totalRounds={HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS.length}
      scores={scores}
      winnerId={winnerId}
      onResetGame={initGame}
    >
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* Question Card */}
        <div className="p-5 rounded-3xl bg-pink-50/80 border border-pink-200 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white text-pink-700 text-[11px] font-bold mb-2 shadow-2xs">
            Question #{questionIdx + 1}
          </span>
          <h3 className="font-heading font-bold text-lg sm:text-xl text-kawaii-text">
            {currentQ.question}
          </h3>
          <p className="text-xs text-pink-600 font-medium mt-2">
            Target:{' '}
            <span className="font-bold">
              {isMyTurnToAnswer ? `${profile?.nickname || 'You'} answers` : `${partner?.profile?.nickname || 'Partner'} answers`}
            </span>
          </p>
        </div>

        {/* Phase 1: Answering */}
        {phase === 'answering' && (
          <div className="space-y-3">
            {isMyTurnToAnswer ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-kawaii-text">
                  Write your real, honest answer (kept secret until partner guesses!):
                </label>
                <textarea
                  rows={3}
                  value={actualAnswer}
                  onChange={(e) => setActualAnswer(e.target.value)}
                  placeholder="e.g. Garlic butter pasta, or warm tea with cookies..."
                  className="w-full p-3 rounded-2xl border border-pink-200 bg-white text-xs sm:text-sm text-kawaii-text focus:outline-pink-400"
                />
                <button
                  onClick={submitActualAnswer}
                  disabled={!actualAnswer.trim()}
                  className="w-full py-3 rounded-2xl bg-kawaii-pink hover:bg-kawaii-pink-deep text-white font-bold text-xs shadow-kawaii active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Lock in My Secret Answer 💌</span>
                </button>
              </div>
            ) : (
              <div className="p-6 text-center bg-white rounded-3xl border border-pink-100 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center mx-auto animate-pulse">
                  <Eye className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-kawaii-text">
                  Waiting for {partner?.profile?.nickname || 'Partner'} to write their secret answer...
                </p>
                <p className="text-[11px] text-kawaii-muted">Get ready to make your best guess!</p>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Guessing */}
        {phase === 'guessing' && (
          <div className="space-y-3">
            {!isMyTurnToAnswer ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-kawaii-text">
                  What do you think {partner?.profile?.nickname || 'your partner'} answered?
                </label>
                <textarea
                  rows={3}
                  value={guessAnswer}
                  onChange={(e) => setGuessAnswer(e.target.value)}
                  placeholder="Take your best guess..."
                  className="w-full p-3 rounded-2xl border border-pink-200 bg-white text-xs sm:text-sm text-kawaii-text focus:outline-pink-400"
                />
                <button
                  onClick={submitGuess}
                  disabled={!guessAnswer.trim()}
                  className="w-full py-3 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-kawaii active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit My Guess! ✨</span>
                </button>
              </div>
            ) : (
              <div className="p-6 text-center bg-white rounded-3xl border border-pink-100 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center mx-auto animate-bounce">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-kawaii-text">
                  Your answer is locked! Waiting for {partner?.profile?.nickname || 'Partner'} to guess...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Phase 3: Revealed & Score award */}
        {phase === 'revealed' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
                <p className="text-[11px] font-bold text-pink-700 uppercase tracking-wide">
                  Real Answer
                </p>
                <p className="font-bold text-xs sm:text-sm text-kawaii-text mt-1">{actualAnswer}</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">
                  Partner’s Guess
                </p>
                <p className="font-bold text-xs sm:text-sm text-kawaii-text mt-1">{guessAnswer}</p>
              </div>
            </div>

            {/* Award Points Control */}
            <div className="p-4 rounded-3xl bg-white border border-pink-200 shadow-sm text-center space-y-2">
              <p className="text-xs font-bold text-kawaii-text">Was the guess close or correct?</p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => awardPointAndNext(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Yes! +1 Point 🎉</span>
                </button>
                <button
                  onClick={() => awardPointAndNext(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-kawaii-muted font-bold text-xs active:scale-95"
                >
                  <span>Not quite (Next)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}

