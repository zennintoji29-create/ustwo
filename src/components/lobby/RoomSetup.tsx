'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Users, Sparkles, ArrowRight, ShieldCheck, Copy, Check, Lock } from 'lucide-react';
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
    const url = typeof window !== 'undefined' ? `${window.location.origin}/join?code=${createdCode}` : createdCode;
    navigator.clipboard.writeText(url);
    soundEngine.playPop();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 my-auto">
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="kawaii-card p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Decorative corner blossom */}
        <div className="absolute top-2 right-3 text-2xl select-none opacity-40 animate-float-slow">🌸</div>
        <div className="absolute bottom-3 left-4 text-xl select-none opacity-30 animate-float-reverse">✨</div>

        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            whileHover={{ scale: 1.08, rotate: -4 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-400 via-rose-300 to-pink-300 text-white shadow-kawaii mb-3 animate-float-slow cursor-pointer"
          >
            <Heart className="w-8 h-8 fill-white text-white animate-pulse" />
          </motion.div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-kawaii-text">
            Welcome, {profile?.nickname || 'Love'}! 🌸
          </h2>
          <p className="text-xs sm:text-sm text-kawaii-text-muted font-medium mt-1">
            Create an encrypted private room for two, or enter your partner&apos;s code.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1.5 bg-pink-50/90 rounded-2xl mb-6 relative">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('create');
              setLocalErr(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 relative z-10 touch-target ${
              activeTab === 'create'
                ? 'text-pink-700 shadow-sm'
                : 'text-kawaii-text-muted hover:text-kawaii-text'
            }`}
          >
            {activeTab === 'create' && (
              <motion.div
                layoutId="setupTabPill"
                className="absolute inset-0 bg-white rounded-xl shadow-xs"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Create Our Room</span>
            </span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('join');
              setLocalErr(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 relative z-10 touch-target ${
              activeTab === 'join'
                ? 'text-pink-700 shadow-sm'
                : 'text-kawaii-text-muted hover:text-kawaii-text'
            }`}
          >
            {activeTab === 'join' && (
              <motion.div
                layoutId="setupTabPill"
                className="absolute inset-0 bg-white rounded-xl shadow-xs"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Join Partner&apos;s Room</span>
            </span>
          </button>
        </div>

        {/* Error banner */}
        {(localErr || error) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center"
          >
            {localErr || error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'create' ? (
            <motion.div
              key="createTab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {!createdCode ? (
                <div className="text-center py-3">
                  <p className="text-xs text-kawaii-text font-medium mb-5 leading-relaxed">
                    Tap below to generate your private couple room. Only the two of you will have access!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCreate}
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 hover:from-pink-600 hover:to-rose-500 text-white font-extrabold text-sm shadow-kawaii active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 touch-target"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isLoading ? 'Creating Room...' : 'Generate Our Private Room 💗'}</span>
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="p-5 rounded-3xl bg-pink-50/90 border border-pink-200/80 shadow-2xs">
                    <p className="text-xs font-bold text-kawaii-text-muted mb-1">Your Couple Room Code</p>
                    <p className="font-heading font-extrabold text-3xl tracking-widest text-pink-600 mb-2">
                      {createdCode}
                    </p>
                    <p className="text-[11px] text-pink-800 font-medium">
                      Share this code or copy the direct invitation link for your partner:
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleCopy}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-pink-50/80 border-2 border-pink-300 text-kawaii-pink font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all touch-target cursor-pointer"
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
                  </motion.button>

                  <p className="text-[11px] text-kawaii-text-muted font-bold flex items-center justify-center gap-1.5 pt-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Waiting for your partner to enter...</span>
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="joinTab"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleJoin}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-extrabold text-kawaii-text mb-1.5">
                  Enter 6-Character Room Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. US-8K2Q"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  required
                  className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 bg-pink-50/40 focus:bg-white text-center font-heading font-extrabold text-xl text-pink-600 placeholder-pink-300 tracking-widest transition-all touch-target"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading || !joinCode.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 hover:from-pink-600 hover:to-rose-500 text-white font-extrabold text-sm shadow-kawaii active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 touch-target"
              >
                <span>{isLoading ? 'Joining Room...' : 'Enter Our Room 💕'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Security badge */}
        <div className="mt-6 pt-4 border-t border-pink-100 flex items-center justify-center gap-2 text-[11px] text-kawaii-text-muted font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Strictly 2 people per room. Encrypted & completely private.</span>
        </div>
      </motion.div>
    </div>
  );
}
