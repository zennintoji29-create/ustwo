'use client';

import React, { useState, useEffect } from 'react';
import { GameShell } from '@/components/games/GameShell';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { soundEngine } from '@/lib/sound/soundEngine';

type CellValue = 'heart' | 'star' | null;

export default function TicTacToePage() {
  const { profile } = useAuth();
  const { partner, activeGame, updateGameSession } = useRoom();

  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [isDraw, setIsDraw] = useState<boolean>(false);
  const [scores, setScores] = useState<Record<string, number>>({});

  const checkWinner = (grid: CellValue[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6],           // Diagonals
    ];

    for (const [a, b, c] of lines) {
      if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
        return grid[a];
      }
    }
    return null;
  };

  const initGame = () => {
    soundEngine.playPop();
    const firstTurn = profile?.id || 'player_1';
    const newBoard = Array(9).fill(null);

    setBoard(newBoard);
    setCurrentTurn(firstTurn);
    setWinner(null);
    setIsDraw(false);

    updateGameSession({
      game_type: 'tic_tac_toe',
      current_turn: firstTurn,
      winner_id: null,
      game_state: { board: newBoard, isDraw: false },
    });
  };

  useEffect(() => {
    if (activeGame?.game_type === 'tic_tac_toe' && activeGame.game_state?.board) {
      setBoard(activeGame.game_state.board);
      setCurrentTurn(activeGame.current_turn);
      setScores(activeGame.scores || {});
      setWinner(activeGame.winner_id || null);
      setIsDraw(activeGame.game_state.isDraw || false);
    } else {
      initGame();
    }
  }, [activeGame?.id]);

  const handleCellClick = (idx: number) => {
    if (board[idx] || winner || isDraw) return;
    if (currentTurn && profile && currentTurn !== profile.id) return;

    soundEngine.playClick();

    const isCreator = !partner || currentTurn === profile?.id;
    const piece: CellValue = currentTurn === (profile?.id || 'player_1') ? 'heart' : 'star';

    const newBoard = [...board];
    newBoard[idx] = piece;
    setBoard(newBoard);

    const winningPiece = checkWinner(newBoard);
    const hasEmpty = newBoard.some((cell) => cell === null);

    if (winningPiece) {
      soundEngine.playMatch();
      const winId = profile?.id || 'player_1';
      setWinner(winId);

      const nextScores = {
        ...scores,
        [winId]: (scores[winId] || 0) + 1,
      };
      setScores(nextScores);

      updateGameSession({
        winner_id: winId,
        scores: nextScores,
        game_state: { board: newBoard, isDraw: false },
      });
    } else if (!hasEmpty) {
      soundEngine.playError();
      setIsDraw(true);
      updateGameSession({
        game_state: { board: newBoard, isDraw: true },
      });
    } else {
      // Switch turn
      const currentUserId = profile?.id || 'player_1';
      const nextTurn = partner ? (currentTurn === currentUserId ? partner.user_id : currentUserId) : currentUserId;
      setCurrentTurn(nextTurn);

      updateGameSession({
        current_turn: nextTurn,
        game_state: { board: newBoard, isDraw: false },
      });
    }
  };

  return (
    <GameShell
      title="Tic-Tac-Toe: Love Edition 💗"
      gameType="tic_tac_toe"
      currentTurnId={currentTurn}
      scores={scores}
      winnerId={winner}
      onResetGame={initGame}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Status banner */}
        <div className="text-center">
          {winner ? (
            <p className="font-heading font-bold text-lg text-emerald-600 animate-bounce">
              🎉 Winner! Love conquers all!
            </p>
          ) : isDraw ? (
            <p className="font-heading font-bold text-lg text-pink-600">
              A cute tie! Great minds think alike 🌸
            </p>
          ) : (
            <p className="text-xs text-kawaii-muted font-medium">
              You play as <span className="text-pink-500 font-bold">💖 Hearts</span>, partner plays as{' '}
              <span className="text-amber-500 font-bold">⭐ Stars</span>
            </p>
          )}
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-pink-50/80 rounded-3xl border border-pink-200 shadow-kawaii-sm">
          {board.map((cell, idx) => (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={Boolean(cell || winner || isDraw)}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl transition-all active:scale-95 cursor-pointer shadow-xs ${
                cell
                  ? 'bg-white shadow-kawaii'
                  : 'bg-white/70 hover:bg-white hover:border-pink-300 border border-pink-100'
              }`}
            >
              {cell === 'heart' && <span className="animate-in zoom-in-50 duration-200">💖</span>}
              {cell === 'star' && <span className="animate-in zoom-in-50 duration-200">⭐</span>}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

