import { NextResponse } from 'next/server';
import { AchievementService } from '../../../lib/achievement-service';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    console.log('Checking achievements for user:', userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Check for new achievements
    const newAchievements = await AchievementService.checkAchievements(userId);
    
    console.log('Achievement check result:', {
      userId,
      newAchievementsCount: newAchievements.length,
      newAchievements: newAchievements.map(a => ({ title: a.title, type: a.achievement_type }))
    });
    
    return NextResponse.json({
      success: true,
      newAchievements,
      count: newAchievements.length
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
} 