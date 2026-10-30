'use client';

import React, { useState, useEffect } from 'react';
import { GameShell } from '@/components/games/GameShell';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { MEMORY_CARDS, MemoryCardDef } from '@/lib/games/data';
import { soundEngine } from '@/lib/sound/soundEngine';

interface CardState {
  instanceId: string;
  cardId: string;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryMatchPage() {
  const { profile } = useAuth();
  const { partner, activeGame, updateGameSession, startOrJoinGame } = useRoom();

  const [difficulty, setDifficulty] = useState<4 | 8 | 12 | 18>(8);
  const [cards, setCards] = useState<CardState[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize or generate deck
  const initGame = (numPairs: 4 | 8 | 12 | 18) => {
    soundEngine.playPop();
    const chosenCards = MEMORY_CARDS.slice(0, numPairs);
    const deck: CardState[] = [];

    chosenCards.forEach((c) => {
      deck.push({
        instanceId: c.id + '_1',
        cardId: c.id,
        symbol: c.symbol,
        name: c.name,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        instanceId: c.id + '_2',
        cardId: c.id,
        symbol: c.symbol,
        name: c.name,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const firstTurn = profile?.id || 'player_1';
    const initialScores = {
      [firstTurn]: 0,
      ...(partner ? { [partner.user_id]: 0 } : {}),
    };

    setCards(deck);
    setSelectedCards([]);
    setCurrentTurn(firstTurn);
    setScores(initialScores);
    setWinnerId(null);
    setIsProcessing(false);

    updateGameSession({
      game_type: 'memory_match',
      current_turn: firstTurn,
      scores: initialScores,
      game_state: { cards: deck, difficulty: numPairs },
    });
  };

  useEffect(() => {
    if (activeGame?.game_type === 'memory_match' && activeGame.game_state?.cards) {
      setCards(activeGame.game_state.cards);
      setCurrentTurn(activeGame.current_turn);
      setScores(activeGame.scores || {});
      setWinnerId(activeGame.winner_id || null);
    } else {
      initGame(difficulty);
    }
  }, [activeGame?.id]);

  const handleCardClick = (idx: number) => {
    if (isProcessing) return;
    if (cards[idx].isFlipped || cards[idx].isMatched) return;
    if (currentTurn && profile && currentTurn !== profile.id) return;

    soundEngine.playCardFlip();

    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);

    const nextSelected = [...selectedCards, idx];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      setIsProcessing(true);
      const [firstIdx, secondIdx] = nextSelected;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.cardId === secondCard.cardId) {
        // MATCH!
        setTimeout(() => {
          soundEngine.playMatch();
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;

          const currentUserId = profile?.id || 'player_1';
          const nextScores = {
            ...scores,
            [currentUserId]: (scores[currentUserId] || 0) + 1,
          };

          setCards(newCards);
          setScores(nextScores);
          setSelectedCards([]);
          setIsProcessing(false);

          // Check if all cards matched
          const allMatched = newCards.every((c) => c.isMatched);
          let winId = null;
          if (allMatched) {
            winId = currentUserId;
            setWinnerId(winId);
          }

          updateGameSession({
            current_turn: currentUserId, // Player goes again on match!
            scores: nextScores,
            winner_id: winId,
            game_state: { cards: newCards, difficulty },
          });
        }, 500);
      } else {
        // MISS!
        setTimeout(() => {
          soundEngine.playClick();
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;

          // Switch turn to partner
          const currentUserId = profile?.id || 'player_1';
          const nextTurn = partner ? (currentTurn === currentUserId ? partner.user_id : currentUserId) : currentUserId;

          setCards(newCards);
          setCurrentTurn(nextTurn);
          setSelectedCards([]);
          setIsProcessing(false);

          updateGameSession({
            current_turn: nextTurn,
            scores,
            game_state: { cards: newCards, difficulty },
          });
        }, 900);
      }
    }
  };

  return (
    <GameShell
      title="Memory Match 🧠"
      gameType="memory_match"
      currentTurnId={currentTurn}
      scores={scores}
      winnerId={winnerId}
      onResetGame={() => initGame(difficulty)}
    >
      {/* Difficulty Selector */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xs font-bold text-kawaii-muted">Pairs:</span>
        {[4, 8, 12, 18].map((d) => (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d as any);
              initGame(d as any);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              difficulty === d
                ? 'bg-kawaii-pink text-white shadow-xs'
                : 'bg-pink-50 text-kawaii-text hover:bg-pink-100'
            }`}
          >
            {d} Pairs
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div
        className={`grid gap-2 sm:gap-3 justify-center mx-auto ${
          difficulty === 4
            ? 'grid-cols-4 max-w-sm'
            : difficulty === 8
            ? 'grid-cols-4 max-w-md'
            : difficulty === 12
            ? 'grid-cols-6 max-w-lg'
            : 'grid-cols-6 max-w-xl'
        }`}
      >
        {cards.map((card, idx) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <div
              key={card.instanceId}
              className="aspect-square w-14 sm:w-18 md:w-20 [perspective:1000px]"
            >
              <button
                type="button"
                onClick={() => handleCardClick(idx)}
                disabled={card.isFlipped || card.isMatched || isProcessing}
                className={`w-full h-full relative transition-transform duration-500 [transform-style:preserve-3d] active:scale-95 cursor-pointer rounded-2xl sm:rounded-3xl shadow-sm ${
                  isRevealed ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                {/* Front Face (Hidden when flipped) */}
                <div className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-pink-200 to-rose-200 hover:from-pink-300 hover:to-rose-300 border-2 border-pink-100 flex items-center justify-center [backface-visibility:hidden] select-none">
                  <span className="text-pink-400/80 text-sm sm:text-base font-bold animate-pulse">💗</span>
                </div>

                {/* Back Face (Revealed symbol) */}
                <div
                  className={`absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl select-none [backface-visibility:hidden] [transform:rotateY(180deg)] border-2 ${
                    card.isMatched
                      ? 'bg-emerald-100/90 border-emerald-300 text-emerald-800'
                      : 'bg-white border-pink-400 shadow-kawaii-sm'
                  }`}
                >
                  <span className="animate-in zoom-in-75 duration-200">{card.symbol}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <p className="text-center text-xs text-kawaii-muted mt-4">
        Take turns flipping two cards. Find matching pairs to earn points and play again!
      </p>
    </GameShell>
  );
}

