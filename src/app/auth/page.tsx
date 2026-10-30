'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AVATAR_OPTIONS, KawaiiAvatar } from '@/lib/avatars';
import { soundEngine } from '@/lib/sound/soundEngine';

export default function AuthPage() {
  const router = useRouter();
  const { isConfigured, signInWithEmail, signUpWithEmail, createGuestProfile } = useAuth();

  const [mode, setMode] = useState<'guest' | 'login' | 'signup'>(isConfigured ? 'signup' : 'guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-4xl p-6 sm:p-8 shadow-kawaii border border-pink-100">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-3xl bg-pink-100 text-kawaii-pink mb-3 animate-float-slow">
            <Heart className="w-8 h-8 fill-kawaii-pink text-kawaii-pink" />
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-kawaii-text">
            {mode === 'login' ? 'Welcome Back 💗' : 'Join UsTwo 🌸'}
          </h1>
          <p className="text-xs sm:text-sm text-kawaii-muted mt-1">
            {mode === 'login'
              ? 'Connect with your favorite person'
              : 'Pick your cute avatar and nickname to get started'}
          </p>
        </div>

        {/* Mode Switcher */}
        {isConfigured && (
          <div className="flex p-1 bg-pink-50 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white text-kawaii-pink shadow-sm'
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
                  ? 'bg-white text-kawaii-pink shadow-sm'
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
                  ? 'bg-white text-kawaii-pink shadow-sm'
                  : 'text-kawaii-muted hover:text-kawaii-text'
              }`}
            >
              Quick Play
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selector (For signup & guest) */}
          {mode !== 'login' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-kawaii-text">
                Choose Your Kawaii Avatar
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playPop();
                      setSelectedAvatar(av.id);
                    }}
                    className={`flex flex-col items-center p-2 rounded-2xl border-2 transition-all active:scale-95 ${
                      selectedAvatar === av.id
                        ? 'border-kawaii-pink bg-pink-50 shadow-kawaii-sm scale-105'
                        : 'border-transparent hover:border-pink-200 bg-white/70'
                    }`}
                  >
                    <KawaiiAvatar id={av.id} size={42} />
                    <span className="text-[10px] font-semibold text-kawaii-text mt-1 truncate max-w-full">
                      {av.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nickname (For signup & guest) */}
          {mode !== 'login' && (
            <div>
              <label className="block text-xs font-bold text-kawaii-text mb-1">
                Your Nickname
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. My Honeybun, Mochi, Baby"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-pink-200 bg-pink-50/40 focus:bg-white text-xs sm:text-sm text-kawaii-text placeholder-pink-300 font-medium transition-all"
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-pink-200 bg-pink-50/40 focus:bg-white text-xs sm:text-sm text-kawaii-text placeholder-pink-300 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-kawaii-text mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-pink-200 bg-pink-50/40 focus:bg-white text-xs sm:text-sm text-kawaii-text placeholder-pink-300 font-medium transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            onClick={() => soundEngine.playClick()}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-sm shadow-kawaii hover:shadow-kawaii-hover transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin text-lg">🌸</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Enter Room' : 'Start Our Journey'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-kawaii-muted flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Private room for strictly two people. Always secure.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

