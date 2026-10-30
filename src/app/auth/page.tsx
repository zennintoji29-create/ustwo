'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AVATAR_OPTIONS, KawaiiAvatar } from '@/lib/avatars';
import { soundEngine } from '@/lib/sound/soundEngine';

export default function AuthPage() {
  const router = useRouter();
  const { isConfigured, signInWithEmail, signUpWithEmail, createGuestProfile } = useAuth();

  const [mode, setMode] = useState<'guest' | 'login' | 'signup'>(isConfigured ? 'signup' : 'guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('bunny');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (mode === 'guest') {
      const name = nickname.trim() || 'Sweetheart';
      createGuestProfile(name, selectedAvatar);
      soundEngine.playMatch();
      setLoading(false);
      router.push('/');
      return;
    }

    if (mode === 'signup') {
      const name = nickname.trim() || 'Sweetheart';
      const res = await signUpWithEmail(email, password, name, selectedAvatar);
      setLoading(false);
      if (res.error) {
        soundEngine.playError();
        setErrorMsg(res.error);
      } else {
        soundEngine.playWin();
        router.push('/');
      }
      return;
    }

    if (mode === 'login') {
      const res = await signInWithEmail(email, password);
      setLoading(false);
      if (res.error) {
        soundEngine.playError();
        setErrorMsg(res.error);
      } else {
        soundEngine.playWin();
        router.push('/');
      }
      return;
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-kawaii-cream via-pink-50/40 to-kawaii-cream">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-4xl p-6 sm:p-8 shadow-kawaii border border-pink-100"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
            whileTap={{ scale: 0.9 }}
            onClick={() => soundEngine.playPop()}
            className="inline-flex p-3 rounded-3xl bg-pink-100 text-kawaii-pink mb-3 cursor-pointer shadow-xs border border-pink-200"
          >
            <Heart className="w-8 h-8 fill-kawaii-pink text-kawaii-pink" />
          </motion.div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-kawaii-text">
            {mode === 'login' ? 'Welcome Back 💗' : mode === 'signup' ? 'Join UsTwo 🌸' : 'Quick Play Mode 🧸'}
          </h1>
          <p className="text-xs sm:text-sm text-kawaii-muted mt-1 font-medium">
            {mode === 'login'
              ? 'Sign in to reconnect with your favorite person'
              : mode === 'signup'
              ? 'Pick your cute avatar and nickname to get started'
              : 'Create a local player profile to join or host a room right now'}
          </p>
        </div>

        {/* Mode Switcher */}
        {isConfigured && (
          <div className="flex p-1 bg-pink-50 rounded-2xl mb-6 border border-pink-100">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white text-kawaii-pink shadow-xs'
                  : 'text-kawaii-muted hover:text-kawaii-text'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-kawaii-pink shadow-xs'
                  : 'text-kawaii-muted hover:text-kawaii-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setMode('guest');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'guest'
                  ? 'bg-white text-kawaii-pink shadow-xs'
                  : 'text-kawaii-muted hover:text-kawaii-text'
              }`}
            >
              Quick Play
            </button>
          </div>
        )}

        {/* Animated Error message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: [-8, 8, -6, 6, -3, 3, 0] }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center flex items-center justify-center gap-1.5"
            >
              <span>🌸</span>
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selector (For signup & guest) */}
          {mode !== 'login' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-kawaii-text">
                Choose Your Kawaii Mascot
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {AVATAR_OPTIONS.map((av) => {
                  const isSelected = selectedAvatar === av.id;
                  return (
                    <motion.button
                      key={av.id}
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        soundEngine.playPop();
                        setSelectedAvatar(av.id);
                      }}
                      className={`flex flex-col items-center p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-kawaii-pink bg-pink-50 shadow-kawaii-sm'
                          : 'border-transparent hover:border-pink-200 bg-white/70'
                      }`}
                    >
                      <KawaiiAvatar id={av.id} size={42} />
                      <span className="text-[10px] font-bold text-kawaii-text mt-1 truncate max-w-full">
                        {av.name.split(' ')[0]}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nickname (For signup & guest) */}
          {mode !== 'login' && (
            <div>
              <label className="block text-xs font-bold text-kawaii-text mb-1">
                Your Cute Nickname
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. My Honeybun, Mochi, Baby"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-pink-200 bg-pink-50/40 focus:bg-white text-xs sm:text-sm text-kawaii-text placeholder-pink-300 font-medium transition-all focus:border-pink-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Email & Password (For Supabase Auth) */}
          {mode !== 'guest' && (
            <>
              <div>
                <label className="block text-xs font-bold text-kawaii-text mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="you@love.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-pink-200 bg-pink-50/40 focus:bg-white text-xs sm:text-sm text-kawaii-text placeholder-pink-300 font-medium transition-all focus:border-pink-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-kawaii-text">
                    Password
                  </label>
                  <span className="text-[10px] text-kawaii-muted font-medium">Min 6 characters 💕</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-pink-200 bg-pink-50/40 focus:bg-white text-xs sm:text-sm text-kawaii-text placeholder-pink-300 font-medium transition-all focus:border-pink-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            onClick={() => soundEngine.playClick()}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-sm shadow-kawaii hover:shadow-kawaii-hover transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin text-lg">🌸</span>
            ) : (
              <>
                <span>
                  {mode === 'login' ? 'Enter Our Room' : mode === 'signup' ? 'Start Our Journey' : 'Play As Guest'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-kawaii-muted flex items-center justify-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Private room for strictly two people. Encrypted & secure.</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
