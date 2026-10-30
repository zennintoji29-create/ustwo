'use client';

import React, { useState, useEffect } from 'react';
import { GameShell } from '@/components/games/GameShell';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { EMOJI_PUZZLES, EmojiPuzzle } from '@/lib/games/data';
import { soundEngine } from '@/lib/sound/soundEngine';
import { HelpCircle, Send, CheckCircle2, ArrowRight, Plus } from 'lucide-react';

export default function EmojiDecoderPage() {
  const { profile } = useAuth();
  const { partner, activeGame, updateGameSession } = useRoom();

  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [customPuzzles, setCustomPuzzles] = useState<EmojiPuzzle[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [newEmojis, setNewEmojis] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [newHint, setNewHint] = useState('');

  const allPuzzles = [...EMOJI_PUZZLES, ...customPuzzles];
  const currentPuzzle = allPuzzles[puzzleIdx] || allPuzzles[0];

  const initGame = () => {
    soundEngine.playPop();
    setPuzzleIdx(0);
    setGuessInput('');
    setShowHint(false);
    setIsSolved(false);
    const initScores = { [profile?.id || 'p1']: 0, ...(partner ? { [partner.user_id]: 0 } : {}) };
    setScores(initScores);

    updateGameSession({
      game_type: 'emoji_decoder',
      round_number: 1,
      total_rounds: allPuzzles.length,
      scores: initScores,
      game_state: { puzzleIdx: 0, isSolved: false },
    });
  };

  useEffect(() => {
    if (activeGame?.game_type === 'emoji_decoder' && activeGame.game_state) {
      setPuzzleIdx(activeGame.game_state.puzzleIdx || 0);
      setIsSolved(activeGame.game_state.isSolved || false);
      setScores(activeGame.scores || {});
    } else {
      initGame();
    }
  }, [activeGame?.id, activeGame?.game_state]);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim() || isSolved) return;

    const cleanGuess = guessInput.trim().toLowerCase();
    const cleanSolution = currentPuzzle.solution.toLowerCase();

    if (cleanGuess === cleanSolution || cleanSolution.includes(cleanGuess)) {
      soundEngine.playWin();
      setIsSolved(true);
      const currentUserId = profile?.id || 'player_1';
      const pts = showHint ? 1 : 2;
      const nextScores = { ...scores, [currentUserId]: (scores[currentUserId] || 0) + pts };
      setScores(nextScores);

      updateGameSession({
        scores: nextScores,
        game_state: { puzzleIdx, isSolved: true },
      });
    } else {
      soundEngine.playError();
    }
  };

  const nextPuzzle = () => {
    soundEngine.playPop();
    const nextIdx = (puzzleIdx + 1) % allPuzzles.length;
    setPuzzleIdx(nextIdx);
    setGuessInput('');
    setShowHint(false);
    setIsSolved(false);

    updateGameSession({
      round_number: nextIdx + 1,
      scores,
      game_state: { puzzleIdx: nextIdx, isSolved: false },
    });
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmojis.trim() || !newSolution.trim()) return;
    const newP: EmojiPuzzle = {
      id: 'custom_' + Date.now(),
      emojis: newEmojis.trim(),
      solution: newSolution.trim(),
      category: 'activity',
      hint: newHint.trim() || 'Custom couple clue',
    };
    setCustomPuzzles([...customPuzzles, newP]);
    setNewEmojis('');
    setNewSolution('');
    setNewHint('');
    setShowCustomModal(false);
    soundEngine.playMatch();
  };

  return (
    <GameShell
      title="Emoji Decoder 😭"
      gameType="emoji_decoder"
      roundNumber={puzzleIdx + 1}
      totalRounds={allPuzzles.length}
      scores={scores}
      onResetGame={initGame}
    >
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* Emoji Display Card */}
        <div className="p-8 rounded-4xl bg-gradient-to-b from-yellow-50 to-pink-50 border-2 border-pink-200 text-center shadow-kawaii">
          <span className="inline-block px-3 py-1 rounded-full bg-white text-pink-700 text-[11px] font-bold mb-3 shadow-2xs">
            Category: {currentPuzzle.category}
          </span>
          <div className="text-4xl sm:text-5xl tracking-widest my-3 select-none filter drop-shadow-xs animate-bounce-gentle">
            {currentPuzzle.emojis}
          </div>
          <p className="text-xs text-kawaii-muted mt-2">
            Decode the phrase, movie, or romantic memory hidden in the emojis!
          </p>
        </div>

        {/* Hint button & toggle */}
        <div className="text-center">
          {!showHint ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowHint(true);
              }}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 inline-flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Need a Hint? (Worth 1 pt instead of 2)</span>
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold animate-in fade-in duration-150">
              💡 Hint: {currentPuzzle.hint}
            </div>
          )}
        </div>

        {/* Guess Input Form */}
        {!isSolved ? (
          <form onSubmit={handleGuess} className="space-y-3">
            <input
              type="text"
              required
              placeholder="What does it mean? Type your guess..."
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 bg-white text-center font-bold text-base text-kawaii-text focus:outline-pink-400"
            />
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-kawaii active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Guess</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
              <p className="font-heading font-extrabold text-lg">Spot On! 🎉</p>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">Answer: {currentPuzzle.solution}</p>
            </div>

            <button
              onClick={nextPuzzle}
              className="w-full py-3.5 rounded-2xl bg-kawaii-pink hover:bg-kawaii-pink-deep text-white font-bold text-xs sm:text-sm shadow-kawaii active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next Emoji Puzzle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Create Custom Emoji Puzzle */}
        <div className="text-center pt-2">
          <button
            onClick={() => setShowCustomModal(!showCustomModal)}
            className="text-xs font-bold text-kawaii-muted hover:text-kawaii-text inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Emoji Puzzle For Partner</span>
          </button>
        </div>

        {showCustomModal && (
          <form onSubmit={handleCreateCustom} className="p-4 bg-white rounded-3xl border border-pink-200 shadow-sm space-y-3">
            <h4 className="font-bold text-xs text-kawaii-text">Create New Emoji Puzzle:</h4>
            <input
              type="text"
              required
              placeholder="Emojis (e.g. ☕ 🥐 🗼 💏)"
              value={newEmojis}
              onChange={(e) => setNewEmojis(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-pink-200 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Solution (e.g. Breakfast in Paris)"
              value={newSolution}
              onChange={(e) => setNewSolution(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-pink-200 text-xs"
            />
            <input
              type="text"
              placeholder="Hint (optional)"
              value={newHint}
              onChange={(e) => setNewHint(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-pink-200 text-xs"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-kawaii-pink text-white font-bold text-xs"
            >
              Add Puzzle to Game 💌
            </button>
          </form>
        )}
      </div>
    </GameShell>
  );
}

