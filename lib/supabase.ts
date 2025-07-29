import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are not set. Authentication will not work.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Helper function to get current session and user
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Helper function to get current user (only after session check)
export const getCurrentUser = async () => {
  try {
    const { session, error } = await getCurrentSession();
    if (error) {
      console.error("Session error:", error);
      return { user: null, error: error };
    }
    if (!session) {
      return { user: null, error: new Error("No active session") };
    }
    return { user: session.user, error: null };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return { user: null, error: error instanceof Error ? error : new Error("Unknown error") };
  }
};

// Journal entry interface
export interface JournalEntry {
  id?: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string | null;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

// Game result interface
export interface GameResult {
  id?: string;
  user_id: string;
  game_type: string;
  duration: number; // in seconds
  score?: number;
  drift_count?: number; // for candle focus
  breath_count?: number; // for breathing games
  mood_before?: string;
  mood_after?: string;
  created_at?: string;
}

// Mood tracking interface
export interface MoodEntry {
  id?: string;
  user_id: string;
  mood: string;
  intensity?: number; // 1-10 scale
  notes?: string;
  created_at?: string;
}

// Achievement interface
export interface Achievement {
  id?: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at?: string;
  progress?: number;
  target?: number;
  is_unlocked: boolean;
  created_at?: string;
}

// Wellness Goal interface
export interface WellnessGoal {
  id?: string;
  user_id: string;
  title: string;
  description: string;
  goal_type: 'mood' | 'activity' | 'streak' | 'custom';
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string;
  is_completed: boolean;
  created_at?: string;
  completed_at?: string;
}
