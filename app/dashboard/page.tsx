"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, 

  Plus,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  Heart,
  Smile,
  Frown,
  Meh,
  Music,
  Star,
  Brain,
  Sparkles,
  Zap,
  Heart as HeartIcon,
  Coffee,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Activity,
  Target,
  CheckSquare,
  Square
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnxietyGames } from "@/components/games/anxiety-games"
import { JournalSection } from "@/components/journal/journal-section"
import { MoodAnalysis } from "@/components/mood-analysis/mood-analysis"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { supabase, getCurrentUser, MoodEntry as SupabaseMoodEntry } from "@/lib/supabase"

interface DashboardCard {
  id: string
  title: string
  value: string
  change: string
  icon: React.ReactNode
  color: string
}

interface ActivityItem {
  id: string
  title: string
  description: string
  time: string
  type: "success" | "warning" | "info" | "mood"
  mood?: "happy" | "sad" | "neutral" | "excited" | "anxious" | "angry" | "grateful" | "tired"
}

interface MoodEntry {
  id: string
  mood: "happy" | "sad" | "neutral" | "excited" | "anxious" | "angry" | "grateful" | "tired"
  created_at: string
  notes?: string
}

interface Goal {
  id: string
  title: string
  description: string
  goal_type: 'mood' | 'activity' | 'streak' | 'custom'
  target_value: number
  current_value: number
  unit: string
  is_completed: boolean
  created_at: string
  completed_at?: string | null
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentMood, setCurrentMood] = useState<"happy" | "sad" | "neutral" | "excited" | "anxious" | "angry" | "grateful" | "tired" | null>(null)
  const [moodNote, setMoodNote] = useState("")
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([])
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string>("")
  const [showFallbackDialog, setShowFallbackDialog] = useState(false)
  const [insights, setInsights] = useState<{
    user_id: string;
    mood_trend: number;
    recent_avg_mood: number;
    total_entries: number;
    ai_response: string;
    analysis_date: string;
  }[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: "", description: "" })

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      // Load game results for activities completed and meditation minutes
      const { data: gameResults } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Load mood entries for mood score
      const { data: moodEntries } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Calculate dynamic dashboard data
      const totalActivities = gameResults?.length || 0;
      const totalMeditationMinutes = gameResults?.reduce((sum, game) => sum + (game.duration || 0), 0) / 60 || 0;
      
      // Calculate average mood score
      const moodScores = moodEntries?.map(entry => {
        switch (entry.mood) {
          case 'happy': return 9;
          case 'excited': return 10;
          case 'grateful': return 8;
          case 'neutral': return 5;
          case 'tired': return 4;
          case 'anxious': return 3;
          case 'angry': return 2;
          case 'sad': return 1;
          default: return 5;
        }
      }) || [];
      const averageMoodScore = moodScores.length > 0 ? (moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length).toFixed(1) : '0.0';

      // Calculate streak (include both games and mood entries)
      const gameDates = gameResults?.map(game => new Date(game.created_at).toDateString()) || [];
      const moodDates = moodEntries?.map(mood => new Date(mood.created_at).toDateString()) || [];
      const allActivityDates = [...gameDates, ...moodDates];
      const uniqueDates = [...new Set(allActivityDates)];
      const streak = calculateStreak(uniqueDates);
      
      // Debug logging
      console.log('Streak calculation:', {
        gameDates: gameDates.length,
        moodDates: moodDates.length,
        uniqueDates: uniqueDates.length,
        streak: streak,
        today: new Date().toDateString(),
        yesterday: new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
      });

      // Update dashboard cards
      setDashboardCards([
        {
          id: "1",
          title: "Mood Score",
          value: `${averageMoodScore}/10`,
          change: moodScores.length > 1 ? "+0.5" : "0",
          icon: <Heart className="w-6 h-6" />,
          color: "bg-pink-500"
        },
        {
          id: "2",
          title: "Activities Completed",
          value: totalActivities.toString(),
          change: "",
          icon: <CheckCircle className="w-6 h-6" />,
          color: "bg-green-500"
        },
        {
          id: "3",
          title: "Meditation Minutes",
          value: Math.round(totalMeditationMinutes).toString(),
          change: "",
          icon: <Music className="w-6 h-6" />,
          color: "bg-purple-500"
        },
        {
          id: "4",
          title: "Streak Days",
          value: streak.toString(),
          change: "",
          icon: <Star className="w-6 h-6" />,
          color: "bg-orange-500"
        }
      ]);

      // Generate dynamic activities
      const dynamicActivities: ActivityItem[] = [];
      
      // Add recent game activities
      gameResults?.slice(0, 3).forEach(game => {
        const timeAgo = getTimeAgo(new Date(game.created_at));
        dynamicActivities.push({
          id: game.id || Date.now().toString(),
          title: `${game.game_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`,
          description: `Completed ${Math.round(game.duration / 60)} minute session`,
          time: timeAgo,
          type: "success" as const
        });
      });

      // Add recent mood activities
      moodEntries?.slice(0, 2).forEach(mood => {
        const timeAgo = getTimeAgo(new Date(mood.created_at));
        dynamicActivities.push({
          id: mood.id || Date.now().toString(),
          title: "Mood Check-in",
          description: `Recorded feeling ${mood.mood}`,
          time: timeAgo,
          type: "mood" as const,
          mood: mood.mood as "happy" | "sad" | "neutral" | "excited" | "anxious" | "angry" | "grateful" | "tired"
        });
      });

      setActivities(dynamicActivities);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }, []);

  // Helper function to calculate streak
  const calculateStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;
    
    const sortedDates = dates.sort().reverse();
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toDateString();
      
      if (sortedDates.includes(dateString)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Helper function to get time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])





  // Handle mood selection
  const handleMoodSelect = useCallback((mood: "happy" | "sad" | "neutral" | "excited" | "anxious" | "angry" | "grateful" | "tired") => {
    setCurrentMood(mood)
  }, [])

  // Load mood history from Supabase
  const loadMoodHistory = useCallback(async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error loading mood history:", error);
      } else {
        setMoodHistory(data || []);
      }
    } catch (error) {
      console.error("Error loading mood history:", error);
    }
  }, []);

  // Submit mood entry
  const submitMood = useCallback(async () => {
    if (currentMood) {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          console.error("No user found");
          return;
        }

        const moodEntry: Partial<SupabaseMoodEntry> = {
          user_id: user.id,
          mood: currentMood,
          notes: moodNote || undefined,
        };

        const { error } = await supabase
          .from('mood_entries')
          .insert([moodEntry]);

        if (error) {
          console.error("Error saving mood:", error);
        } else {
          console.log("Mood saved successfully");
          loadMoodHistory();
          setCurrentMood(null);
          setMoodNote("");
          
          // Check for new achievements and update goal progress
          // Removed achievement logic
        }
      } catch (error) {
        console.error("Error saving mood:", error);
      }
    }
  }, [currentMood, moodNote, loadMoodHistory]);

  // Function to log activities
  const logActivity = useCallback(async (activityType: string, description: string) => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      // For now, we'll just reload the dashboard data to show the new activity
      // In a real app, you might want to store activities in a separate table
      console.log("Activity logged:", activityType, description);
      loadDashboardData(); // Reload to show new activities
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  }, [loadDashboardData]);

  // Goal management functions
  const loadGoals = useCallback(async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('wellness_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading goals:", error);
      } else {
        setGoals(data || []);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  }, []);

  const addGoal = useCallback(async () => {
    if (newGoal.title.trim()) {
      try {
        const { user } = await getCurrentUser();
        if (!user) return;

        const goalData = {
          user_id: user.id,
          title: newGoal.title,
          description: newGoal.description,
          goal_type: 'custom' as const,
          target_value: 1,
          current_value: 0,
          unit: 'times',
          is_completed: false
        };

        const { data, error } = await supabase
          .from('wellness_goals')
          .insert([goalData])
          .select()
          .single();

        if (error) {
          console.error("Error creating goal:", error);
        } else {
          setGoals(prev => [data, ...prev]);
          setNewGoal({ title: "", description: "" });
          setShowGoalDialog(false);
        }
      } catch (error) {
        console.error("Error creating goal:", error);
      }
    }
  }, [newGoal]);

  const toggleGoal = useCallback(async (goalId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const isCompleted = !goal.is_completed;
      const completedAt = isCompleted ? new Date().toISOString() : null;

      const { error } = await supabase
        .from('wellness_goals')
        .update({
          is_completed: isCompleted,
          completed_at: completedAt
        })
        .eq('id', goalId);

      if (error) {
        console.error("Error updating goal:", error);
      } else {
        setGoals(prev => prev.map(g => 
          g.id === goalId 
            ? { ...g, is_completed: isCompleted, completed_at: completedAt }
            : g
        ));
      }
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  }, [goals]);

  const deleteGoal = useCallback(async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('wellness_goals')
        .delete()
        .eq('id', goalId);

      if (error) {
        console.error("Error deleting goal:", error);
      } else {
        setGoals(prev => prev.filter(goal => goal.id !== goalId));
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadMoodHistory();
    loadDashboardData();
    loadGoals(); // Load goals on mount
  }, [loadMoodHistory, loadDashboardData, loadGoals]);

  // Get mood icon
  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy": return <Smile className="w-5 h-5 text-green-500" />
      case "excited": return <Star className="w-5 h-5 text-yellow-500" />
      case "grateful": return <HeartIcon className="w-5 h-5 text-pink-500" />
      case "neutral": return <Meh className="w-5 h-5 text-gray-500" />
      case "tired": return <Coffee className="w-5 h-5 text-orange-500" />
      case "anxious": return <AlertTriangle className="w-5 h-5 text-purple-500" />
      case "angry": return <Zap className="w-5 h-5 text-red-500" />
      case "sad": return <Frown className="w-5 h-5 text-blue-500" />
      default: return <Meh className="w-5 h-5 text-gray-500" />
    }
  }

  // Run mood analysis with Hugging Face
  const runMoodAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisResult("")
    
    try {
      // Get current user first
      const { user, error: userError } = await getCurrentUser();
      
      if (userError || !user) {
        setAnalysisResult("❌ Please log in to run mood analysis");
        return;
      }

      const response = await fetch('/api/mood-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('Analysis result:', result);
        console.log('Insights received:', result.insights);
        
        if (result.local_analysis) {
          setAnalysisResult("✅ Local mood analysis completed successfully!")
        } else {
          setAnalysisResult("✅ AI mood analysis completed successfully!")
        }
        
        setInsights(result.insights || [])
        // Add to activities
        const newActivity: ActivityItem = {
          id: Date.now().toString(),
          title: result.local_analysis ? "Local Mood Analysis" : "AI Mood Analysis",
          description: result.local_analysis ? "Completed mood analysis using local insights" : "Completed daily mood analysis with AI",
          time: "Just now",
          type: "success"
        }
        setActivities(prev => [newActivity, ...prev.slice(0, 9)])
      } else if (result.fallback) {
        // Show fallback dialog for AI service failures
        setShowFallbackDialog(true)
        setAnalysisResult("⚠️ Analysis unavailable - showing manual insights")
      } else {
        // Handle other errors
        const errorMsg = result.missing 
          ? `❌ Missing environment variables: ${result.missing.join(', ')}`
          : `❌ Analysis failed: ${result.error || 'Unknown error'}`
        setAnalysisResult(errorMsg)
      }
    } catch (error) {
      console.error('Mood analysis error:', error)
      // Show fallback dialog for network/API errors
      setShowFallbackDialog(true)
      setAnalysisResult("⚠️ AI analysis unavailable - showing manual insights")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your wellness dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card shadow-sm border-b border-border mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">
                Wellness Dashboard
              </h1>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
            

          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Cards */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <AnimatePresence>
            {dashboardCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className="bg-card rounded-xl shadow-sm border border-border p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-lg", card.color)}>
                    {card.icon}
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {card.change}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  {card.title}
                </h3>
                <p className="text-2xl font-bold text-foreground">
                  {card.value}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Mood Tracker Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Current Mood */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                How are you feeling?
              </h3>
              <Heart className="w-5 h-5 text-primary" />
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { mood: "happy", icon: Smile, color: "text-green-500" },
                { mood: "excited", icon: Star, color: "text-yellow-500" },
                { mood: "grateful", icon: HeartIcon, color: "text-pink-500" },
                { mood: "neutral", icon: Meh, color: "text-gray-500" },
                { mood: "tired", icon: Coffee, color: "text-orange-500" },
                { mood: "anxious", icon: AlertTriangle, color: "text-purple-500" },
                { mood: "angry", icon: Zap, color: "text-red-500" },
                { mood: "sad", icon: Frown, color: "text-blue-500" }
              ].map(({ mood, icon: Icon, color }) => (
                <motion.button
                  key={mood}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelect(mood as "happy" | "sad" | "neutral" | "excited" | "anxious" | "angry" | "grateful" | "tired")}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-colors",
                    currentMood === mood
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className={cn("w-8 h-8 mx-auto", color)} />
                  <p className="text-sm font-medium text-foreground mt-2 capitalize">
                    {mood}
                  </p>
                </motion.button>
              ))}
            </div>

            {currentMood && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <textarea
                  placeholder="Add a note about your mood (optional)..."
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background text-foreground resize-none"
                  rows={3}
                />
                <Button onClick={submitMood} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Mood
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mood History */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Mood History
              </h3>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {moodHistory.slice(0, 5).map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                >
                  {getMoodIcon(entry.mood)}
                  <div className="flex-1">
                    <p className="font-medium text-foreground capitalize">
                      {entry.mood}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleTimeString()}
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        &quot;{entry.notes}&quot;
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
              {moodHistory.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No mood entries yet. Start tracking your mood!
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* AI Mood Analysis Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    AI Mood Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get personalized insights using AI
                  </p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  This will analyze your mood and journal entries from the past 7 days using AI to provide personalized insights and recommendations.
                </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Free AI analysis</span>
                  </div>
              </div>
              
              <Button 
                onClick={runMoodAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Run Mood Analysis
                  </>
                )}
              </Button>
              
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg text-sm ${
                    analysisResult.includes('✅') 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  }`}
                >
                  {analysisResult}
                </motion.div>
              )}
              
              {insights.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h4 className="font-semibold text-foreground">AI Insights ({insights.length})</h4>
                  {insights.map((insight, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            insight.mood_trend > 0 ? 'bg-green-500' : 
                            insight.mood_trend < 0 ? 'bg-red-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium">
                            Mood Trend: {insight.mood_trend > 0 ? '↗️ Improving' : 
                                       insight.mood_trend < 0 ? '↘️ Declining' : '→ Stable'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(insight.analysis_date).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="text-sm space-y-2">
                        <p><strong>Recent Average Mood:</strong> {insight.recent_avg_mood.toFixed(1)}/10</p>
                        <p><strong>Total Entries Analyzed:</strong> {insight.total_entries}</p>
                        <div className="bg-background/50 rounded p-3">
                          <p className="text-xs text-muted-foreground mb-2">AI Analysis:</p>
                          <p className="text-sm">{insight.ai_response}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : analysisResult && analysisResult.includes('✅') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-muted/50 rounded-lg"
                >
                  <p className="text-sm text-muted-foreground">
                    Analysis completed but no insights were generated. This might happen if you don&apos;t have enough mood entries (need at least 3 entries from the past 7 days).
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Games Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
          data-section="games"
        >
          <AnxietyGames onGamePlayed={logActivity} />
        </motion.div>

        {/* Mood Analysis Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <MoodAnalysis onInsightGenerated={(insight) => {
            console.log("AI Insight:", insight);
            // Could be used to show notifications or update other components
          }} />
        </motion.div>

        {/* Journal Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <JournalSection onActivityLogged={logActivity} />
        </motion.div>

        {/* Goals Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold">Daily Goals</h3>
              </div>
              <Button
                size="sm"
                onClick={() => setShowGoalDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Goal
              </Button>
            </div>

            <div className="space-y-3">
              {goals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No goals yet. Add your first goal to get started!
                </p>
              ) : (
                goals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <button
                      onClick={() => toggleGoal(goal.id)}
                      className="flex-shrink-0"
                    >
                      {goal.is_completed ? (
                        <CheckSquare className="w-5 h-5 text-green-500" />
                      ) : (
                        <Square className="w-5 h-5 text-muted-foreground hover:text-primary" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <h4 className={`font-medium ${goal.is_completed ? "line-through text-muted-foreground" : ""}`}>
                        {goal.title}
                      </h4>
                      {goal.description && (
                        <p className={`text-sm ${goal.is_completed ? "text-muted-foreground" : "text-muted-foreground"}`}>
                          {goal.description}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-card rounded-xl shadow-sm border border-border p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Recent Activity
            </h3>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence>
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className={cn(
                    "p-2 rounded-full",
                    activity.type === "success" && "bg-green-100 dark:bg-green-900",
                    activity.type === "warning" && "bg-yellow-100 dark:bg-yellow-900",
                    activity.type === "info" && "bg-blue-100 dark:bg-blue-900",
                    activity.type === "mood" && "bg-pink-100 dark:bg-pink-900"
                  )}>
                    {activity.type === "success" && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    {activity.type === "warning" && <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />}
                    {activity.type === "info" && <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    {activity.type === "mood" && activity.mood && getMoodIcon(activity.mood)}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Fallback Dialog for AI Analysis Failures */}
      <Dialog open={showFallbackDialog} onOpenChange={setShowFallbackDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Manual Mood Insights
            </DialogTitle>
            <DialogDescription>
              While AI analysis is temporarily unavailable, here are some insights based on your recent mood data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Recent Mood Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Recent Mood Summary</h4>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Total Entries:</strong> {moodHistory.length}</p>
                <p><strong>Most Recent:</strong> {moodHistory[0]?.mood || 'None'}</p>
                <p><strong>Average Mood Score:</strong> {dashboardCards[0]?.value || 'N/A'}</p>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-green-500" />
                <h4 className="font-semibold">Suggestions</h4>
              </div>
              <div className="space-y-2 text-sm">
                <p>• Try our mindfulness games to improve your mood</p>
                <p>• Journal your thoughts to gain clarity</p>
                <p>• Take regular mood check-ins to track patterns</p>
                <p>• Practice breathing exercises for relaxation</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFallbackDialog(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setShowFallbackDialog(false)
                  // Navigate to games section
                  document.querySelector('[data-section="games"]')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex-1"
              >
                Try Games
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-500" />
              Add New Goal
            </DialogTitle>
            <DialogDescription>
              Set a new daily goal to help you stay motivated and track your progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="goalTitle" className="text-sm font-medium text-foreground">
                  Goal Title
                </label>
                <input
                  type="text"
                  id="goalTitle"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="col-span-3 p-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="e.g., Read 10 pages of a book"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="goalDescription" className="text-sm font-medium text-foreground">
                  Description (optional)
                </label>
                <textarea
                  id="goalDescription"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="col-span-3 p-2 border border-input rounded-md bg-background text-foreground"
                  rows={2}
                  placeholder="Why is this goal important to you?"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowGoalDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addGoal}>
                Add Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}