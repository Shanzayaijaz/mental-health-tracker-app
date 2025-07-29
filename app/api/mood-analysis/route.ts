import { NextResponse } from 'next/server';
import MoodAnalysisService from '../../../lib/mood-analysis-service';

export async function GET(request: Request) {
  // Check if required environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hfApiKey = process.env.HUGGING_FACE_API_KEY;

  console.log('Environment check:', {
    supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
    supabaseKey: supabaseKey ? 'Set' : 'Missing',
    hfApiKey: hfApiKey ? 'Set' : 'Missing'
  });

  if (!supabaseUrl || !supabaseKey || !hfApiKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!hfApiKey) missingVars.push('HUGGING_FACE_API_KEY');
    
    return NextResponse.json(
      { 
        error: 'Missing required environment variables',
        missing: missingVars
      },
      { status: 500 }
    );
  }

  // Get user ID from request headers (sent from frontend)
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json(
      { 
        error: 'User ID required',
        details: 'Please provide user ID in x-user-id header'
      },
      { status: 400 }
    );
  }

  try {
    // Initialize the mood analysis service
    const service = new MoodAnalysisService(supabaseUrl, supabaseKey, hfApiKey);
    
    // Run the daily analysis for the specified user
    const insights = await service.runDailyAnalysis(userId);
    
    // Check if we have insights (even fallback ones)
    if (insights && insights.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Mood analysis completed successfully',
        insights: insights,
        timestamp: new Date().toISOString()
      });
    } else {
      // No insights available, return fallback response
      return NextResponse.json({ 
        success: false, 
        error: 'No mood data available for analysis',
        message: 'Please add more mood entries to get insights',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Mood analysis failed:', error);
    
    // Check if it's a Hugging Face API error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Hugging Face API error')) {
      // Try to generate local analysis instead
      try {
        const service = new MoodAnalysisService(supabaseUrl, supabaseKey, hfApiKey);
        const moodEntries = await service.fetchMoodData(userId);
        const journalEntries = await service.fetchJournalData(userId);
        const userDataList = service.processUserData(moodEntries, journalEntries);
        
        if (userDataList.length > 0) {
          const userData = userDataList[0];
          const moodTrends = service.calculateMoodTrends(userData);
          const localAnalysis = service.generateLocalAnalysis(userData, moodTrends);
          
          // Return successful response with local analysis
          return NextResponse.json(
            { 
              success: true,
              message: 'Local mood analysis completed successfully',
              insights: [{
                user_id: userData.user_id,
                mood_trend: moodTrends.mood_trend,
                recent_avg_mood: moodTrends.recent_avg,
                total_entries: userData.mood_entries.length,
                ai_response: localAnalysis,
                analysis_date: new Date().toISOString()
              }],
              local_analysis: true,
              timestamp: new Date().toISOString()
            }, 
            { status: 200 }
          );
        }
      } catch (localError) {
        console.error('Local analysis also failed:', localError);
      }
      
      // If local analysis also fails, return fallback response
      return NextResponse.json(
        { 
          success: false,
          error: 'Analysis temporarily unavailable',
          message: 'Please try again later',
          fallback: true,
          timestamp: new Date().toISOString()
        }, 
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Analysis failed', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

// Optional: Add POST method for manual triggering
export async function POST(request: Request) {
  return GET(request);
} 