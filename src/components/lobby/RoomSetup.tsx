'use client';

import React, { useState } from 'react';
import { Heart, Plus, Users, Sparkles, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { soundEngine } from '@/lib/sound/soundEngine';

export function RoomSetup() {
  const { profile } = useAuth();
  const { createRoom, joinRoom, isLoading, error } = useRoom();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  const handleCreate = async () => {
    soundEngine.playClick();
    setLocalErr(null);
    const res = await createRoom();
    if (res.code) {
      setCreatedCode(res.code);
    } else if (res.error) {
      soundEngine.playError();
      setLocalErr(res.error);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    setLocalErr(null);
    if (!joinCode.trim()) return;

    const res = await joinRoom(joinCode);
    if (!res.success) {
      soundEngine.playError();
      setLocalErr(res.error || 'Could not find that room code');
    }
  };

  const handleCopy = () => {
    if (!createdCode) return;
    const url = typeof window !== 'undefined' ? `${window.location.origin}/join/${createdCode}` : createdCode;
    navigator.clipboard.writeText(url);
    soundEngine.playPop();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-4xl p-6 sm:p-8 shadow-kawaii border border-pink-100">
        {/* Cute Mascot & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-400 to-rose-300 text-white shadow-kawaii mb-3 animate-float-slow">
            <Heart className="w-8 h-8 fill-white text-white animate-pulse" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-kawaii-text">
            Welcome, {profile?.nickname || 'Love'}! 🌸
          </h2>
          <p className="text-xs sm:text-sm text-kawaii-muted mt-1">
            Create a private room for you and your partner, or enter their invite code.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-pink-50 rounded-2xl mb-6">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('create');
              setLocalErr(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-white text-kawaii-pink shadow-sm'
                : 'text-kawaii-muted hover:text-kawaii-text'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Our Room</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('join');
              setLocalErr(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'join'
                ? 'bg-white text-kawaii-pink shadow-sm'
                : 'text-kawaii-muted hover:text-kawaii-text'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Join Existing Room</span>
          </button>
        </div>

        {/* Error banner */}
        {(localErr || error) && (
          <div className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            {localErr || error}
          </div>
        )}

        {/* Create Room Tab */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            {!createdCode ? (
              <div className="text-center py-4">
                <p className="text-xs text-kawaii-text mb-4 leading-relaxed">
                  Press below to generate your private, encrypted couple room. Only the two of you can ever enter!
                </p>
                <button
                  onClick={handleCreate}
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-sm shadow-kawaii hover:shadow-kawaii-hover transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isLoading ? 'Creating Room...' : 'Generate Our Private Room 💗'}</span>
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 rounded-3xl bg-pink-50/80 border border-pink-200">
                  <p className="text-xs font-semibold text-kawaii-muted mb-1">Your Couple Room Code</p>
                  <p className="font-heading font-extrabold text-3xl tracking-wider text-pink-600 mb-2">
                    {createdCode}
                  </p>
                  <p className="text-[11px] text-pink-800">
                    Share this code or copy the direct invitation link for your partner:
                  </p>
                </div>

                <button
                  onClick={handleCopy}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-pink-50 border border-pink-300 text-kawaii-pink font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Invite Link Copied! Send to Partner 💕</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Invitation Link 💌</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-kawaii-muted flex items-center justify-center gap-1.5 pt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Waiting for your partner to join...</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Join Room Tab */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-kawaii-text mb-1.5">
                Enter 6-Character Room Code
              </label>
              <input
                type="text"
                placeholder="e.g. US-8K2Q"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={10}
                required
                className="w-full px-4 py-3 rounded-2xl border border-pink-200 bg-pink-50/40 focus:bg-white text-center font-heading font-bold text-lg text-pink-600 placeholder-pink-300 tracking-wider transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !joinCode.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-sm shadow-kawaii hover:shadow-kawaii-hover transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Joining Room...' : 'Enter Our Room 💕'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Security badge */}
        <div className="mt-6 pt-4 border-t border-pink-100 flex items-center justify-center gap-2 text-[11px] text-kawaii-muted">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Strictly 2 people per room. Encrypted & completely private.</span>
        </div>
      </div>
    </div>
  );
}

