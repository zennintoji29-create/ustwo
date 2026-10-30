'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';
import { CoupleRoom, RoomMember, GameSession, MemberMood, GameType } from '@/types/database';
import { soundEngine } from '@/lib/sound/soundEngine';

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'waiting_for_partner'
  | 'partner_connected'
  | 'both_ready'
  | 'reconnecting'
  | 'disconnected';

interface RoomContextType {
  room: CoupleRoom | null;
  myMember: RoomMember | null;
  partner: RoomMember | null;
  connectionStatus: ConnectionStatus;
  isPartnerOnline: boolean;
  isPartnerReconnecting: boolean;
  activeGame: GameSession | null;
  reactions: Array<{ id: string; emoji: string; x: number; y: number }>;
  isLoading: boolean;
  error: string | null;
  createRoom: () => Promise<{ code?: string; error?: string }>;
  joinRoom: (code: string) => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => Promise<void>;
  toggleReady: () => Promise<void>;
  updateMood: (mood: MemberMood) => Promise<void>;
  sendReaction: (emoji: string) => void;
  broadcastDrawStroke: (stroke: any) => void;
  onDrawStroke: (callback: (stroke: any) => void) => () => void;
  startOrJoinGame: (gameType: GameType) => Promise<{ session?: GameSession; error?: string }>;
  updateGameSession: (updates: Partial<GameSession>) => Promise<void>;
  refreshRoomData: () => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [room, setRoom] = useState<CoupleRoom | null>(null);
  const [myMember, setMyMember] = useState<RoomMember | null>(null);
  const [partner, setPartner] = useState<RoomMember | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [isPartnerOnline, setIsPartnerOnline] = useState<boolean>(false);
  const [isPartnerReconnecting, setIsPartnerReconnecting] = useState<boolean>(false);
  const [activeGame, setActiveGame] = useState<GameSession | null>(null);
  const [reactions, setReactions] = useState<Array<{ id: string; emoji: string; x: number; y: number }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<any>(null);
  const strokeListenersRef = useRef<Set<(stroke: any) => void>>(new Set());
  const configured = isSupabaseConfigured();

