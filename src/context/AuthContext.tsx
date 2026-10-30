'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    nickname: string,
    avatarId: string
  ) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  createGuestProfile: (nickname: string, avatarId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ustwo_auth_profile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const configured = isSupabaseConfigured();

  // Helper to load or initialize fallback local profile
  const initLocalProfile = () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser({ id: parsed.id, email: parsed.email });
        setProfile(parsed);
      } catch {
        // bad json
      }
    }
  };

  useEffect(() => {
    if (!configured) {
      initLocalProfile();
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          initLocalProfile();
          setIsLoading(false);
          return;
        }

        const authUser = session.user;
        setUser({ id: authUser.id, email: authUser.email });

        // Fetch profile from database
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileData) {
          setProfile(profileData as Profile);
        } else {
          // Profile row doesn't exist yet, create default
          const defaultProfile: Profile = {
            id: authUser.id,
            email: authUser.email,
            nickname: authUser.email?.split('@')[0] || 'Sweetheart',
            avatar_id: 'bunny',
            custom_status: 'Ready to play! 💗',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          await supabase.from('profiles').upsert(defaultProfile);
          setProfile(defaultProfile);
        }
      } catch (err) {
        console.error('Auth session error:', err);
        initLocalProfile();
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) setProfile(data as Profile);
      } else {
        setUser(null);
        setProfile(null);
        initLocalProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!configured) {
      return { error: 'Supabase is not configured yet. You can play using guest mode!' };
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to sign in' };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    nickname: string,
    avatarId: string
  ) => {
    if (!configured) {
      // Local fallback
      createGuestProfile(nickname, avatarId);
      return {};
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nickname, avatar_id: avatarId },
        },
      });

      if (error) return { error: error.message };

      if (data.user) {
        const newProfile: Profile = {
          id: data.user.id,
          email,
          nickname,
          avatar_id: avatarId,
          custom_status: 'Just joined UsTwo! 🌸',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from('profiles').upsert(newProfile);
        setProfile(newProfile);
        setUser({ id: data.user.id, email });
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to sign up' };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return { error: 'No profile found' };

    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    setProfile(updated);

    if (!configured) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return {};
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to update profile' };
    }
  };

  const createGuestProfile = (nickname: string, avatarId: string) => {
    // Generate persistent UUID for this device
    const guestId = 'guest_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const guestProfile: Profile = {
      id: guestId,
      nickname,
      avatar_id: avatarId,
      custom_status: 'Playing together 💗',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(guestProfile));
    setUser({ id: guestId });
    setProfile(guestProfile);
  };

  const signOut = async () => {
    if (configured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isConfigured: configured,
        signInWithEmail,
        signUpWithEmail,
        updateProfile,
        signOut,
        createGuestProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
