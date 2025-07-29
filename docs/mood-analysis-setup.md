# Mood Analysis Service Setup

This document explains how to set up the mood analysis service using Hugging Face Inference API instead of n8n workflows.

## Overview

The mood analysis service automatically analyzes user mood and journal data daily, providing personalized insights using AI. It replaces the n8n workflow with a direct TypeScript implementation.

## Features

- ✅ **Free AI Analysis**: Uses Hugging Face Inference API (free tier available)
- ✅ **Daily Automation**: Runs automatically every 24 hours
- ✅ **Mood Trend Analysis**: Calculates mood trends and patterns
- ✅ **Journal Analysis**: Analyzes journal entries for insights
- ✅ **Personalized Recommendations**: Provides tailored mental health advice
- ✅ **Database Storage**: Stores analysis results in Supabase

## Setup Instructions

### 1. Get Hugging Face API Key

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account or sign in
3. Go to Settings → Access Tokens
4. Create a new token with "read" permissions
5. Copy the token

### 2. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Hugging Face API
HUGGING_FACE_API_KEY=hf_your_api_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Test the Service

Run the mood analysis manually to test:

```bash
npm run mood-analysis
```

### 5. Set Up Automation

#### Option A: Cron Job (Linux/Mac)

Add to your crontab:

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 2 AM
0 2 * * * cd /path/to/your/project && npm run mood-analysis
```

#### Option B: Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to daily at 2 AM
4. Set action to run: `npm run mood-analysis`
5. Set working directory to your project folder

#### Option C: Vercel Cron Jobs

Add to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/mood-analysis",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Then create `app/api/mood-analysis/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import MoodAnalysisService from '../../../lib/mood-analysis-service';

export async function GET() {
  try {
    const service = new MoodAnalysisService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      process.env.HUGGING_FACE_API_KEY!
    );
    
    await service.runDailyAnalysis();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mood analysis failed:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
```

## How It Works

1. **Data Collection**: Fetches mood and journal entries from the last 7 days
2. **User Grouping**: Groups entries by user and filters users with sufficient data
3. **Trend Calculation**: Calculates mood trends and averages
4. **AI Analysis**: Uses Hugging Face's DialoGPT model for analysis
5. **Storage**: Saves results to the `ai_mood_analysis` table

## Models Used

- **microsoft/DialoGPT-medium**: For conversational AI responses
- **Alternative models** you can try:
  - `gpt2`: For text generation
  - `facebook/blenderbot-400M-distill`: For dialogue
  - `microsoft/DialoGPT-large`: For more detailed responses

## Customization

### Change AI Model

Edit `lib/mood-analysis-service.ts` line 108:

```typescript
// Change this URL to use a different model
'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium'
```

### Adjust Analysis Parameters

Modify the parameters in the `analyzeWithHuggingFace` method:

```typescript
parameters: {
  max_length: 500,    // Maximum response length
  temperature: 0.7,   // Creativity (0.0-1.0)
  do_sample: true     // Enable sampling
}
```

### Modify Mood Scoring

Update the `moodScores` object in `calculateMoodTrends`:

```typescript
const moodScores: { [key: string]: number } = {
  'happy': 9,
  'excited': 10,
  'neutral': 5,
  'sad': 2,
  // Add your custom moods here
};
```

## Monitoring

The service logs important information:

- Number of entries found
- Number of users processed
- Analysis completion status
- Any errors that occur

Check your console or logs to monitor the service.

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Ensure all required env vars are set
2. **API Rate Limits**: Hugging Face has rate limits on free tier
3. **Database Errors**: Check Supabase connection and permissions
4. **Model Loading**: First request to a model may take longer

### Debug Mode

Add more logging by modifying the service:

```typescript
// Add this to see detailed API responses
console.log('Hugging Face response:', result);
```

## Cost Considerations

- **Hugging Face Free Tier**: 30,000 requests/month
- **Supabase**: Depends on your plan
- **No OpenAI costs**: Completely free AI analysis

## Security

- API keys are stored in environment variables
- Service role key has limited permissions
- No sensitive data is logged
- All database operations use prepared statements 