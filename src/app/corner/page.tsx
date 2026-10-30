'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  BookmarkCheck,
  Calendar,
  Gift,
  HelpCircle,
  Plus,
  Check,
  Heart,
  Flame,
  Clock,
  Send,
  Lock,
  Unlock,
} from 'lucide-react';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { BucketListItem, CalendarEvent, VirtualGift } from '@/types/database';
import { soundEngine } from '@/lib/sound/soundEngine';
import confetti from 'canvas-confetti';

const DEFAULT_BUCKET: BucketListItem[] = [
  { id: 'b1', room_id: 'default', created_by: 'p1', title: 'Watch cherry blossoms in Japan 🌸', description: 'Stroll under blooming trees in Kyoto with matching scarves', category: 'travel', is_completed: false, created_at: new Date().toISOString() },
  { id: 'b2', room_id: 'default', created_by: 'p1', title: 'Cook homemade pasta from scratch 🍝', description: 'Make fresh gnocchi and tiramisu together on date night', category: 'food', is_completed: true, completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'b3', room_id: 'default', created_by: 'p1', title: 'Go on a stargazing road trip 🌌', description: 'Pack sleeping bags and a hot thermos of cocoa', category: 'adventure', is_completed: false, created_at: new Date().toISOString() },
];

const DEFAULT_EVENTS: CalendarEvent[] = [
  { id: 'e1', room_id: 'default', created_by: 'p1', title: 'Our Anniversary 💗', event_date: '2027-02-14', event_type: 'anniversary', reminder_days_before: 7, notes: 'Special surprise dinner and gifts', created_at: new Date().toISOString() },
  { id: 'e2', room_id: 'default', created_by: 'p1', title: 'Sweetheart’s Birthday 🎂', event_date: '2027-05-20', event_type: 'birthday', reminder_days_before: 3, notes: 'Order their favorite strawberry cake', created_at: new Date().toISOString() },
  { id: 'e3', room_id: 'default', created_by: 'p1', title: 'Weekend Cabin Getaway 🌲', event_date: '2027-03-12', event_type: 'trip', reminder_days_before: 2, notes: 'Cozy fireplace relaxation', created_at: new Date().toISOString() },
];

const DEFAULT_GIFTS: VirtualGift[] = [
  { id: 'g1', room_id: 'default', sender_id: 'partner', recipient_id: 'me', gift_type: 'bouquet', message: 'Just thinking about how much I love you today! 💐', is_opened: true, created_at: new Date().toISOString() },
  { id: 'g2', room_id: 'default', sender_id: 'partner', recipient_id: 'me', gift_type: 'teddy_bear', message: 'A warm teddy to cuddle when I am not right beside you! 🧸', is_opened: false, created_at: new Date().toISOString() },
];

function LittleCornerContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'bucket';

  const { profile } = useAuth();
  const { room, partner } = useRoom();

  const [activeTab, setActiveTab] = useState<'bucket' | 'daily' | 'calendar' | 'gifts'>(initialTab);

  // Bucket list state
  const [bucketList, setBucketList] = useState<BucketListItem[]>(DEFAULT_BUCKET);
  const [newBucketTitle, setNewBucketTitle] = useState('');
  const [newBucketCat, setNewBucketCat] = useState<'adventure' | 'cozy' | 'food' | 'travel'>('adventure');
  const [showAddBucket, setShowAddBucket] = useState(false);

  // Daily Question state
  const [dailyPrompt] = useState('What is one small thing that made you smile thinking of me this week? 🌸');
  const [myDailyAnswer, setMyDailyAnswer] = useState('');
  const [isDailyLocked, setIsDailyLocked] = useState(false);
  const [partnerDailyAnswer] = useState('When you sent that cute voice note wishing me good luck in the morning! 🥰');
  const [isDailyRevealed, setIsDailyRevealed] = useState(false);

  // Calendar state
  const [events, setEvents] = useState<CalendarEvent[]>(DEFAULT_EVENTS);
  const [newEvTitle, setNewEvTitle] = useState('');
  const [newEvDate, setNewEvDate] = useState('');
  const [newEvType, setNewEvType] = useState<'anniversary' | 'birthday' | 'date_night' | 'trip'>('date_night');
  const [showAddEvent, setShowAddEvent] = useState(false);

  // Gifts state
  const [gifts, setGifts] = useState<VirtualGift[]>(DEFAULT_GIFTS);
  const [newGiftType, setNewGiftType] = useState<'bouquet' | 'teddy_bear' | 'chocolates' | 'heart_locket' | 'shooting_star' | 'cupcake'>('bouquet');
  const [newGiftMsg, setNewGiftMsg] = useState('');
  const [showSendGift, setShowSendGift] = useState(false);

  const toggleBucket = (id: string) => {
    soundEngine.playPop();
    setBucketList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.is_completed;
          if (next) {
            soundEngine.playWin();
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          }
          return { ...item, is_completed: next, completed_at: next ? new Date().toISOString() : null };
        }
        return item;
      })
    );
  };

  const handleAddBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketTitle.trim()) return;
    const newItem: BucketListItem = {
      id: 'b_' + Date.now(),
      room_id: 'default',
      created_by: profile?.id || 'p1',
      title: newBucketTitle.trim(),
      description: '',
      category: newBucketCat,
      is_completed: false,
      created_at: new Date().toISOString(),
    };
    setBucketList([newItem, ...bucketList]);
    setNewBucketTitle('');
    setShowAddBucket(false);
    soundEngine.playMatch();
  };

  const handleLockDailyAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myDailyAnswer.trim()) return;
    soundEngine.playMatch();
    setIsDailyLocked(true);
    setIsDailyRevealed(true);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvTitle.trim() || !newEvDate) return;
    const newEv: CalendarEvent = {
      id: 'e_' + Date.now(),
      room_id: 'default',
      created_by: profile?.id || 'p1',
      title: newEvTitle.trim(),
      event_date: newEvDate,
      event_type: newEvType,
      reminder_days_before: 1,
      created_at: new Date().toISOString(),
    };
    setEvents([...events, newEv]);
    setNewEvTitle('');
    setNewEvDate('');
    setShowAddEvent(false);
    soundEngine.playMatch();
  };

  const handleSendGift = (e: React.FormEvent) => {
    e.preventDefault();
    const newGift: VirtualGift = {
      id: 'g_' + Date.now(),
      room_id: 'default',
      sender_id: profile?.id || 'me',
      recipient_id: partner?.user_id || 'partner',
      gift_type: newGiftType,
      message: newGiftMsg.trim() || 'A little surprise for you! 💖',
      is_opened: false,
      created_at: new Date().toISOString(),
    };
    setGifts([newGift, ...gifts]);
    setNewGiftMsg('');
    setShowSendGift(false);
    soundEngine.playWin();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  const openGift = (id: string) => {
    soundEngine.playWin();
    setGifts((prev) =>
      prev.map((g) => (g.id === id ? { ...g, is_opened: true, opened_at: new Date().toISOString() } : g))
    );
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  const getGiftEmoji = (type: string) => {
    switch (type) {
      case 'bouquet': return '💐';
      case 'teddy_bear': return '🧸';
      case 'chocolates': return '🍫';
      case 'heart_locket': return '💖';
      case 'shooting_star': return '⭐';
      case 'cupcake': return '🧁';
      default: return '🎁';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Our Little Corner</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-kawaii-text">
          Shared Couple Memories & Goals 🌸
        </h1>
        <p className="text-xs sm:text-sm text-kawaii-muted mt-1.5">
          Everything the two of you share: dreams, dates, daily streaks, and sweet virtual gifts!
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex p-1.5 bg-pink-50/80 rounded-3xl max-w-xl mx-auto overflow-x-auto gap-1">
        <button
          onClick={() => { soundEngine.playClick(); setActiveTab('bucket'); }}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-2xl whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'bucket' ? 'bg-white text-kawaii-pink shadow-sm' : 'text-kawaii-muted hover:text-kawaii-text'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Bucket List</span>
        </button>

        <button
          onClick={() => { soundEngine.playClick(); setActiveTab('daily'); }}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-2xl whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'daily' ? 'bg-white text-kawaii-pink shadow-sm' : 'text-kawaii-muted hover:text-kawaii-text'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-500" />
          <span>Daily Question</span>
        </button>

        <button
          onClick={() => { soundEngine.playClick(); setActiveTab('calendar'); }}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-2xl whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'calendar' ? 'bg-white text-kawaii-pink shadow-sm' : 'text-kawaii-muted hover:text-kawaii-text'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => { soundEngine.playClick(); setActiveTab('gifts'); }}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-2xl whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'gifts' ? 'bg-white text-kawaii-pink shadow-sm' : 'text-kawaii-muted hover:text-kawaii-text'
          }`}
        >
          <Gift className="w-4 h-4 text-pink-500" />
          <span>Gift Box</span>
        </button>
      </div>

      {/* Tab 1: Bucket List */}
      {activeTab === 'bucket' && (
        <div className="bg-white/90 rounded-4xl p-6 sm:p-8 shadow-kawaii border border-pink-100 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-kawaii-text">Our Couple Bucket List</h2>
              <p className="text-xs text-kawaii-muted">Dream up things to experience and check them off together!</p>
            </div>
            <button
              onClick={() => setShowAddBucket(!showAddBucket)}
              className="px-3.5 py-2 rounded-2xl bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
          </div>

          {showAddBucket && (
            <form onSubmit={handleAddBucket} className="p-4 bg-pink-50/70 rounded-3xl border border-pink-200 space-y-3">
              <input
                type="text"
                required
                placeholder="What dream do you want to achieve together?"
                value={newBucketTitle}
                onChange={(e) => setNewBucketTitle(e.target.value)}
                className="w-full p-3 rounded-2xl border border-pink-200 bg-white text-xs sm:text-sm font-medium"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 rounded-xl bg-kawaii-pink text-white font-bold text-xs">
                  Save Goal 🌸
                </button>
                <button type="button" onClick={() => setShowAddBucket(false)} className="px-4 py-2 rounded-xl bg-white text-kawaii-muted text-xs">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2.5 pt-2">
            {bucketList.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleBucket(item.id)}
                className={`p-4 rounded-3xl border-2 flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  item.is_completed ? 'bg-pink-50/50 border-pink-200 opacity-75' : 'bg-white hover:border-pink-200 border-pink-100 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                    item.is_completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-pink-300 bg-white'
                  }`}>
                    {item.is_completed && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-bold ${item.is_completed ? 'line-through text-kawaii-muted' : 'text-kawaii-text'}`}>
                      {item.title}
                    </p>
                    {item.description && <p className="text-[11px] text-kawaii-muted mt-0.5">{item.description}</p>}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 capitalize">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Daily Question */}
      {activeTab === 'daily' && (
        <div className="bg-white/90 rounded-4xl p-6 sm:p-8 shadow-kawaii border border-pink-100 max-w-2xl mx-auto space-y-5">
          <div className="text-center">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>Current Streak: {room?.streak_days || 1} Day Streak 🔥</span>
            </span>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-kawaii-text">
              Today’s Question for Two
            </h2>
            <p className="text-xs text-kawaii-muted mt-1">Answer today’s prompt to keep your couple streak alive!</p>
          </div>

          <div className="p-6 rounded-3xl bg-pink-50/70 border border-pink-200 text-center">
            <h3 className="font-heading font-bold text-base sm:text-lg text-kawaii-text leading-snug">
              {dailyPrompt}
            </h3>
          </div>

          {!isDailyLocked ? (
            <form onSubmit={handleLockDailyAnswer} className="space-y-3">
              <label className="block text-xs font-bold text-kawaii-text">
                Your Answer (revealed once both have answered):
              </label>
              <textarea
                rows={3}
                required
                placeholder="Speak from your heart..."
                value={myDailyAnswer}
                onChange={(e) => setMyDailyAnswer(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-pink-200 bg-white text-xs sm:text-sm text-kawaii-text font-medium focus:outline-pink-400"
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-kawaii active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Lock in Today’s Answer & Streak! 🌸</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-3xl bg-pink-50/90 border border-pink-200">
                <p className="text-[11px] font-bold text-pink-700">{profile?.nickname || 'You'} wrote:</p>
                <p className="text-xs sm:text-sm text-kawaii-text font-medium mt-1">{myDailyAnswer}</p>
              </div>

              <div className="p-4 rounded-3xl bg-purple-50/90 border border-purple-200">
                <p className="text-[11px] font-bold text-purple-700">{partner?.profile?.nickname || 'Partner'} wrote:</p>
                <p className="text-xs sm:text-sm text-kawaii-text font-medium mt-1">{partnerDailyAnswer}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Calendar */}
      {activeTab === 'calendar' && (
        <div className="bg-white/90 rounded-4xl p-6 sm:p-8 shadow-kawaii border border-pink-100 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-kawaii-text">Our Couple Calendar</h2>
              <p className="text-xs text-kawaii-muted">Never forget an anniversary, birthday, or cozy date night.</p>
            </div>
            <button
              onClick={() => setShowAddEvent(!showAddEvent)}
              className="px-3.5 py-2 rounded-2xl bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Date</span>
            </button>
          </div>

          {showAddEvent && (
            <form onSubmit={handleAddEvent} className="p-4 bg-pink-50/70 rounded-3xl border border-pink-200 space-y-3">
              <input
                type="text"
                required
                placeholder="Title (e.g. 1 Year Anniversary)"
                value={newEvTitle}
                onChange={(e) => setNewEvTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={newEvDate}
                  onChange={(e) => setNewEvDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-pink-200 text-xs"
                />
                <select
                  value={newEvType}
                  onChange={(e) => setNewEvType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-pink-200 text-xs"
                >
                  <option value="anniversary">Anniversary</option>
                  <option value="birthday">Birthday</option>
                  <option value="date_night">Date Night</option>
                  <option value="trip">Trip</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 rounded-xl bg-kawaii-pink text-white font-bold text-xs">
                  Save Date 💖
                </button>
                <button type="button" onClick={() => setShowAddEvent(false)} className="px-4 py-2 rounded-xl bg-white text-kawaii-muted text-xs">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3 pt-2">
            {events.map((ev) => (
              <div key={ev.id} className="p-4 rounded-3xl bg-white border border-pink-100 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-kawaii-text">{ev.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 capitalize">
                      {ev.event_type.replace('_', ' ')}
                    </span>
                  </div>
                  {ev.notes && <p className="text-xs text-kawaii-muted mt-0.5">{ev.notes}</p>}
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm text-pink-600 block">{ev.event_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Gift Box */}
      {activeTab === 'gifts' && (
        <div className="bg-white/90 rounded-4xl p-6 sm:p-8 shadow-kawaii border border-pink-100 max-w-2xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-kawaii-text">Virtual Gift Box 🎁</h2>
              <p className="text-xs text-kawaii-muted">Send digital flowers, teddy bears, chocolates and sweet surprises!</p>
            </div>
            <button
              onClick={() => setShowSendGift(!showSendGift)}
              className="px-3.5 py-2 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <Gift className="w-4 h-4" />
              <span>Send Gift</span>
            </button>
          </div>

          {showSendGift && (
            <form onSubmit={handleSendGift} className="p-5 bg-rose-50/70 rounded-3xl border border-rose-200 space-y-4">
              <label className="block text-xs font-bold text-kawaii-text">Pick a Gift to Send:</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { type: 'bouquet', label: 'Bouquet', emoji: '💐' },
                  { type: 'teddy_bear', label: 'Teddy', emoji: '🧸' },
                  { type: 'chocolates', label: 'Chocolates', emoji: '🍫' },
                  { type: 'heart_locket', label: 'Locket', emoji: '💖' },
                  { type: 'shooting_star', label: 'Star', emoji: '⭐' },
                  { type: 'cupcake', label: 'Cupcake', emoji: '🧁' },
                ].map((g) => (
                  <button
                    key={g.type}
                    type="button"
                    onClick={() => setNewGiftType(g.type as any)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center transition-all ${
                      newGiftType === g.type ? 'border-rose-400 bg-white shadow-sm scale-105' : 'border-transparent bg-white/70'
                    }`}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="text-[10px] font-bold text-kawaii-text mt-1">{g.label}</span>
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                placeholder="Write a sweet love note attached to the gift..."
                value={newGiftMsg}
                onChange={(e) => setNewGiftMsg(e.target.value)}
                className="w-full p-3 rounded-2xl border border-rose-200 bg-white text-xs"
              />

              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs">
                  Deliver Gift With Love 💕
                </button>
                <button type="button" onClick={() => setShowSendGift(false)} className="px-4 py-2.5 rounded-xl bg-white text-kawaii-muted text-xs">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {gifts.map((g) => (
              <div
                key={g.id}
                className={`p-5 rounded-3xl border-2 transition-all ${
                  g.is_opened ? 'bg-white border-pink-100 shadow-2xs' : 'bg-pink-50 border-pink-300 shadow-kawaii-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getGiftEmoji(g.gift_type)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-bold text-sm text-kawaii-text capitalize">
                      {g.gift_type.replace('_', ' ')}
                    </p>
                    {g.is_opened ? (
                      <p className="text-xs text-kawaii-muted mt-1 leading-snug">&ldquo;{g.message}&rdquo;</p>
                    ) : (
                      <button
                        onClick={() => openGift(g.id)}
                        className="mt-2 px-3 py-1.5 rounded-xl bg-kawaii-pink hover:bg-kawaii-pink-deep text-white font-bold text-xs shadow-xs active:scale-95 cursor-pointer animate-bounce-gentle"
                      >
                        Unwrap Surprise! 🎁
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LittleCornerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-pink-500">Loading our corner... 🌸</div>}>
      <LittleCornerContent />
    </Suspense>
  );
}
