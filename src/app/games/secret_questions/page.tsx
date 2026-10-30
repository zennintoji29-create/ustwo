'use client';

import React, { useState, useEffect } from 'react';
import { GameShell } from '@/components/games/GameShell';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { SECRET_QUESTIONS, SecretQuestionItem } from '@/lib/games/data';
import { soundEngine } from '@/lib/sound/soundEngine';
import { Lock, Unlock, Heart, ArrowRight, EyeOff } from 'lucide-react';
import { KawaiiAvatar } from '@/lib/avatars';

export default function SecretQuestionsPage() {
  const { profile } = useAuth();
  const { partner, activeGame, updateGameSession } = useRoom();

  const [questionIdx, setQuestionIdx] = useState(0);
  const [myAnswer, setMyAnswer] = useState('');
  const [myLocked, setMyLocked] = useState(false);
  const [partnerLocked, setPartnerLocked] = useState(false);
  const [partnerAnswer, setPartnerAnswer] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);

  const currentQ = SECRET_QUESTIONS[questionIdx] || SECRET_QUESTIONS[0];

  const initGame = () => {
    soundEngine.playPop();
    setQuestionIdx(0);
    setMyAnswer('');
    setMyLocked(false);
    setPartnerLocked(false);
    setPartnerAnswer('');
    setIsRevealed(false);

    updateGameSession({
      game_type: 'secret_questions',
      round_number: 1,
      total_rounds: SECRET_QUESTIONS.length,
      game_state: {
        questionIdx: 0,
        lockedMap: {},
        answersMap: {},
        isRevealed: false,
      },
    });
  };

  useEffect(() => {
    if (activeGame?.game_type === 'secret_questions' && activeGame.game_state) {
      setQuestionIdx(activeGame.game_state.questionIdx || 0);
      const lockedMap = activeGame.game_state.lockedMap || {};
      const answersMap = activeGame.game_state.answersMap || {};
      const revealed = Boolean(activeGame.game_state.isRevealed);

      if (profile) {
        setMyLocked(Boolean(lockedMap[profile.id]));
        if (!myAnswer) setMyAnswer(answersMap[profile.id] || '');
      }
      if (partner) {
        setPartnerLocked(Boolean(lockedMap[partner.user_id]));
        if (revealed) {
          setPartnerAnswer(answersMap[partner.user_id] || '');
        }
      }
      setIsRevealed(revealed);
    } else {
      initGame();
    }
  }, [activeGame?.id, activeGame?.game_state]);

  const handleLockAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myAnswer.trim() || !profile) return;
    soundEngine.playMatch();
    setMyLocked(true);

    const lockedMap = { ...(activeGame?.game_state?.lockedMap || {}), [profile.id]: true };
    const answersMap = { ...(activeGame?.game_state?.answersMap || {}), [profile.id]: myAnswer.trim() };

    // In local demo without 2nd partner, mock partner lock
    if (!partner) {
      lockedMap['partner_mock'] = true;
      answersMap['partner_mock'] = 'To always cherish every morning and evening together 💗';
      setPartnerLocked(true);
      setPartnerAnswer(answersMap['partner_mock']);
    }

    const bothLocked = partner ? Boolean(lockedMap[profile.id] && lockedMap[partner.user_id]) : true;

    updateGameSession({
      game_state: {
        questionIdx,
        lockedMap,
        answersMap,
        isRevealed: bothLocked,
      },
    });
  };

  const nextQuestion = () => {
    soundEngine.playPop();
    const nextIdx = (questionIdx + 1) % SECRET_QUESTIONS.length;
    setQuestionIdx(nextIdx);
    setMyAnswer('');
    setMyLocked(false);
    setPartnerLocked(false);
    setPartnerAnswer('');
    setIsRevealed(false);

    updateGameSession({
      round_number: nextIdx + 1,
      game_state: {
        questionIdx: nextIdx,
        lockedMap: {},
        answersMap: {},
        isRevealed: false,
      },
    });
  };

  return (
    <GameShell
      title="Secret Questions 💌"
      gameType="secret_questions"
      roundNumber={questionIdx + 1}
      totalRounds={SECRET_QUESTIONS.length}
      onResetGame={initGame}
    >
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* Question Header */}
        <div className="p-6 rounded-4xl bg-gradient-to-b from-indigo-50 to-pink-50 border border-indigo-100 text-center shadow-kawaii-sm">
          <span className="inline-block px-3 py-1 rounded-full bg-white text-indigo-700 text-[11px] font-bold mb-2">
            Category: {currentQ.category}
          </span>
          <h3 className="font-heading font-extrabold text-xl text-kawaii-text leading-relaxed">
            {currentQ.question}
          </h3>
          <p className="text-xs text-kawaii-muted mt-2">
            Answers remain private in encrypted lockboxes until both of you lock in your responses!
          </p>
        </div>

        {/* Lock Status Indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-2xl border border-pink-100 flex items-center gap-2">
            <KawaiiAvatar id={profile?.avatar_id || 'bunny'} size={32} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-kawaii-text truncate">{profile?.nickname || 'You'}</p>
              <span className={`text-[10px] font-extrabold flex items-center gap-1 ${myLocked ? 'text-emerald-600' : 'text-amber-600'}`}>
                {myLocked ? <Lock className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {myLocked ? 'Locked' : 'Drafting...'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-pink-100 flex items-center gap-2">
            <KawaiiAvatar id={partner?.profile?.avatar_id || 'kitty'} size={32} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-kawaii-text truncate">{partner?.profile?.nickname || 'Partner'}</p>
              <span className={`text-[10px] font-extrabold flex items-center gap-1 ${partnerLocked ? 'text-emerald-600' : 'text-amber-600'}`}>
                {partnerLocked ? <Lock className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {partnerLocked ? 'Locked' : 'Waiting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Private Textbox / Reveal */}
        {!isRevealed ? (
          <form onSubmit={handleLockAnswer} className="space-y-3">
            <label className="block text-xs font-bold text-kawaii-text">
              {myLocked ? 'Your locked secret answer (hidden from partner):' : 'Write your private answer:'}
            </label>
            <textarea
              rows={4}
              required
              disabled={myLocked}
              placeholder="Write your genuine, tender thoughts here..."
              value={myAnswer}
              onChange={(e) => setMyAnswer(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-pink-200 bg-white text-xs sm:text-sm text-kawaii-text focus:outline-pink-400 font-medium disabled:bg-gray-50 disabled:opacity-75"
            />
            {!myLocked ? (
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm shadow-kawaii active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Lock My Answer in Vault 💌</span>
              </button>
            ) : (
              <p className="text-center text-xs text-kawaii-muted font-medium animate-pulse">
                Your answer is locked! Waiting for {partner?.profile?.nickname || 'partner'} to lock theirs...
              </p>
            )}
          </form>
        ) : (
          /* Mutual Reveal */
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="p-3 bg-pink-100/90 rounded-2xl text-center text-xs font-bold text-pink-800 flex items-center justify-center gap-1.5">
              <Unlock className="w-4 h-4 text-pink-600" />
              <span>Both Answers Unlocked Together! 💗</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-pink-50/80 border border-pink-200">
                <p className="text-[11px] font-bold text-pink-700">{profile?.nickname || 'You'} wrote:</p>
                <p className="text-xs sm:text-sm text-kawaii-text font-medium mt-1 whitespace-pre-wrap">{myAnswer}</p>
              </div>

              <div className="p-4 rounded-3xl bg-purple-50/80 border border-purple-200">
                <p className="text-[11px] font-bold text-purple-700">{partner?.profile?.nickname || 'Partner'} wrote:</p>
                <p className="text-xs sm:text-sm text-kawaii-text font-medium mt-1 whitespace-pre-wrap">{partnerAnswer}</p>
              </div>
            </div>

            <button
              onClick={nextQuestion}
              className="w-full py-3.5 rounded-2xl bg-kawaii-pink hover:bg-kawaii-pink-deep text-white font-bold text-xs sm:text-sm shadow-kawaii active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next Secret Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}

