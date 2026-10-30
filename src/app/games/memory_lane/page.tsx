'use client';

import React, { useState, useEffect } from 'react';
import { GameShell } from '@/components/games/GameShell';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { SavedMemory } from '@/types/database';
import { soundEngine } from '@/lib/sound/soundEngine';
import { Calendar, MapPin, Plus, Sparkles, Check, Heart, Trophy } from 'lucide-react';

const DEFAULT_MEMORIES: SavedMemory[] = [
  {
    id: 'm1',
    room_id: 'default',
    created_by: 'p1',
    title: 'Our Very First Date ☕',
    memory_date: '2025-06-15',
    location_name: 'The Cozy Corner Cafe',
    story: 'We ordered iced lattes and talked for 4 hours without checking our phones even once.',
    tag: 'first_date',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm2',
    room_id: 'default',
    created_by: 'p1',
    title: 'Sunset Beach Walk 🌅',
    memory_date: '2025-08-22',
    location_name: 'Seaside Pier',
    story: 'Watched the sky turn pastel pink and lavender while sharing warm churros.',
    tag: 'adventure',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm3',
    room_id: 'default',
    created_by: 'p1',
    title: 'Late Night Movie Marathon 🎬',
    memory_date: '2025-11-10',
    location_name: 'Living Room Blanket Fort',
    story: 'Built a giant blanket fort with fairy lights and fell asleep during the second movie.',
    tag: 'cozy',
    created_at: new Date().toISOString(),
  },
];

