'use client';

import React, { useState } from 'react';
import { Heart, Sparkles, Send, Star, Bookmark, Plus } from 'lucide-react';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { LoveNote } from '@/types/database';
import { soundEngine } from '@/lib/sound/soundEngine';
import confetti from 'canvas-confetti';

const STICKERS = [
  { id: 'heart_sparkle', symbol: '💖', label: 'Sparkle Heart' },
  { id: 'ribbon', symbol: '🎀', label: 'Pink Ribbon' },
  { id: 'teddy', symbol: '🧸', label: 'Teddy Bear' },
  { id: 'blossom', symbol: '🌸', label: 'Blossom' },
  { id: 'sealed_love', symbol: '💌', label: 'Sealed Love' },
  { id: 'berry', symbol: '🍓', label: 'Sweet Berry' },
];

const STATIONERY_THEMES = [
  { id: 'pastel_blush', name: 'Blush Pink', bg: 'bg-pink-50/90 border-pink-200' },
  { id: 'lavender_dream', name: 'Lavender Dream', bg: 'bg-purple-50/90 border-purple-200' },
  { id: 'soft_peach', name: 'Soft Peach', bg: 'bg-orange-50/90 border-orange-200' },
  { id: 'mint_cloud', name: 'Mint Cloud', bg: 'bg-emerald-50/90 border-emerald-200' },
];

const DEFAULT_NOTES: LoveNote[] = [
  {
    id: 'n1',
    room_id: 'default',
    sender_id: 'partner',
    content: 'Just wanted to remind you how lucky I feel every single day to have you in my life. You make everything brighter. 💗',
    sticker_id: 'heart_sparkle',
    stationery_style: 'pastel_blush',
    is_favorite: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'n2',
    room_id: 'default',
    sender_id: 'me',
    content: 'Good morning honey! Hope you have the sweetest day today. Don’t forget to drink water and smile! 🌸',
    sticker_id: 'blossom',
    stationery_style: 'lavender_dream',
    is_favorite: false,
    created_at: new Date().toISOString(),
  },
];

export default function LoveNotesPage() {
  const { profile } = useAuth();
  const { partner, sendReaction } = useRoom();

  const [notes, setNotes] = useState<LoveNote[]>(DEFAULT_NOTES);
  const [content, setContent] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('heart_sparkle');
  const [selectedStationery, setSelectedStationery] = useState('pastel_blush');
  const [showCompose, setShowCompose] = useState(false);

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newNote: LoveNote = {
      id: 'n_' + Date.now(),
      room_id: 'default',
      sender_id: profile?.id || 'me',
      recipient_id: partner?.user_id || 'partner',
      content: content.trim(),
      sticker_id: selectedSticker,
      stationery_style: selectedStationery,
      is_favorite: false,
      created_at: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    setContent('');
    setShowCompose(false);
    soundEngine.playWin();
    sendReaction('💌');
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  const toggleFavorite = (id: string) => {
    soundEngine.playPop();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_favorite: !n.is_favorite } : n))
    );
  };

  const getStickerSymbol = (stId: string) => {
    return STICKERS.find((s) => s.id === stId)?.symbol || '💗';
  };

  const getStationeryClass = (stId: string) => {
    return STATIONERY_THEMES.find((s) => s.id === stId)?.bg || 'bg-pink-50/90 border-pink-200';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Our Little Mailbox</span>
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-kawaii-text">
            Love Notes 💌
          </h1>
          <p className="text-xs sm:text-sm text-kawaii-muted mt-1">
            Leave tender letters, cute stickers, and secret romantic messages for your partner.
          </p>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            setShowCompose(!showCompose);
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-kawaii active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Note ✍️</span>
        </button>
      </div>

      {/* Compose Letter Drawer/Form */}
      {showCompose && (
        <form
          onSubmit={handleSendNote}
          className="p-6 bg-white/95 rounded-4xl border-2 border-pink-200 shadow-kawaii space-y-4 animate-in zoom-in-95 duration-200"
        >
          <h3 className="font-heading font-bold text-base text-kawaii-text">
            Compose a Romantic Note 🌸
          </h3>

          {/* Stationery Picker */}
          <div>
            <label className="block text-xs font-bold text-kawaii-muted mb-2">
              Choose Digital Stationery:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATIONERY_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedStationery(theme.id)}
                  className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all ${
                    selectedStationery === theme.id
                      ? 'border-pink-500 bg-pink-50 text-pink-800 shadow-xs'
                      : 'border-transparent bg-gray-50 text-kawaii-muted'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sticker Picker */}
          <div>
            <label className="block text-xs font-bold text-kawaii-muted mb-2">
              Attach Cute Sticker Stamp:
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {STICKERS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedSticker(st.id)}
                  className={`p-2 rounded-2xl border-2 flex items-center justify-center text-2xl transition-all ${
                    selectedSticker === st.id
                      ? 'border-pink-500 bg-pink-100 scale-110 shadow-xs'
                      : 'border-transparent bg-pink-50 hover:bg-pink-100'
                  }`}
                >
                  {st.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Content Textarea */}
          <textarea
            rows={4}
            required
            placeholder="Write something tender that will make your partner smile today..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 rounded-2xl border border-pink-200 bg-pink-50/30 text-xs sm:text-sm text-kawaii-text font-medium focus:outline-pink-400"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-xs shadow-kawaii active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Deliver Love Note 💌</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCompose(false)}
              className="px-5 py-3 rounded-2xl bg-gray-100 text-kawaii-muted text-xs font-bold active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Love Letter Pinboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`p-6 rounded-4xl border-2 shadow-kawaii-sm relative transition-all hover:shadow-kawaii flex flex-col justify-between ${getStationeryClass(
              note.stationery_style
            )}`}
          >
            {/* Top Bar: Sticker stamp and favorite star */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl select-none filter drop-shadow-xs">
                {getStickerSymbol(note.sticker_id)}
              </span>

              <button
                onClick={() => toggleFavorite(note.id)}
                title={note.is_favorite ? 'Favorited' : 'Add to favorites'}
                className="p-1 rounded-full text-pink-400 hover:text-pink-600 transition-colors"
              >
                <Star
                  className={`w-5 h-5 ${
                    note.is_favorite ? 'fill-amber-400 text-amber-500' : 'text-pink-300'
                  }`}
                />
              </button>
            </div>

            {/* Letter Body */}
            <p className="text-xs sm:text-sm text-kawaii-text font-medium leading-relaxed whitespace-pre-wrap">
              &ldquo;{note.content}&rdquo;
            </p>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-pink-200/50 flex items-center justify-between text-[11px] text-kawaii-muted">
              <span className="font-bold text-pink-700">
                From: {note.sender_id === (profile?.id || 'me') ? 'You 💗' : partner?.profile?.nickname || 'Sweetheart 🌸'}
              </span>
              <span>{new Date(note.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

