import { supabase, Achievement, WellnessGoal } from './supabase';

export class AchievementService {
  // Achievement definitions
  static readonly ACHIEVEMENTS = {
    FIRST_MOOD: {
      type: 'first_mood',
      title: 'First Step',
      description: 'Recorded your first mood entry',
      icon: '🎯',
      target: 1
    },
    MOOD_STREAK_3: {
      type: 'mood_streak',
      title: 'Consistent Tracker',
      description: 'Tracked mood for 3 consecutive days',
      icon: '🔥',
      target: 3
    },
    MOOD_STREAK_7: {
      type: 'mood_streak',
      title: 'Week Warrior',
      description: 'Tracked mood for 7 consecutive days',
      icon: '⭐',
      target: 7
    },
    MOOD_STREAK_30: {
      type: 'mood_streak',
      title: 'Monthly Master',
      description: 'Tracked mood for 30 consecutive days',
      icon: '👑',
      target: 30
    },
    POSITIVE_MOOD: {
      type: 'positive_mood',
      title: 'Sunshine Seeker',
      description: 'Recorded 5 positive moods in a week',
      icon: '☀️',
      target: 5
    },
    GAME_PLAYER: {
      type: 'game_player',
      title: 'Mindful Gamer',
      description: 'Played your first mindfulness game',
      icon: '🎮',
      target: 1
    },
    GAME_MASTER: {
      type: 'game_master',
      title: 'Zen Master',
      description: 'Completed 10 mindfulness games',
      icon: '🧘',
      target: 10
    },
    JOURNAL_WRITER: {
      type: 'journal_writer',
      title: 'Thoughtful Writer',
      description: 'Wrote your first journal entry',
      icon: '📝',
      target: 1
    },
    JOURNAL_MASTER: {
      type: 'journal_master',
      title: 'Reflection Expert',
      description: 'Wrote 10 journal entries',
      icon: '📚',
      target: 10
    },
    ANALYSIS_USER: {
      type: 'analysis_user',
      title: 'Self-Aware',
      description: 'Completed your first mood analysis',
      icon: '🧠',
      target: 1
    }
  };