export default function MemoryLanePage() {
  const { profile } = useAuth();
  const { partner, activeGame, updateGameSession } = useRoom();

  const [memories, setMemories] = useState<SavedMemory[]>(DEFAULT_MEMORIES);
  const [activeTab, setActiveTab] = useState<'timeline' | 'quiz'>('quiz');
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizGuess, setQuizGuess] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  // New Memory Form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [story, setStory] = useState('');

  const currentMemory = memories[quizIdx] || memories[0];

  const initGame = () => {
    soundEngine.playPop();
    setQuizIdx(0);
    setQuizGuess('');
    setIsRevealed(false);
    const initScores = { [profile?.id || 'p1']: 0, ...(partner ? { [partner.user_id]: 0 } : {}) };
    setScores(initScores);

    updateGameSession({
      game_type: 'memory_lane',
      round_number: 1,
      total_rounds: memories.length,
      scores: initScores,
      game_state: { quizIdx: 0, isRevealed: false },
    });
  };

  useEffect(() => {
    if (activeGame?.game_type === 'memory_lane' && activeGame.game_state) {
      setQuizIdx(activeGame.game_state.quizIdx || 0);
      setIsRevealed(activeGame.game_state.isRevealed || false);
      setScores(activeGame.scores || {});
    } else {
      initGame();
    }
  }, [activeGame?.id]);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim()) return;

    const newMem: SavedMemory = {
      id: 'mem_' + Date.now(),
      room_id: 'default',
      created_by: profile?.id || 'p1',
      title: title.trim(),
      memory_date: date || new Date().toISOString().split('T')[0],
      location_name: location.trim() || 'Somewhere special',
      story: story.trim(),
      tag: 'cherished',
      created_at: new Date().toISOString(),
    };

    setMemories([newMem, ...memories]);
    setTitle('');
    setDate('');
    setLocation('');
    setStory('');
    setShowAddModal(false);
    soundEngine.playMatch();
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizGuess.trim() || isRevealed) return;
    soundEngine.playClick();
    setIsRevealed(true);

    const isMatch =
      quizGuess.toLowerCase().includes(currentMemory.location_name?.toLowerCase() || '') ||
      quizGuess.toLowerCase().includes(currentMemory.memory_date);

    if (isMatch) {
      soundEngine.playWin();
      const currentId = profile?.id || 'p1';
      const nextScores = { ...scores, [currentId]: (scores[currentId] || 0) + 1 };
      setScores(nextScores);
      updateGameSession({ scores: nextScores, game_state: { quizIdx, isRevealed: true } });
    } else {
      updateGameSession({ game_state: { quizIdx, isRevealed: true } });
    }
  };

  const nextQuiz = () => {
    soundEngine.playPop();
    const nextIdx = (quizIdx + 1) % memories.length;
    setQuizIdx(nextIdx);
    setQuizGuess('');
    setIsRevealed(false);

    updateGameSession({
      round_number: nextIdx + 1,
      scores,
      game_state: { quizIdx: nextIdx, isRevealed: false },
    });
  };

  return (
    <GameShell
      title="Our Memory Lane 📸"
      gameType="memory_lane"
      roundNumber={quizIdx + 1}
      totalRounds={memories.length}
      scores={scores}
      onResetGame={initGame}
    >
      <div className="max-w-md mx-auto w-full space-y-5">
        {/* Tab Switcher */}
        <div className="flex p-1 bg-pink-50 rounded-2xl">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('quiz');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'quiz' ? 'bg-white text-kawaii-pink shadow-sm' : 'text-kawaii-muted'
            }`}
          >
            Memory Quiz 🧠
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('timeline');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'timeline' ? 'bg-white text-kawaii-pink shadow-sm' : 'text-kawaii-muted'
            }`}
          >
            Timeline Book 📖
          </button>
        </div>

        {activeTab === 'quiz' ? (
          <div className="space-y-4">
            {/* Memory Card (Location and date masked for quiz) */}
            <div className="p-6 rounded-4xl bg-gradient-to-b from-rose-50 to-pink-50 border border-pink-200 text-center shadow-kawaii-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-white text-rose-700 text-[11px] font-bold mb-2 shadow-2xs">
                Memory #{quizIdx + 1}
              </span>
              <h3 className="font-heading font-extrabold text-xl text-kawaii-text">
                {currentMemory.title}
              </h3>
              <p className="text-xs sm:text-sm text-kawaii-text mt-2 italic px-2">
                &ldquo;{currentMemory.story}&rdquo;
              </p>
            </div>

            {/* Quiz Question */}
            {!isRevealed ? (
              <form onSubmit={handleGuessSubmit} className="space-y-3">
                <label className="block text-xs font-bold text-kawaii-text text-center">
                  Where did this happen, or what was the date?
                </label>
                <input
                  type="text"
                  required
                  placeholder="Guess the place or date..."
                  value={quizGuess}
                  onChange={(e) => setQuizGuess(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-pink-200 bg-white text-xs sm:text-sm text-kawaii-text font-medium text-center focus:outline-pink-400"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-kawaii-pink hover:bg-kawaii-pink-deep text-white font-bold text-xs shadow-kawaii active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Check My Memory!</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4 animate-in zoom-in-95 duration-200 text-center">
                <div className="p-4 rounded-3xl bg-pink-50 border border-pink-200 space-y-1">
                  <p className="text-[11px] font-bold text-pink-700 uppercase">Memory Revealed 🌸</p>
                  <p className="font-bold text-sm text-kawaii-text flex items-center justify-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-pink-500" />
                    <span>Location: {currentMemory.location_name}</span>
                  </p>
                  <p className="text-xs text-kawaii-muted flex items-center justify-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-pink-400" />
                    <span>Date: {currentMemory.memory_date}</span>
                  </p>
                </div>

                <button
                  onClick={nextQuiz}
                  className="w-full py-3 rounded-2xl bg-kawaii-pink text-white font-bold text-xs shadow-kawaii active:scale-95 cursor-pointer"
                >
                  Next Memory 💗
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Timeline View */
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-2.5 rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-kawaii-pink font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Special Memory</span>
            </button>

            {memories.map((m) => (
              <div key={m.id} className="p-4 rounded-3xl bg-white border border-pink-100 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-sm text-kawaii-text">{m.title}</h4>
                  <span className="text-[10px] text-pink-600 font-bold">{m.memory_date}</span>
                </div>
                <p className="text-xs text-kawaii-muted leading-relaxed">{m.story}</p>
                {m.location_name && (
                  <p className="text-[10px] text-pink-500 font-medium flex items-center gap-1 pt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{m.location_name}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Memory */}
        {showAddModal && (
          <form onSubmit={handleAddMemory} className="p-4 bg-white rounded-3xl border border-pink-200 shadow-kawaii space-y-3">
            <h4 className="font-bold text-xs text-kawaii-text">Add New Shared Memory</h4>
            <input
              type="text"
              required
              placeholder="Title (e.g. Picnic in Central Park)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-pink-200 text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-pink-200 text-xs"
              />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-pink-200 text-xs"
              />
            </div>
            <textarea
              required
              rows={2}
              placeholder="What happened? Tell the cute story..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-pink-200 text-xs"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-kawaii-pink text-white font-bold text-xs shadow-xs"
              >
                Save Memory 💖
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-2 rounded-xl bg-gray-100 text-kawaii-muted text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </GameShell>
  );
}

