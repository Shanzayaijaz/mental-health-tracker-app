import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface MoodEntry {
  id: string;
  user_id: string;
  mood: string;
  notes?: string;
  created_at: string;
}

interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  created_at: string;
}

interface UserData {
  user_id: string;
  mood_entries: MoodEntry[];
  journal_entries: JournalEntry[];
}

interface AnalysisResult {
  user_id: string;
  analysis_date: string;
  mood_trend: number;
  recent_avg_mood: number;
  earlier_avg_mood: number;
  total_mood_entries: number;
  total_journal_entries: number;
  ai_insights: Record<string, string>;
  raw_ai_response: string;
}

class MoodAnalysisService {
  private supabase: SupabaseClient;
  private hfApiKey: string;

  constructor(supabaseUrl: string, supabaseKey: string, hfApiKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.hfApiKey = hfApiKey;
  }

  async fetchMoodData(userId?: string): Promise<MoodEntry[]> {
    let query = this.supabase
      .from('mood_entries')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async fetchJournalData(userId?: string): Promise<JournalEntry[]> {
    let query = this.supabase
      .from('journal_entries')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  processUserData(moodEntries: MoodEntry[], journalEntries: JournalEntry[]): UserData[] {
    const userData: { [key: string]: UserData } = {};

    // Group mood entries by user
    for (const entry of moodEntries) {
      if (!userData[entry.user_id]) {
        userData[entry.user_id] = {
          user_id: entry.user_id,
          mood_entries: [],
          journal_entries: []
        };
      }
      userData[entry.user_id].mood_entries.push(entry);
    }

    // Group journal entries by user
    for (const entry of journalEntries) {
      if (!userData[entry.user_id]) {
        userData[entry.user_id] = {
          user_id: entry.user_id,
          mood_entries: [],
          journal_entries: []
        };
      }
      userData[entry.user_id].journal_entries.push(entry);
    }

    // Filter users with enough data (at least 3 mood entries)
    return Object.values(userData).filter(user => user.mood_entries.length >= 3);
  }

  calculateMoodTrends(userData: UserData): {
    mood_trend: number;
    recent_avg: number;
    earlier_avg: number;
  } {
    const moodScores: { [key: string]: number } = {
      'happy': 9,
      'excited': 10,
      'neutral': 5,
      'sad': 2,
      'anxious': 3,
      'stressed': 4,
      'calm': 7,
      'content': 8
    };

    const moodEntries = userData.mood_entries;
    const recentMoods = moodEntries.slice(-7);
    const earlierMoods = moodEntries.slice(-14, -7);

    let recentAvg = 0;
    let earlierAvg = 0;

    if (recentMoods.length > 0) {
      recentAvg = recentMoods.reduce((sum, entry) => 
        sum + (moodScores[entry.mood] || 5), 0) / recentMoods.length;
    }

    if (earlierMoods.length > 0) {
      earlierAvg = earlierMoods.reduce((sum, entry) => 
        sum + (moodScores[entry.mood] || 5), 0) / earlierMoods.length;
    }

    return {
      mood_trend: recentAvg - earlierAvg,
      recent_avg: recentAvg,
      earlier_avg: earlierAvg
    };
  }

  async analyzeWithHuggingFace(userData: UserData, moodTrends: {
    mood_trend: number;
    recent_avg: number;
    earlier_avg: number;
  }): Promise<string> {
    // Create a simpler prompt for better compatibility
    const prompt = `Analyze this mental health data and provide insights:

Mood Trend: ${moodTrends.mood_trend > 0 ? 'Improving' : moodTrends.mood_trend < 0 ? 'Declining' : 'Stable'}
Recent Average Mood: ${moodTrends.recent_avg.toFixed(1)}/10
Entries Analyzed: ${userData.mood_entries.length} mood entries, ${userData.journal_entries.length} journal entries

Please provide personalized insights and recommendations.`;

    try {
      console.log('Making Hugging Face API call...');
      console.log('API Key present:', !!this.hfApiKey);
      
                    // Try a more reliable model for text generation
              const response = await fetch(
                'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${this.hfApiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                      max_length: 150,
                      temperature: 0.7,
                      do_sample: true,
                      return_full_text: false
                    }
                  })
                }
              );

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Hugging Face API error response:', errorText);
        console.log('Using fallback analysis due to API error');
        // Don't throw error, let it fall through to the catch block
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Hugging Face API result:', result);
      
