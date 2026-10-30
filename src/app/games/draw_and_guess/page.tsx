'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '@/components/games/GameShell';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { DRAW_WORDS } from '@/lib/games/data';
import { soundEngine } from '@/lib/sound/soundEngine';
import { Eraser, Trash2, Send, CheckCircle2, Sparkles } from 'lucide-react';

const COLORS = [
  '#FF6B95', // Kawaii Pink
  '#9C6ADE', // Lavender
  '#4A90E2', // Sky Blue
  '#2E9E67', // Mint Green
  '#F98D65', // Soft Peach
  '#514454', // Dark Charcoal
  '#E0537A', // Deep Berry
];

export default function DrawAndGuessPage() {
  const { profile } = useAuth();
  const { partner, broadcastDrawStroke, onDrawStroke, activeGame, updateGameSession } = useRoom();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FF6B95');
  const [lineWidth, setLineWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  const [currentWord, setCurrentWord] = useState('Heart');
  const [guessInput, setGuessInput] = useState('');
  const [guesses, setGuesses] = useState<Array<{ sender: string; text: string; correct?: boolean }>>([]);
  const [isGuessed, setIsGuessed] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [round, setRound] = useState(1);

  const isDrawer = currentTurn === profile?.id;
  const prevCoordRef = useRef<{ x: number; y: number } | null>(null);

  const initGame = () => {
    soundEngine.playPop();
    const firstTurn = profile?.id || 'player_1';
    const randomWord = DRAW_WORDS[Math.floor(Math.random() * DRAW_WORDS.length)];

    setCurrentWord(randomWord);
    setCurrentTurn(firstTurn);
    setGuesses([]);
    setIsGuessed(false);
    clearCanvas();

    const initScores = { [firstTurn]: 0, ...(partner ? { [partner.user_id]: 0 } : {}) };
    setScores(initScores);

    updateGameSession({
      game_type: 'draw_and_guess',
      round_number: 1,
      total_rounds: 5,
      current_turn: firstTurn,
      scores: initScores,
      game_state: { word: randomWord, isGuessed: false, round: 1 },
    });
  };

  useEffect(() => {
    if (activeGame?.game_type === 'draw_and_guess' && activeGame.game_state) {
      setCurrentWord(activeGame.game_state.word || 'Heart');
      setCurrentTurn(activeGame.current_turn);
      setIsGuessed(activeGame.game_state.isGuessed || false);
      setScores(activeGame.scores || {});
      setRound(activeGame.round_number || 1);
    } else {
      initGame();
    }
  }, [activeGame?.id]);

  // Subscribe to real-time draw strokes from partner
  useEffect(() => {
    const unsubscribe = onDrawStroke((stroke) => {
      if (stroke.clear) {
        clearCanvasLocal();
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(stroke.x0, stroke.y0);
      ctx.lineTo(stroke.x1, stroke.y1);
      ctx.stroke();
    });

    return () => unsubscribe();
  }, [onDrawStroke]);

  const clearCanvasLocal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const clearCanvas = () => {
    soundEngine.playClick();
    clearCanvasLocal();
    broadcastDrawStroke({ clear: true });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer || isGuessed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    prevCoordRef.current = { x, y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawer || isGuessed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x1 = (e.clientX - rect.left) * scaleX;
    const y1 = (e.clientY - rect.top) * scaleY;
    const prev = prevCoordRef.current || { x: x1, y: y1 };

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const strokeColor = isEraser ? '#FFFFFF' : color;
    const strokeWidth = isEraser ? lineWidth * 3 : lineWidth;

    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    broadcastDrawStroke({
      x0: prev.x,
      y0: prev.y,
      x1,
      y1,
      color: strokeColor,
      lineWidth: strokeWidth,
    });

    prevCoordRef.current = { x: x1, y: y1 };
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    prevCoordRef.current = null;
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim() || isGuessed) return;
    const guessText = guessInput.trim();
    setGuessInput('');

    const isMatch = guessText.toLowerCase() === currentWord.toLowerCase();

    if (isMatch) {
      soundEngine.playWin();
      setIsGuessed(true);
      const guesserId = profile?.id || 'player_1';
      const nextScores = {
        ...scores,
        [guesserId]: (scores[guesserId] || 0) + 1,
      };
      setScores(nextScores);
      setGuesses((prev) => [...prev, { sender: profile?.nickname || 'You', text: guessText, correct: true }]);

      updateGameSession({
        scores: nextScores,
        game_state: { word: currentWord, isGuessed: true, round },
      });
    } else {
      soundEngine.playClick();
      setGuesses((prev) => [...prev, { sender: profile?.nickname || 'You', text: guessText, correct: false }]);
    }
  };

  const nextTurnHandler = () => {
    soundEngine.playPop();
    const nextTurn = partner ? (currentTurn === profile?.id ? partner.user_id : (profile?.id || null)) : (profile?.id || 'p1');
    const randomWord = DRAW_WORDS[Math.floor(Math.random() * DRAW_WORDS.length)];
    const nextRound = round + 1;

    setCurrentWord(randomWord);
    setCurrentTurn(nextTurn);
    setIsGuessed(false);
    setGuesses([]);
    setRound(nextRound);
    clearCanvas();

    updateGameSession({
      round_number: nextRound,
      current_turn: nextTurn,
      game_state: { word: randomWord, isGuessed: false, round: nextRound },
    });
  };

  return (
    <GameShell
      title="Draw & Guess 🎨"
      gameType="draw_and_guess"
      currentTurnId={currentTurn}
      roundNumber={round}
      totalRounds={5}
      scores={scores}
      onResetGame={initGame}
    >
      <div className="flex flex-col items-center max-w-xl mx-auto w-full space-y-4">
        {/* Secret Word Prompt (Only for Drawer) */}
        {isDrawer ? (
          <div className="p-3 bg-pink-100/90 rounded-2xl border border-pink-200 text-center w-full">
            <span className="text-xs font-bold text-pink-700">Your Secret Word to Draw:</span>
            <p className="font-heading font-extrabold text-2xl text-pink-600 mt-0.5">
              {currentWord}
            </p>
            <p className="text-[10px] text-pink-800">Draw on the canvas! Your partner sees every stroke in real time.</p>
          </div>
        ) : (
          <div className="p-3 bg-purple-100/90 rounded-2xl border border-purple-200 text-center w-full">
            <span className="text-xs font-bold text-purple-700">Watch the Drawing & Guess!</span>
            <p className="text-xs font-semibold text-purple-900 mt-0.5">
              Length: {currentWord.length} letters ({currentWord.replace(/./g, '🌸 ')})
            </p>
          </div>
        )}

        {/* Drawing Tools (If Drawer) */}
        {isDrawer && !isGuessed && (
          <div className="flex items-center justify-between w-full p-2 bg-pink-50 rounded-2xl border border-pink-100 gap-2">
            {/* Palette */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setIsEraser(false);
                  }}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full shadow-xs transition-transform ${
                    color === c && !isEraser ? 'scale-120 ring-2 ring-pink-400' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>

            {/* Stroke Width Selector */}
            <div className="flex items-center gap-1 bg-white/70 px-2 py-1 rounded-xl border border-pink-200">
              {[3, 6, 10].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => {
                    soundEngine.playPop();
                    setLineWidth(w);
                  }}
                  title={`Brush ${w}px`}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    lineWidth === w ? 'bg-pink-100 text-kawaii-pink' : 'hover:bg-pink-50'
                  }`}
                >
                  <span
                    className="rounded-full bg-current block"
                    style={{ width: `${w + 2}px`, height: `${w + 2}px` }}
                  />
                </button>
              ))}
            </div>

            {/* Eraser & Clear */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsEraser(!isEraser)}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  isEraser ? 'bg-pink-400 text-white' : 'bg-white text-kawaii-text border-pink-200'
                }`}
              >
                <Eraser className="w-4 h-4" />
              </button>
              <button
                onClick={clearCanvas}
                className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-pink-200 text-rose-500 transition-all"
                title="Clear canvas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* The Synchronized Canvas */}
        <div className="relative w-full aspect-[4/3] max-w-[500px] bg-white rounded-3xl border-2 border-pink-200 shadow-kawaii overflow-hidden touch-none">
          <canvas
            ref={canvasRef}
            width={500}
            height={375}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`w-full h-full block ${isDrawer && !isGuessed ? 'cursor-crosshair' : 'cursor-default'}`}
          />

          {isGuessed && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 text-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce mb-2" />
              <h3 className="font-heading font-extrabold text-2xl text-kawaii-text">
                Correctly Guessed! 🎉
              </h3>
              <p className="text-sm font-bold text-pink-600 mt-1">The word was: {currentWord}</p>
              <button
                onClick={nextTurnHandler}
                className="mt-4 px-6 py-3 rounded-2xl bg-kawaii-pink hover:bg-kawaii-pink-deep text-white font-bold text-xs shadow-kawaii active:scale-95 cursor-pointer"
              >
                Next Round 🌸
              </button>
            </div>
          )}
        </div>

        {/* Guesser Input Box */}
        {!isDrawer && !isGuessed && (
          <form onSubmit={handleGuessSubmit} className="flex gap-2 w-full max-w-[500px]">
            <input
              type="text"
              required
              placeholder="Type your guess here..."
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-purple-200 bg-white text-xs sm:text-sm text-kawaii-text focus:outline-purple-400 font-medium"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Guess</span>
            </button>
          </form>
        )}

        {/* Guesses Log */}
        {guesses.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center max-w-[500px]">
            {guesses.slice(-5).map((g, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  g.correct ? 'bg-emerald-100 text-emerald-800' : 'bg-pink-50 text-pink-700'
                }`}
              >
                {g.sender}: {g.text}
              </span>
            ))}
          </div>
        )}
      </div>
    </GameShell>
  );
}