  // Check and award achievements
  static async checkAchievements(userId: string): Promise<Achievement[]> {
    try {
      console.log('Starting achievement check for user:', userId);
      
      // Get user's current achievements
      const { data: existingAchievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId);

      console.log('Existing achievements:', existingAchievements?.length || 0);

      const unlockedAchievements: Achievement[] = [];

      // Check each achievement type
      for (const [, achievement] of Object.entries(this.ACHIEVEMENTS)) {
        const existing = existingAchievements?.find(a => a.achievement_type === achievement.type);
        
        if (!existing || !existing.is_unlocked) {
          const progress = await this.calculateProgress(userId, achievement.type);
          
          console.log(`Checking ${achievement.type}: progress=${progress}, target=${achievement.target}`);
          
          if (progress >= achievement.target) {
            console.log(`Unlocking achievement: ${achievement.title}`);
            
            // Award achievement
            const newAchievement: Achievement = {
              user_id: userId,
              achievement_type: achievement.type,
              title: achievement.title,
              description: achievement.description,
              icon: achievement.icon,
              unlocked_at: new Date().toISOString(),
              progress: progress,
              target: achievement.target,
              is_unlocked: true
            };

            const { data, error } = await supabase
              .from('achievements')
              .upsert([newAchievement])
              .select();

            if (!error && data) {
              unlockedAchievements.push(data[0]);
              console.log(`Successfully unlocked: ${achievement.title}`);
            } else {
              console.error('Error saving achievement:', error);
            }
          }
        }
      }

      console.log('Total new achievements unlocked:', unlockedAchievements.length);
      return unlockedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  // Update goal progress based on achievement type
  private static async updateGoalProgress(userId: string, achievementType: string): Promise<void> {
    try {
      // Get user's goals
      const { data: goals } = await supabase
        .from('wellness_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false);

      if (!goals) return;

      for (const goal of goals) {
        let shouldUpdate = false;
        let newValue = goal.current_value;

        // Map achievement types to goal updates
        switch (achievementType) {
          case 'first_mood':
          case 'mood_streak':
            if (goal.goal_type === 'mood' || goal.title.toLowerCase().includes('mood')) {
              newValue = goal.current_value + 1;
              shouldUpdate = true;
            }
            break;
          
          case 'game_player':
          case 'game_master':
            if (goal.goal_type === 'activity' || goal.title.toLowerCase().includes('game')) {
              newValue = goal.current_value + 1;
              shouldUpdate = true;
            }
            break;
          
          case 'journal_writer':
          case 'journal_master':
            if (goal.goal_type === 'activity' || goal.title.toLowerCase().includes('journal')) {
              newValue = goal.current_value + 1;
              shouldUpdate = true;
            }
            break;
          
          case 'analysis_user':
            if (goal.goal_type === 'activity' || goal.title.toLowerCase().includes('analysis')) {
              newValue = goal.current_value + 1;
              shouldUpdate = true;
            }
            break;
        }

        if (shouldUpdate) {
          await WellnessGoalService.updateGoalProgress(goal.id!, newValue);
        }
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  }

  // Calculate progress for different achievement types
  private static async calculateProgress(userId: string, type: string): Promise<number> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (type) {
      case 'first_mood':
        const { count: moodCount } = await supabase
          .from('mood_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        console.log(`first_mood progress: ${moodCount || 0}`);
        return moodCount || 0;

      case 'mood_streak':
        const streak = await this.calculateMoodStreak(userId);
        console.log(`mood_streak progress: ${streak}`);
        return streak;

      case 'positive_mood':
        const { count: positiveCount } = await supabase
          .from('mood_entries')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .in('mood', ['happy', 'excited', 'grateful'])
          .gte('created_at', weekAgo.toISOString());
        console.log(`positive_mood progress: ${positiveCount || 0}`);
        return positiveCount || 0;

      case 'game_player':
      case 'game_master':
        const { count: gameCount } = await supabase
          .from('game_results')
          .select('*', { count: 'exact' })
          .eq('user_id', userId);
        console.log(`${type} progress: ${gameCount || 0}`);
        return gameCount || 0;

      case 'journal_writer':
      case 'journal_master':
        const { count: journalCount } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact' })
          .eq('user_id', userId);
        console.log(`${type} progress: ${journalCount || 0}`);
        return journalCount || 0;

      case 'analysis_user':
        const { count: analysisCount } = await supabase
          .from('ai_mood_analysis')
          .select('*', { count: 'exact' })
          .eq('user_id', userId);
        console.log(`${type} progress: ${analysisCount || 0}`);
        return analysisCount || 0;

      default:
        console.log(`${type} progress: 0 (unknown type)`);
        return 0;
    }
  }

  // Calculate current mood streak
  private static async calculateMoodStreak(userId: string): Promise<number> {
    const { data: moodEntries } = await supabase
      .from('mood_entries')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!moodEntries || moodEntries.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasEntry = moodEntries.some(entry => {
        const entryDate = new Date(entry.created_at);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });

      if (hasEntry) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Get user's achievements
  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  // Get achievement progress
  static async getAchievementProgress(userId: string): Promise<{ unlocked: number; total: number }> {
    try {
      const achievements = await this.getUserAchievements(userId);
      const unlocked = achievements.filter(a => a.is_unlocked).length;
      const total = Object.keys(this.ACHIEVEMENTS).length;
      
      return { unlocked, total };
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return { unlocked: 0, total: 0 };
    }
  }

  // Update goal progress for specific activities
  static async updateGoalProgressForActivity(userId: string, activityType: string, increment: number = 1): Promise<void> {
    try {
      // Get user's goals
      const { data: goals } = await supabase
        .from('wellness_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false);

      if (!goals) return;

      for (const goal of goals) {
        let shouldUpdate = false;

        // Check if goal matches the activity type
        switch (activityType) {
          case 'mood_entry':
            if (goal.goal_type === 'mood' || goal.title.toLowerCase().includes('mood')) {
              shouldUpdate = true;
            }
            break;
          
          case 'game_played':
            if (goal.goal_type === 'activity' || goal.title.toLowerCase().includes('game')) {
              shouldUpdate = true;
            }
            break;
          
          case 'journal_entry':
            if (goal.goal_type === 'activity' || goal.title.toLowerCase().includes('journal')) {
              shouldUpdate = true;
            }
            break;
          
          case 'mood_analysis':
            if (goal.goal_type === 'activity' || goal.title.toLowerCase().includes('analysis')) {
              shouldUpdate = true;
            }
            break;
        }

        if (shouldUpdate) {
          const newValue = goal.current_value + increment;
          await WellnessGoalService.updateGoalProgress(goal.id!, newValue);
        }
      }
    } catch (error) {
      console.error('Error updating goal progress for activity:', error);
    }
  }
}

export class WellnessGoalService {
  // Create a new wellness goal
  static async createGoal(goal: Omit<WellnessGoal, 'id' | 'created_at'>): Promise<WellnessGoal | null> {
    try {
      const { data, error } = await supabase
        .from('wellness_goals')
        .insert([goal])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      return null;
    }
  }

  // Get user's goals
  static async getUserGoals(userId: string): Promise<WellnessGoal[]> {
    try {
      const { data, error } = await supabase
        .from('wellness_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  }

  // Update goal progress
  static async updateGoalProgress(goalId: string, currentValue: number): Promise<boolean> {
    try {
      const { data: goal } = await supabase
        .from('wellness_goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (!goal) return false;

      const isCompleted = currentValue >= goal.target_value;
      const completedAt = isCompleted && !goal.is_completed ? new Date().toISOString() : goal.completed_at;

      const { error } = await supabase
        .from('wellness_goals')
        .update({
          current_value: currentValue,
          is_completed: isCompleted,
          completed_at: completedAt
        })
        .eq('id', goalId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return false;
    }
  }

  // Delete a goal
  static async deleteGoal(goalId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wellness_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }
} 