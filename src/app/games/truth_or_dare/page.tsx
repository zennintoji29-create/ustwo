'use client';

import React, { useState, useEffect } from 'react';
import { GameShell } from '@/components/games/GameShell';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { TRUTH_DARE_CARDS, TruthDareCard } from '@/lib/games/data';
import { soundEngine } from '@/lib/sound/soundEngine';
import { Sparkles, Check, SkipForward, Plus, Flame } from 'lucide-react';

export default function TruthOrDarePage() {
  const { profile } = useAuth();
  const { partner, activeGame, updateGameSession } = useRoom();

  const [cards, setCards] = useState<TruthDareCard[]>(TRUTH_DARE_CARDS);
  const [selectedType, setSelectedType] = useState<'truth' | 'dare' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'romantic' | 'cute' | 'funny' | 'deep' | 'playful'>('all');
  const [activeCard, setActiveCard] = useState<TruthDareCard | null>(null);
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [round, setRound] = useState(1);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customType, setCustomType] = useState<'truth' | 'dare'>('truth');

  const initGame = () => {
    soundEngine.playPop();
    const firstTurn = profile?.id || 'player_1';
    setCurrentTurn(firstTurn);
    setSelectedType(null);
    setActiveCard(null);
    setRound(1);
    const initScores = { [firstTurn]: 0, ...(partner ? { [partner.user_id]: 0 } : {}) };
    setScores(initScores);

    updateGameSession({
      game_type: 'truth_or_dare',
      round_number: 1,
      total_rounds: 10,
      current_turn: firstTurn,
      scores: initScores,
      game_state: { activeCard: null, round: 1 },
    });
  };

  useEffect(() => {
    if (activeGame?.game_type === 'truth_or_dare') {
      setCurrentTurn(activeGame.current_turn);
      setScores(activeGame.scores || {});
      setActiveCard(activeGame.game_state?.activeCard || null);
      setRound(activeGame.round_number || 1);
    } else {
      initGame();
    }
  }, [activeGame?.id, activeGame?.game_state]);

  const pickCard = (type: 'truth' | 'dare') => {
    soundEngine.playCardFlip();
    setSelectedType(type);
    let pool = cards.filter((c) => c.type === type);
    if (selectedCategory !== 'all') {
      const catPool = pool.filter((c) => c.category === selectedCategory);
      if (catPool.length > 0) pool = catPool;
    }
    const randomCard = pool[Math.floor(Math.random() * pool.length)];
    setActiveCard(randomCard);

    updateGameSession({
      game_state: { activeCard: randomCard, round },
    });
  };

  const completeAction = (completed: boolean) => {
    if (completed) {
      soundEngine.playMatch();
    } else {
      soundEngine.playClick();
    }

    const currentUserId = currentTurn || profile?.id || 'player_1';
    const nextScores = {
      ...scores,
      ...(completed ? { [currentUserId]: (scores[currentUserId] || 0) + 1 } : {}),
    };

    const nextTurn = partner ? (currentTurn === currentUserId ? partner.user_id : currentUserId) : currentUserId;
    const nextRound = round + 1;

    setSelectedType(null);
    setActiveCard(null);
    setCurrentTurn(nextTurn);
    setScores(nextScores);
    setRound(nextRound);

    updateGameSession({
      current_turn: nextTurn,
      round_number: nextRound,
      scores: nextScores,
      game_state: { activeCard: null, round: nextRound },
    });
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    const newCard: TruthDareCard = {
      id: 'custom_' + Date.now(),
      type: customType,
      category: 'romantic',
      text: customText.trim(),
    };
    setCards([newCard, ...cards]);
    setCustomText('');
    setShowAddCustom(false);
    soundEngine.playPop();
  };

  return (
    <GameShell
      title="Truth or Dare 🎀"
      gameType="truth_or_dare"
      currentTurnId={currentTurn}
      roundNumber={round}
      totalRounds={10}
      scores={scores}
      onResetGame={initGame}
    >
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* If no card chosen yet: Choice Buttons */}
        {!activeCard ? (
          <div className="space-y-4 text-center">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pb-1">
              {(['all', 'romantic', 'cute', 'funny', 'deep', 'playful'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    soundEngine.playPop();
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition-all ${
                    selectedCategory === cat
                      ? 'bg-kawaii-pink text-white shadow-2xs'
                      : 'bg-pink-50 text-kawaii-muted hover:text-kawaii-text'
                  }`}
                >
                  {cat === 'all' ? '✨ All Vibes' : cat}
                </button>
              ))}
            </div>

            <p className="text-xs font-bold text-kawaii-muted uppercase tracking-wider">
              {currentTurn === profile?.id ? 'Your turn to choose:' : `${partner?.profile?.nickname || 'Partner'}’s turn to choose:`}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => pickCard('truth')}
                className="group p-6 rounded-3xl bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 text-kawaii-text transition-all active:scale-95 flex flex-col items-center cursor-pointer shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-pink-400 text-white flex items-center justify-center text-2xl shadow-sm mb-2 group-hover:scale-110 transition-transform">
                  💬
                </div>
                <span className="font-heading font-extrabold text-lg text-pink-700">Truth</span>
                <span className="text-[10px] text-kawaii-muted mt-1">Honest & romantic secrets</span>
              </button>

              <button
                onClick={() => pickCard('dare')}
                className="group p-6 rounded-3xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 text-kawaii-text transition-all active:scale-95 flex flex-col items-center cursor-pointer shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-400 text-white flex items-center justify-center text-2xl shadow-sm mb-2 group-hover:scale-110 transition-transform">
                  🔥
                </div>
                <span className="font-heading font-extrabold text-lg text-purple-700">Dare</span>
                <span className="text-[10px] text-kawaii-muted mt-1">Cute & fun challenges</span>
              </button>
            </div>

            {/* Add Custom Truth/Dare Toggle */}
            <button
              onClick={() => setShowAddCustom(!showAddCustom)}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 inline-flex items-center gap-1 pt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Truth or Dare</span>
            </button>
          </div>
        ) : (
          /* Active Card Display */
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            <div
              className={`p-6 sm:p-8 rounded-4xl border-2 text-center shadow-kawaii ${
                activeCard.type === 'truth'
                  ? 'bg-gradient-to-b from-pink-50 to-white border-pink-200'
                  : 'bg-gradient-to-b from-purple-50 to-white border-purple-200'
              }`}
            >
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase mb-3 ${
                  activeCard.type === 'truth'
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {activeCard.type === 'truth' ? '🌸 Truth Question' : '🔥 Dare Challenge'}
              </span>

              <h3 className="font-heading font-bold text-lg sm:text-xl text-kawaii-text leading-relaxed">
                {activeCard.text}
              </h3>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => completeAction(true)}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-kawaii active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Completed! (+1 pt) 🎉</span>
              </button>

              <button
                onClick={() => completeAction(false)}
                className="px-4 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-kawaii-muted font-bold text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal/Form to Add Custom Card */}
        {showAddCustom && (
          <form
            onSubmit={handleAddCustom}
            className="p-4 bg-white rounded-3xl border border-pink-200 shadow-sm space-y-3"
          >
            <h4 className="font-bold text-xs text-kawaii-text">Add your own prompt:</h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCustomType('truth')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl ${
                  customType === 'truth' ? 'bg-pink-400 text-white' : 'bg-pink-50 text-pink-700'
                }`}
              >
                Truth
              </button>
              <button
                type="button"
                onClick={() => setCustomType('dare')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl ${
                  customType === 'dare' ? 'bg-purple-400 text-white' : 'bg-purple-50 text-purple-700'
                }`}
              >
                Dare
              </button>
            </div>
            <textarea
              required
              rows={2}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={`Write a cute ${customType}...`}
              className="w-full p-2.5 rounded-xl border border-pink-200 text-xs text-kawaii-text"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-kawaii-pink text-white font-bold text-xs shadow-xs"
            >
              Add to Game Deck 💌
            </button>
          </form>
        )}
      </div>
    </GameShell>
  );
}