      if (Array.isArray(result) && result.length > 0) {
        return result[0]?.generated_text || 'Analysis completed successfully.';
      } else if (result.generated_text) {
        return result.generated_text;
      } else {
        return 'Analysis completed successfully.';
      }
    } catch (error) {
      console.error('Hugging Face API error:', error);
      
      // Enhanced local analysis based on mood data
      return this.generateLocalAnalysis(userData, moodTrends);
    }
  }

  generateLocalAnalysis(userData: UserData, moodTrends: {
    mood_trend: number;
    recent_avg: number;
    earlier_avg: number;
  }): string {
    // Analyze mood patterns
    const moodCounts = userData.mood_entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalEntries = userData.mood_entries.length;
    const mostFrequentMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const recentMoods = userData.mood_entries.slice(0, 3).map(e => e.mood);

    // Generate trend analysis
    let trendAnalysis = "";
    if (moodTrends.mood_trend > 1) {
      trendAnalysis = "🎉 Excellent! Your mood has been significantly improving. You're building great momentum in your mental wellness journey.";
    } else if (moodTrends.mood_trend > 0) {
      trendAnalysis = "📈 Great progress! Your mood has been trending upward. Keep up the positive momentum!";
    } else if (moodTrends.mood_trend < -1) {
      trendAnalysis = "💙 I notice your mood has been declining. Remember, it's okay to not be okay. Consider reaching out to friends, family, or a mental health professional.";
    } else if (moodTrends.mood_trend < 0) {
      trendAnalysis = "📉 Your mood has been slightly declining. This is a good time to practice self-care and reach out to your support network.";
    } else {
      trendAnalysis = "⚖️ Your mood has been stable. This consistency provides a solid foundation for your mental wellness journey.";
    }

    // Generate mood-specific insights
    let moodInsights = "";
    if (mostFrequentMood) {
      const moodPercentage = Math.round((moodCounts[mostFrequentMood] / totalEntries) * 100);
      moodInsights = `\n\n📊 Mood Patterns:\n• Your most frequent mood is "${mostFrequentMood}" (${moodPercentage}% of entries)\n`;
      
      if (recentMoods.length > 0) {
        const recentPattern = recentMoods.join(", ");
        moodInsights += `• Recent mood pattern: ${recentPattern}\n`;
      }
    }

    // Generate personalized recommendations
    let recommendations = "";
    if (moodTrends.recent_avg < 5) {
      recommendations = "\n💡 Personalized Recommendations:\n• Practice deep breathing exercises for 5-10 minutes daily\n• Try our mindfulness games to improve focus and calm\n• Consider journaling your thoughts and feelings\n• Reach out to a friend or family member for support\n• Engage in physical activity you enjoy";
    } else if (moodTrends.recent_avg < 7) {
      recommendations = "\n💡 Personalized Recommendations:\n• Continue with your current positive practices\n• Try our zen garden or ocean waves games for relaxation\n• Practice gratitude by writing down 3 things you're thankful for\n• Consider exploring new hobbies or activities\n• Maintain regular sleep and exercise routines";
    } else {
      recommendations = "\n💡 Personalized Recommendations:\n• Keep up your excellent mental wellness practices!\n• Share your positive energy with others\n• Try our advanced mindfulness games\n• Consider mentoring or helping others\n• Document what's working well for you";
    }

    // Add activity suggestions
    const activitySuggestions = "\n🎮 Suggested Activities:\n• Breathing exercises for relaxation\n• Candle focus meditation for concentration\n• Zen garden for peaceful reflection\n• Ocean waves for calming sounds\n• Journal writing for self-reflection";

    return `${trendAnalysis}${moodInsights}${recommendations}${activitySuggestions}`;
  }

  async storeAnalysis(analysisData: AnalysisResult): Promise<void> {
    const { error } = await this.supabase
      .from('ai_mood_analysis')
      .insert([analysisData]);

    if (error) throw error;
  }

  async runDailyAnalysis(userId?: string): Promise<{
    user_id: string;
    mood_trend: number;
    recent_avg_mood: number;
    total_entries: number;
    ai_response: string;
    analysis_date: string;
  }[]> {
    try {
      console.log('Starting daily mood analysis...');

      // Fetch data for specific user or all users
      const moodEntries = await this.fetchMoodData(userId);
      const journalEntries = await this.fetchJournalData(userId);

      console.log(`Found ${moodEntries.length} mood entries and ${journalEntries.length} journal entries`);

      // Process user data
      const userDataList = this.processUserData(moodEntries, journalEntries);
      console.log(`Processing ${userDataList.length} users with sufficient data`);

      const insights: {
        user_id: string;
        mood_trend: number;
        recent_avg_mood: number;
        total_entries: number;
        ai_response: string;
        analysis_date: string;
      }[] = [];

      // Analyze each user
      for (const userData of userDataList) {
        console.log(`Analyzing user: ${userData.user_id}`);

        // Calculate mood trends
        const moodTrends = this.calculateMoodTrends(userData);

        // Get AI analysis
        const aiResponse = await this.analyzeWithHuggingFace(userData, moodTrends);

        // Prepare analysis result
        const analysisResult: AnalysisResult = {
          user_id: userData.user_id,
          analysis_date: new Date().toISOString(),
          mood_trend: moodTrends.mood_trend,
          recent_avg_mood: moodTrends.recent_avg,
          earlier_avg_mood: moodTrends.earlier_avg,
          total_mood_entries: userData.mood_entries.length,
          total_journal_entries: userData.journal_entries.length,
          ai_insights: {
            trend_analysis: 'Based on AI analysis',
            patterns: 'Patterns identified',
            recommendations: 'Personalized recommendations',
            insights: 'Encouraging insights',
            suggested_activities: 'Recommended activities'
          },
          raw_ai_response: aiResponse
        };

        // Store analysis
        await this.storeAnalysis(analysisResult);
        
        // Add to insights for dashboard display
        insights.push({
          user_id: userData.user_id,
          mood_trend: moodTrends.mood_trend,
          recent_avg_mood: moodTrends.recent_avg,
          total_entries: userData.mood_entries.length + userData.journal_entries.length,
          ai_response: aiResponse,
          analysis_date: new Date().toISOString()
        });
        
        console.log(`Analysis completed for user: ${userData.user_id}`);
      }

      console.log('Daily mood analysis completed successfully');
      return insights;
    } catch (error) {
      console.error('Error in daily mood analysis:', error);
      throw error;
    }
  }
}

export default MoodAnalysisService; 