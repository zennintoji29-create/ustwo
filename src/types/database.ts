export type RoomStatus = 'waiting' | 'active' | 'archived';
export type MemberRole = 'creator' | 'partner';
export type MemberMood = 'happy' | 'sleepy' | 'in_love' | 'playful' | 'cuddly' | 'hungry' | 'cozy';

export interface Profile {
  id: string;
  email?: string;
  nickname: string;
  avatar_id: string;
  custom_status: string;
  created_at: string;
  updated_at: string;
}

export interface CoupleRoom {
  id: string;
  code: string;
  created_by: string;
  status: RoomStatus;
  anniversary_date?: string | null;
  theme_id: string;
  activity_count: number;
  streak_days: number;
  created_at: string;
  updated_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: MemberRole;
  is_ready: boolean;
  mood: MemberMood;
  last_seen_at: string;
  joined_at: string;
  profile?: Profile;
}

export type GameType =
  | 'memory_match'
  | 'how_well_do_you_know_me'
  | 'truth_or_dare'
  | 'would_you_rather'
  | 'guess_my_answer'
  | 'memory_lane'
  | 'rapid_fire'
  | 'emoji_decoder'
  | 'who_is_more_likely'
  | 'draw_and_guess'
  | 'tic_tac_toe'
  | 'secret_questions';

export type GameStatus = 'lobby' | 'in_progress' | 'round_complete' | 'completed' | 'abandoned';

export interface GameSession<TState = Record<string, any>> {
  id: string;
  room_id: string;
  game_type: GameType;
  status: GameStatus;
  round_number: number;
  total_rounds: number;
  current_turn: string | null;
  scores: Record<string, number>;
  game_state: TState;
  winner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BucketListItem {
  id: string;
  room_id: string;
  created_by: string;
  title: string;
  description: string;
  category: 'adventure' | 'cozy' | 'food' | 'travel' | 'creative';
  is_completed: boolean;
  completed_at?: string | null;
  target_date?: string | null;
  created_at: string;
}

export interface LoveNote {
  id: string;
  room_id: string;
  sender_id: string;
  recipient_id?: string;
  content: string;
  sticker_id: string;
  stationery_style: string;
  is_favorite: boolean;
  created_at: string;
  sender?: Profile;
}

export interface DailyQuestion {
  id: string;
  prompt: string;
  category: string;
  created_at: string;
}

export interface DailyAnswer {
  id: string;
  room_id: string;
  question_id: string;
  user_id: string;
  answer: string;
  date_answered: string;
  revealed: boolean;
  created_at: string;
  user?: Profile;
}

export interface CalendarEvent {
  id: string;
  room_id: string;
  created_by: string;
  title: string;
  event_date: string;
  event_type: 'anniversary' | 'birthday' | 'date_night' | 'trip' | 'milestone';
  reminder_days_before: number;
  notes?: string;
  created_at: string;
}

export interface VirtualGift {
  id: string;
  room_id: string;
  sender_id: string;
  recipient_id: string;
  gift_type: 'bouquet' | 'teddy_bear' | 'chocolates' | 'heart_locket' | 'shooting_star' | 'cupcake';
  message?: string;
  is_opened: boolean;
  opened_at?: string;
  created_at: string;
  sender?: Profile;
}

export interface SavedMemory {
  id: string;
  room_id: string;
  created_by: string;
  title: string;
  memory_date: string;
  location_name?: string;
  story: string;
  photo_url?: string;
  tag: string;
  created_at: string;
}

