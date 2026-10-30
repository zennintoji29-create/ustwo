'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { AVATAR_OPTIONS, KawaiiAvatar } from '@/lib/avatars';
import { soundEngine } from '@/lib/sound/soundEngine';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = ((params?.code as string) || '').toUpperCase();

  const { profile, createGuestProfile } = useAuth();
  const { joinRoom, isLoading, error } = useRoom();

  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('kitty');
  const [step, setStep] = useState<'profile' | 'joining'>('profile');
  const [localErr, setLocalErr] = useState<string | null>(null);

  useEffect(() => {
    if (profile && roomCode) {
      setStep('joining');
      joinRoom(roomCode).then((res) => {
        if (res.success) {
          router.push('/');
        } else {
          setLocalErr(res.error || 'Failed to join');
        }
      });
    }
  }, [profile, roomCode]);

  const handleProfileAndJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);
    const name = nickname.trim() || 'Sweetheart';
    createGuestProfile(name, selectedAvatar);
    soundEngine.playPop();

    const res = await joinRoom(roomCode);
    if (res.success) {
      soundEngine.playWin();
      router.push('/');
    } else {
      soundEngine.playError();
      setLocalErr(res.error || 'Failed to join room');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-kawaii-cream via-purple-50/40 to-kawaii-cream">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-4xl p-6 sm:p-8 shadow-kawaii border border-purple-100 text-center">
        <div className="inline-flex p-3 rounded-3xl bg-purple-100 text-purple-600 mb-3 animate-float-slow">
          <Heart className="w-8 h-8 fill-purple-400 text-purple-500" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-2">
          Room Invite: {roomCode}
        </span>
        <h1 className="font-heading font-bold text-2xl text-kawaii-text">
          Join Your Partner 💗
        </h1>
        <p className="text-xs sm:text-sm text-kawaii-muted mt-1 mb-6">
          Your favorite person invited you to connect in your private world!
        </p>

        {(localErr || error) && (
          <div className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {localErr || error}
          </div>
        )}

        {step === 'profile' && !profile && (
          <form onSubmit={handleProfileAndJoin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-kawaii-text mb-2">
                Choose Your Avatar
              </label>
              <div className="grid grid-cols-4 gap-2">
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
                        ? 'border-purple-400 bg-purple-50 shadow-sm scale-105'
                        : 'border-transparent hover:border-purple-200 bg-white/70'
                    }`}
                  >
                    <KawaiiAvatar id={av.id} size={38} />
                    <span className="text-[10px] font-semibold text-kawaii-text mt-1 truncate">
                      {av.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-kawaii-text mb-1">
                Your Nickname
              </label>
              <input
                type="text"
                required
                placeholder="e.g. My Honey, Kitty, Baby"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/40 focus:bg-white text-xs sm:text-sm text-kawaii-text placeholder-purple-300 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-sm shadow-kawaii active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Entering Room...' : 'Connect With My Love 💕'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 'joining' && (
          <div className="py-8 space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-pink-400 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-bold text-kawaii-text">Opening private room {roomCode}...</p>
          </div>
        )}
      </div>
    </div>
  );
}

