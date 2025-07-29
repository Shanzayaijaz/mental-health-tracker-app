import MoodAnalysisService from '../lib/mood-analysis-service';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hfApiKey = process.env.HUGGING_FACE_API_KEY;

if (!supabaseUrl || !supabaseKey || !hfApiKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('- HUGGING_FACE_API_KEY');
  process.exit(1);
}

async function main() {
  try {
    const service = new MoodAnalysisService(supabaseUrl!, supabaseKey!, hfApiKey!);
    await service.runDailyAnalysis();
    console.log('Mood analysis completed successfully');
  } catch (error) {
    console.error('Failed to run mood analysis:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
} 