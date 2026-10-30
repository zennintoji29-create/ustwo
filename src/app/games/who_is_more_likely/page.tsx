'use client';

import React, { useState, useEffect } from 'react';
import { GameShell } from '@/components/games/GameShell';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { WHO_IS_MORE_LIKELY_ITEMS } from '@/lib/games/data';
import { soundEngine } from '@/lib/sound/soundEngine';
import { KawaiiAvatar } from '@/lib/avatars';
import { ArrowRight, Laugh } from 'lucide-react';

export default function WhoIsMoreLikelyPage() {
  const { profile } = useAuth();
  const { partner, activeGame, updateGameSession } = useRoom();

  const [questionIdx, setQuestionIdx] = useState(0);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [partnerVote, setPartnerVote] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [syncPoints, setSyncPoints] = useState(0);

  const currentItem = WHO_IS_MORE_LIKELY_ITEMS[questionIdx] || WHO_IS_MORE_LIKELY_ITEMS[0];

  const initGame = () => {
    soundEngine.playPop();
    setQuestionIdx(0);
    setMyVote(null);
    setPartnerVote(null);
    setIsRevealed(false);
    setSyncPoints(0);

    updateGameSession({
      game_type: 'who_is_more_likely',
      round_number: 1,
      total_rounds: WHO_IS_MORE_LIKELY_ITEMS.length,
      game_state: {
        questionIdx: 0,
        votes: {},
        isRevealed: false,
        syncPoints: 0,
      },
    });
  };

  useEffect(() => {
    if (activeGame?.game_type === 'who_is_more_likely' && activeGame.game_state) {
      setQuestionIdx(activeGame.game_state.questionIdx || 0);
      const votes = activeGame.game_state.votes || {};
      if (profile) setMyVote(votes[profile.id] || null);
      if (partner) setPartnerVote(votes[partner.user_id] || null);
      setIsRevealed(activeGame.game_state.isRevealed || false);
      setSyncPoints(activeGame.game_state.syncPoints || 0);
    } else {
      initGame();
    }
  }, [activeGame?.id, activeGame?.game_state]);

  const castVote = (votedUserId: string) => {
    if (isRevealed || !profile) return;
    soundEngine.playClick();
    setMyVote(votedUserId);

    const currentVotes = activeGame?.game_state?.votes || {};
    const updatedVotes = { ...currentVotes, [profile.id]: votedUserId };

    // In local testing without 2nd device, mirror partner's choice
    const otherVote = partner ? updatedVotes[partner.user_id] : votedUserId;
    const bothVoted = partner ? Boolean(updatedVotes[profile.id] && updatedVotes[partner.user_id]) : true;

    if (bothVoted) {
      soundEngine.playMatch();
      const isSync = updatedVotes[profile.id] === otherVote;
      const nextSync = isSync ? syncPoints + 1 : syncPoints;
      setSyncPoints(nextSync);
      setIsRevealed(true);

      updateGameSession({
        game_state: {
          questionIdx,
          votes: updatedVotes,
          isRevealed: true,
          syncPoints: nextSync,
        },
      });
    } else {
      updateGameSession({
        game_state: {
          questionIdx,
          votes: updatedVotes,
          isRevealed: false,
          syncPoints,
        },
      });
    }
  };

  const nextScenario = () => {
    soundEngine.playPop();
    const nextIdx = (questionIdx + 1) % WHO_IS_MORE_LIKELY_ITEMS.length;
    setQuestionIdx(nextIdx);
    setMyVote(null);
    setPartnerVote(null);
    setIsRevealed(false);

    updateGameSession({
      round_number: nextIdx + 1,
      game_state: {
        questionIdx: nextIdx,
        votes: {},
        isRevealed: false,
        syncPoints,
      },
    });
  };

  const isAgreed = myVote && partnerVote && myVote === partnerVote;

  return (
    <GameShell
      title="Who Is More Likely To...? 😂"
      gameType="who_is_more_likely"
      roundNumber={questionIdx + 1}
      totalRounds={WHO_IS_MORE_LIKELY_ITEMS.length}
      onResetGame={initGame}
    >
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* Scenario Card */}
        <div className="p-6 rounded-4xl bg-amber-50/80 border border-amber-200 text-center shadow-kawaii-sm">
          <span className="inline-block px-3 py-1 rounded-full bg-white text-amber-800 text-[11px] font-bold mb-2">
            Scenario #{questionIdx + 1}
          </span>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-kawaii-text leading-snug">
            {currentItem.scenario}
          </h3>
        </div>

        {/* Voting Choices */}
        <div className="grid grid-cols-2 gap-4">
          {/* Vote For Me */}
          <button
            onClick={() => castVote(profile?.id || 'me')}
            disabled={isRevealed}
            className={`p-5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm ${
              myVote === (profile?.id || 'me')
                ? 'bg-pink-100 border-pink-400 ring-2 ring-pink-200'
                : 'bg-white hover:bg-pink-50/50 border-pink-100'
            }`}
          >
            <KawaiiAvatar id={profile?.avatar_id || 'bunny'} size={56} />
            <span className="font-heading font-extrabold text-sm text-kawaii-text mt-2">
              {profile?.nickname || 'Me'}
            </span>
            <span className="text-[10px] text-pink-600 font-bold">(Me)</span>
          </button>

          {/* Vote For Partner */}
          <button
            onClick={() => castVote(partner?.user_id || 'partner')}
            disabled={isRevealed}
            className={`p-5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm ${
              myVote === (partner?.user_id || 'partner')
                ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-200'
                : 'bg-white hover:bg-purple-50/50 border-purple-100'
            }`}
          >
            <KawaiiAvatar id={partner?.profile?.avatar_id || 'kitty'} size={56} />
            <span className="font-heading font-extrabold text-sm text-kawaii-text mt-2">
              {partner?.profile?.nickname || 'Partner'}
            </span>
            <span className="text-[10px] text-purple-600 font-bold">(Partner)</span>
          </button>
        </div>

        {/* Revealed Outcome */}
        {isRevealed ? (
          <div className="space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div
              className={`p-4 rounded-3xl border ${
                isAgreed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <p className="font-heading font-extrabold text-base">
                {isAgreed
                  ? '🎉 Unanimous agreement! Both of you know it’s true!'
                  : '😂 You voted for different people! Time for a friendly debate!'}
              </p>
            </div>

            <button
              onClick={nextScenario}
              className="w-full py-3.5 rounded-2xl bg-kawaii-pink hover:bg-kawaii-pink-deep text-white font-bold text-xs sm:text-sm shadow-kawaii active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next Scenario</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-kawaii-muted">
            {myVote ? 'Vote cast! Waiting for partner...' : 'Tap who you think is more likely!'}
          </p>
        )}
      </div>
    </GameShell>
  );
}

