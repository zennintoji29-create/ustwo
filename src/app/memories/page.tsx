'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Plus, Calendar, MapPin, Gamepad2 } from 'lucide-react';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { SavedMemory } from '@/types/database';
import { soundEngine } from '@/lib/sound/soundEngine';

const INITIAL_MEMORIES: SavedMemory[] = [
  {
    id: 'm1',
    room_id: 'default',
    created_by: 'p1',
    title: 'The Night We First Met ☕',
    memory_date: '2025-06-15',
    location_name: 'The Cozy Corner Cafe',
    story: 'We were both nervous, but five minutes in, we couldn’t stop laughing. We drank iced lattes until the cafe closed.',
    tag: 'milestone',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm2',
    room_id: 'default',
    created_by: 'p1',
    title: 'Stargazing on the Beach 🌌',
    memory_date: '2025-08-22',
    location_name: 'Emerald Coast Pier',
    story: 'Wrapped in a warm blanket watching the waves glowing under the full moon. You gave me your jacket when I got cold.',
    tag: 'trips',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm3',
    room_id: 'default',
    created_by: 'p1',
    title: 'Baking Strawberry Shortcake Disaster 🍓',
    memory_date: '2025-10-04',
    location_name: 'Our Kitchen',
    story: 'We put flour all over our noses, the cake was slightly lopsided, but it was the sweetest tasting dessert ever made.',
    tag: 'dates',
    created_at: new Date().toISOString(),
  },
];

export default function MemoriesPage() {
  const { profile } = useAuth();
  const { room, partner } = useRoom();

  const [memories, setMemories] = useState<SavedMemory[]>(INITIAL_MEMORIES);
  const [activeTag, setActiveTag] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [story, setStory] = useState('');
  const [tag, setTag] = useState('dates');

  const filteredMemories =
    activeTag === 'all' ? memories : memories.filter((m) => m.tag === activeTag);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim()) return;

    const newMem: SavedMemory = {
      id: 'm_' + Date.now(),
      room_id: 'default',
      created_by: profile?.id || 'p1',
      title: title.trim(),
      memory_date: date || new Date().toISOString().split('T')[0],
      location_name: location.trim() || 'Somewhere lovely',
      story: story.trim(),
      tag,
      created_at: new Date().toISOString(),
    };

    setMemories([newMem, ...memories]);
    setTitle('');
    setDate('');
    setLocation('');
    setStory('');
    setShowAdd(false);
    soundEngine.playMatch();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Banner: Relationship Counter */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-200/80 via-rose-100/70 to-purple-100/80 backdrop-blur-md rounded-4xl p-6 sm:p-8 shadow-kawaii border border-pink-200 text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-pink-700 text-xs font-bold shadow-2xs">
          <Heart className="w-3.5 h-3.5 fill-pink-500" />
          <span>Our Story Timeline</span>
        </span>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-kawaii-text">
          Our Cherished Memories 📸
        </h1>
        <p className="text-xs sm:text-sm text-kawaii-muted max-w-md mx-auto">
          A digital scrapbook of every laugh, road trip, quiet Sunday, and unforgettable milestone we share together.
        </p>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/games/memory_lane"
            onClick={() => soundEngine.playClick()}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Play Memory Lane Quiz 🧠</span>
          </Link>
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowAdd(!showAdd);
            }}
            className="px-4 py-2 rounded-2xl bg-kawaii-pink hover:bg-kawaii-pink-deep text-white text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory 🌸</span>
          </button>
        </div>
      </div>

      {/* Add Memory Modal/Form */}
      {showAdd && (
        <form
          onSubmit={handleAddMemory}
          className="p-6 bg-white rounded-4xl border-2 border-pink-200 shadow-kawaii space-y-3 animate-in zoom-in-95 duration-200"
        >
          <h3 className="font-heading font-bold text-base text-kawaii-text">Add a Special Memory</h3>
          <input
            type="text"
            required
            placeholder="Title (e.g. Picnic in Central Park 🌸)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-pink-200 text-xs"
            />
            <input
              type="text"
              placeholder="Location name"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-pink-200 text-xs"
            />
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-pink-200 text-xs"
            >
              <option value="dates">Date Night</option>
              <option value="trips">Vacation / Trip</option>
              <option value="milestone">Milestone</option>
              <option value="cozy">Cozy at Home</option>
            </select>
          </div>
          <textarea
            required
            rows={3}
            placeholder="What happened? Tell the cute story..."
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="w-full p-3 rounded-2xl border border-pink-200 text-xs"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-kawaii-pink text-white font-bold text-xs shadow-xs"
            >
              Save Memory 💖
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2.5 rounded-xl bg-gray-100 text-kawaii-muted text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tag Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'dates', 'trips', 'milestone', 'cozy'].map((t) => (
          <button
            key={t}
            onClick={() => {
              soundEngine.playClick();
              setActiveTag(t);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
              activeTag === t
                ? 'bg-kawaii-pink text-white shadow-xs'
                : 'bg-white text-kawaii-muted hover:bg-pink-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredMemories.map((m) => (
          <div
            key={m.id}
            className="p-6 rounded-4xl bg-white border border-pink-100 shadow-kawaii-sm hover:shadow-kawaii transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-600 px-2.5 py-1 rounded-full bg-pink-50 border border-pink-100">
                {m.memory_date}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 capitalize">
                {m.tag}
              </span>
            </div>

            <h3 className="font-heading font-bold text-base sm:text-lg text-kawaii-text">
              {m.title}
            </h3>

            <p className="text-xs sm:text-sm text-kawaii-muted leading-relaxed whitespace-pre-wrap">
              {m.story}
            </p>

            {m.location_name && (
              <p className="text-[11px] text-pink-500 font-semibold flex items-center gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{m.location_name}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

