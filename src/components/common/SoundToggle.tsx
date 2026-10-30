'use client';

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '@/lib/sound/soundEngine';

export function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(soundEngine.isMuted());
    const handleToggle = (e: any) => {
      setMuted(e.detail.muted);
    };
    window.addEventListener('ustwo_sound_toggle', handleToggle);
    return () => window.removeEventListener('ustwo_sound_toggle', handleToggle);
  }, []);

  const handleClick = () => {
    const next = soundEngine.toggleMute();
    setMuted(next);
    if (!next) {
      soundEngine.playPop();
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={muted ? 'Unmute cute sound effects' : 'Mute cute sound effects'}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white text-kawaii-text hover:text-kawaii-pink shadow-sm border border-kawaii-border transition-all duration-200 active:scale-95"
      title={muted ? 'Sound: Muted' : 'Sound: On'}
    >
      {muted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-kawaii-pink" />}
    </button>
  );
}