  // Helper to load room from local storage on refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedRoom = localStorage.getItem('ustwo_active_room');
    if (savedRoom && !room) {
      try {
        const parsed = JSON.parse(savedRoom);
        setRoom(parsed);
      } catch {}
    }
  }, [room]);

  // Save room state locally for quick re-hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (room) {
      localStorage.setItem('ustwo_active_room', JSON.stringify(room));
    } else {
      localStorage.removeItem('ustwo_active_room');
    }
  }, [room]);

  // Real-time synchronization loop
  useEffect(() => {
    if (!room || !profile) return;

    setConnectionStatus('connecting');

    if (configured) {
      const supabase = createClient();
      const channelName = `room:${room.id}`;

      const channel = supabase.channel(channelName, {
        config: {
          presence: { key: profile.id },
          broadcast: { self: false },
        },
      });

      // Presence tracking
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const userIds = Object.keys(state);
          const partnerUserId = userIds.find((id) => id !== profile.id);

          if (partnerUserId) {
            setIsPartnerOnline(true);
            setIsPartnerReconnecting(false);
            const partnerPresence = (state[partnerUserId]?.[0] as any) || {};

            setPartner((prev) => {
              if (!prev) {
                return {
                  id: partnerUserId,
                  room_id: room.id,
                  user_id: partnerUserId,
                  role: 'partner',
                  is_ready: Boolean(partnerPresence.is_ready),
                  mood: partnerPresence.mood || 'happy',
                  last_seen_at: new Date().toISOString(),
                  joined_at: new Date().toISOString(),
                  profile: {
                    id: partnerUserId,
                    nickname: partnerPresence.nickname || 'Sweetheart',
                    avatar_id: partnerPresence.avatar_id || 'kitty',
                    custom_status: 'Online',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                };
              }
              return {
                ...prev,
                is_ready: Boolean(partnerPresence.is_ready),
                mood: partnerPresence.mood || prev.mood,
              };
            });
          } else {
            setIsPartnerOnline(false);
          }
        })
        .on('presence', { event: 'join' }, ({ newPresences }: { newPresences: any[] }) => {
          const joinedPartner = newPresences.find((p: any) => p.user_id !== profile.id);
          if (joinedPartner) {
            soundEngine.playPop();
            setIsPartnerOnline(true);
            setIsPartnerReconnecting(false);
          }
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }: { leftPresences: any[] }) => {
          const leftPartner = leftPresences.find((p: any) => p.user_id !== profile.id);
          if (leftPartner) {
            setIsPartnerOnline(false);
            setIsPartnerReconnecting(true);
          }
        });

      // Broadcast channels (Reactions, draw strokes)
      channel
        .on('broadcast', { event: 'reaction' }, ({ payload }: { payload: any }) => {
          soundEngine.playPop();
          addReaction(payload.emoji, payload.x, payload.y);
        })
        .on('broadcast', { event: 'draw_stroke' }, ({ payload }: { payload: any }) => {
          strokeListenersRef.current.forEach((cb) => cb(payload));
        })
        .on('broadcast', { event: 'game_move' }, ({ payload }: { payload: any }) => {
          setActiveGame(payload.session);
        });

      // Postgres Changes (game_sessions & room_members)
      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'game_sessions', filter: `room_id=eq.${room.id}` },
          (payload: any) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              setActiveGame(payload.new as GameSession);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${room.id}` },
          (payload: any) => {
            if (payload.new && (payload.new as any).user_id !== profile.id) {
              setPartner((prev) => (prev ? { ...prev, ...(payload.new as any) } : (payload.new as any)));
            } else if (payload.new) {
              setMyMember((prev) => (prev ? { ...prev, ...(payload.new as any) } : (payload.new as any)));
            }
          }
        );

      channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: profile.id,
            nickname: profile.nickname,
            avatar_id: profile.avatar_id,
            is_ready: myMember?.is_ready || false,
            mood: myMember?.mood || 'happy',
            online_at: new Date().toISOString(),
          });
        }
      });

      channelRef.current = channel;

      return () => {
        channel.unsubscribe();
      };
    } else {
      // Local fallback using window BroadcastChannel for multi-tab testing
      const bc = new BroadcastChannel(`ustwo_room_${room.id}`);

      // Announce arrival
      bc.postMessage({
        type: 'PRESENCE_ANNOUNCE',
        user: profile,
        is_ready: myMember?.is_ready || false,
        mood: myMember?.mood || 'happy',
      });

      bc.onmessage = (event) => {
        const { type, payload, user, is_ready, mood } = event.data;

        if (type === 'PRESENCE_ANNOUNCE') {
          if (user.id !== profile.id) {
            setIsPartnerOnline(true);
            setIsPartnerReconnecting(false);
            setPartner({
              id: user.id,
              room_id: room.id,
              user_id: user.id,
              role: 'partner',
              is_ready: Boolean(is_ready),
              mood: mood || 'happy',
              last_seen_at: new Date().toISOString(),
              joined_at: new Date().toISOString(),
              profile: user,
            });

            // Reply back so partner knows we are here too
            bc.postMessage({
              type: 'PRESENCE_REPLY',
              user: profile,
              is_ready: myMember?.is_ready || false,
              mood: myMember?.mood || 'happy',
            });
          }
        } else if (type === 'PRESENCE_REPLY') {
          if (user.id !== profile.id) {
            setIsPartnerOnline(true);
            setIsPartnerReconnecting(false);
            setPartner({
              id: user.id,
              room_id: room.id,
              user_id: user.id,
              role: 'partner',
              is_ready: Boolean(is_ready),
              mood: mood || 'happy',
              last_seen_at: new Date().toISOString(),
              joined_at: new Date().toISOString(),
              profile: user,
            });
          }
        } else if (type === 'REACTION') {
          soundEngine.playPop();
          addReaction(payload.emoji, payload.x, payload.y);
        } else if (type === 'DRAW_STROKE') {
          strokeListenersRef.current.forEach((cb) => cb(payload));
        } else if (type === 'GAME_SESSION_UPDATE') {
          setActiveGame(payload);
        } else if (type === 'READY_TOGGLE') {
          if (user.id !== profile.id) {
            setPartner((prev) => (prev ? { ...prev, is_ready: Boolean(payload.is_ready) } : null));
          }
        } else if (type === 'MOOD_UPDATE') {
          if (user.id !== profile.id) {
            setPartner((prev) => (prev ? { ...prev, mood: payload.mood } : null));
          }
        }
      };

      channelRef.current = bc;

      return () => {
        bc.close();
      };
    }
  }, [room, profile, configured, myMember?.is_ready, myMember?.mood]);

  // Compute composite connection status
  useEffect(() => {
    if (!room) {
      setConnectionStatus('idle');
    } else if (!isPartnerOnline) {
      setConnectionStatus(isPartnerReconnecting ? 'reconnecting' : 'waiting_for_partner');
    } else if (myMember?.is_ready && partner?.is_ready) {
      setConnectionStatus('both_ready');
    } else {
      setConnectionStatus('partner_connected');
    }
  }, [room, isPartnerOnline, isPartnerReconnecting, myMember?.is_ready, partner?.is_ready]);

  const addReaction = (emoji: string, x?: number, y?: number) => {
    const newReaction = {
      id: Math.random().toString(),
      emoji,
      x: x ?? (window.innerWidth ? Math.random() * (window.innerWidth - 80) + 40 : 100),
      y: y ?? (window.innerHeight ? window.innerHeight - 150 : 300),
    };
    setReactions((prev) => [...prev.slice(-15), newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2500);
  };

  const sendReaction = (emoji: string) => {
    soundEngine.playPop();
    const x = typeof window !== 'undefined' ? Math.random() * (window.innerWidth - 80) + 40 : 100;
    const y = typeof window !== 'undefined' ? window.innerHeight - 140 : 300;
    addReaction(emoji, x, y);

    if (configured && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'reaction',
        payload: { emoji, x, y },
      });
    } else if (channelRef.current?.postMessage) {
      channelRef.current.postMessage({
        type: 'REACTION',
        payload: { emoji, x, y },
      });
    }
  };

  const broadcastDrawStroke = (stroke: any) => {
    if (configured && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'draw_stroke',
        payload: stroke,
      });
    } else if (channelRef.current?.postMessage) {
      channelRef.current.postMessage({
        type: 'DRAW_STROKE',
        payload: stroke,
      });
    }
  };

  const onDrawStroke = useCallback((callback: (stroke: any) => void) => {
    strokeListenersRef.current.add(callback);
    return () => {
      strokeListenersRef.current.delete(callback);
    };
  }, []);

  const createRoom = async () => {
    if (!profile) return { error: 'Please set up your profile first' };
    setIsLoading(true);
    setError(null);

    // Generate cute 6-char room code: US-XXXX
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `US-${randomPart}`;

    const newRoom: CoupleRoom = {
      id: 'room_' + Math.random().toString(36).substring(2, 10),
      code,
      created_by: profile.id,
      status: 'waiting',
      theme_id: 'cherry_blossom',
      activity_count: 0,
      streak_days: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newMember: RoomMember = {
      id: 'member_' + Math.random().toString(36).substring(2, 8),
      room_id: newRoom.id,
      user_id: profile.id,
      role: 'creator',
      is_ready: false,
      mood: 'happy',
      last_seen_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
      profile,
    };

    if (configured) {
      try {
        const supabase = createClient();
        const { data: roomData, error: roomError } = await supabase
          .from('couple_rooms')
          .insert({
            code,
            created_by: profile.id,
            status: 'waiting',
            theme_id: 'cherry_blossom',
          })
          .select()
          .single();

        if (roomError) throw roomError;

        await supabase.from('room_members').insert({
          room_id: roomData.id,
          user_id: profile.id,
          role: 'creator',
          mood: 'happy',
        });

        setRoom(roomData as CoupleRoom);
        setMyMember({ ...newMember, room_id: roomData.id });
        setIsLoading(false);
        soundEngine.playMatch();
        return { code };
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Failed to create room in database');
        return { error: err.message };
      }
    } else {
      // Local testing mode
      setRoom(newRoom);
      setMyMember(newMember);
      setIsLoading(false);
      soundEngine.playMatch();
      return { code };
    }
  };

  const joinRoom = async (code: string) => {
    if (!profile) return { success: false, error: 'Please set up your profile first' };
    const cleanCode = code.trim().toUpperCase();
    setIsLoading(true);
    setError(null);

    if (configured) {
      try {
        const supabase = createClient();
        const { data: roomData, error: roomErr } = await supabase
          .from('couple_rooms')
          .select('*')
          .eq('code', cleanCode)
          .single();

        if (roomErr || !roomData) {
          setIsLoading(false);
          return { success: false, error: 'Room code not found. Check for typos!' };
        }

        // Check current member count
        const { data: members, error: memErr } = await supabase
          .from('room_members')
          .select('*, profile:profiles(*)')
          .eq('room_id', roomData.id);

        if (memErr) throw memErr;

        const isAlreadyMember = members?.some((m: any) => m.user_id === profile.id);
        if (!isAlreadyMember && members && members.length >= 2) {
          setIsLoading(false);
          return { success: false, error: 'This private room is already full (maximum 2 partners).' };
        }

        let myMem = members?.find((m: any) => m.user_id === profile.id);
        if (!myMem) {
          const { data: inserted, error: insertErr } = await supabase
            .from('room_members')
            .insert({
              room_id: roomData.id,
              user_id: profile.id,
              role: 'partner',
              mood: 'happy',
            })
            .select('*, profile:profiles(*)')
            .single();

          if (insertErr) throw insertErr;
          myMem = inserted;
        }

        const otherMem = members?.find((m: any) => m.user_id !== profile.id);

        setRoom(roomData as CoupleRoom);
        setMyMember(myMem as RoomMember);
        if (otherMem) setPartner(otherMem as RoomMember);

        setIsLoading(false);
        soundEngine.playMatch();
        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Failed to join room');
        return { success: false, error: err.message };
      }
    } else {
      // Local fallback
      const mockRoom: CoupleRoom = {
        id: 'room_' + cleanCode,
        code: cleanCode,
        created_by: 'host_partner',
        status: 'active',
        theme_id: 'cherry_blossom',
        activity_count: 1,
        streak_days: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockMyMember: RoomMember = {
        id: 'mem_' + profile.id,
        room_id: mockRoom.id,
        user_id: profile.id,
        role: 'partner',
        is_ready: false,
        mood: 'happy',
        last_seen_at: new Date().toISOString(),
        joined_at: new Date().toISOString(),
        profile,
      };

      setRoom(mockRoom);
      setMyMember(mockMyMember);
      setIsLoading(false);
      soundEngine.playMatch();
      return { success: true };
    }
  };

  const leaveRoom = async () => {
    setRoom(null);
    setMyMember(null);
    setPartner(null);
    setActiveGame(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ustwo_active_room');
    }
  };

  const toggleReady = async () => {
    if (!myMember) return;
    const nextReady = !myMember.is_ready;
    setMyMember({ ...myMember, is_ready: nextReady });
    soundEngine.playClick();

    if (configured && room) {
      const supabase = createClient();
      await supabase
        .from('room_members')
        .update({ is_ready: nextReady })
        .eq('id', myMember.id);
    } else if (channelRef.current?.postMessage) {
      channelRef.current.postMessage({
        type: 'READY_TOGGLE',
        user: profile,
        payload: { is_ready: nextReady },
      });
    }
  };

  const updateMood = async (mood: MemberMood) => {
    if (!myMember) return;
    setMyMember({ ...myMember, mood });
    soundEngine.playPop();

    if (configured && room) {
      const supabase = createClient();
      await supabase
        .from('room_members')
        .update({ mood })
        .eq('id', myMember.id);
    } else if (channelRef.current?.postMessage) {
      channelRef.current.postMessage({
        type: 'MOOD_UPDATE',
        user: profile,
        payload: { mood },
      });
    }
  };

  const startOrJoinGame = async (gameType: GameType) => {
    if (!room || !profile) return { error: 'No active room' };

    const initialSession: GameSession = {
      id: 'session_' + Math.random().toString(36).substring(2, 9),
      room_id: room.id,
      game_type: gameType,
      status: 'in_progress',
      round_number: 1,
      total_rounds: 5,
      current_turn: profile.id,
      scores: { [profile.id]: 0, ...(partner ? { [partner.user_id]: 0 } : {}) },
      game_state: {},
      winner_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setActiveGame(initialSession);
    soundEngine.playWin();

    if (configured) {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from('game_sessions')
        .insert({
          room_id: room.id,
          game_type: gameType,
          status: 'in_progress',
          round_number: 1,
          total_rounds: 5,
          current_turn: profile.id,
          scores: initialSession.scores,
          game_state: {},
        })
        .select()
        .single();

      if (err) return { error: err.message };
      setActiveGame(data as GameSession);
      return { session: data as GameSession };
    } else if (channelRef.current?.postMessage) {
      channelRef.current.postMessage({
        type: 'GAME_SESSION_UPDATE',
        payload: initialSession,
      });
    }

    return { session: initialSession };
  };

  const updateGameSession = async (updates: Partial<GameSession>) => {
    if (!activeGame) return;
    const nextGame = { ...activeGame, ...updates, updated_at: new Date().toISOString() };
    setActiveGame(nextGame);

    if (configured) {
      const supabase = createClient();
      await supabase
        .from('game_sessions')
        .update(updates)
        .eq('id', activeGame.id);
    } else if (channelRef.current?.postMessage) {
      channelRef.current.postMessage({
        type: 'GAME_SESSION_UPDATE',
        payload: nextGame,
      });
    }
  };

  const refreshRoomData = async () => {
    if (!room || !configured) return;
    try {
      const supabase = createClient();
      const { data: roomData } = await supabase
        .from('couple_rooms')
        .select('*')
        .eq('id', room.id)
        .single();

      if (roomData) setRoom(roomData as CoupleRoom);

      const { data: members } = await supabase
        .from('room_members')
        .select('*, profile:profiles(*)')
        .eq('room_id', room.id);

      if (members && profile) {
        const myM = members.find((m: any) => m.user_id === profile.id);
        const othM = members.find((m: any) => m.user_id !== profile.id);
        if (myM) setMyMember(myM as RoomMember);
        if (othM) setPartner(othM as RoomMember);
      }
    } catch {}
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        myMember,
        partner,
        connectionStatus,
        isPartnerOnline,
        isPartnerReconnecting,
        activeGame,
        reactions,
        isLoading,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
        toggleReady,
        updateMood,
        sendReaction,
        broadcastDrawStroke,
        onDrawStroke,
        startOrJoinGame,
        updateGameSession,
        refreshRoomData,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
