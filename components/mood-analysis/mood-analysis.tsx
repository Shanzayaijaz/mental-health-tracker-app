"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  Lightbulb,
  Brain,
  Activity,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, getCurrentUser } from "@/lib/supabase"

interface MoodAnalysisProps {
  onInsightGenerated?: (insight: string) => void;
}

interface MoodData {
  date: string;
  mood: string;
  score: number;
}

interface MoodInsight {
  type: 'trend' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const MoodAnalysis = ({ onInsightGenerated }: MoodAnalysisProps) => {
  const [moodData, setMoodData] = useState<MoodData[]>([])
  const [insights, setInsights] = useState<MoodInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMoodData()
  }, [])

  const loadMoodData = async () => {
    try {
      const { user } = await getCurrentUser()
      if (!user) return

      const { data: moodEntries } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })

      if (moodEntries) {
        const processedData = moodEntries.map(entry => ({
          date: new Date(entry.created_at).toLocaleDateString(),
          mood: entry.mood,
          score: getMoodScore(entry.mood)
        }))
        setMoodData(processedData)
        generateInsights(processedData)
      }
    } catch (error) {
      console.error("Error loading mood data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMoodScore = (mood: string): number => {
    switch (mood) {
      case 'happy': return 9
      case 'excited': return 10
      case 'neutral': return 5
      case 'sad': return 2
      default: return 5
    }
  }

  const generateInsights = (data: MoodData[]) => {
    if (data.length < 3) return

    const newInsights: MoodInsight[] = []
    
    // Calculate trend
    const recentScores = data.slice(-7).map(d => d.score)
    const earlierScores = data.slice(-14, -7).map(d => d.score)
    
    if (recentScores.length > 0 && earlierScores.length > 0) {
      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      const earlierAvg = earlierScores.reduce((a, b) => a + b, 0) / earlierScores.length
      const trend = recentAvg - earlierAvg
      
      if (trend > 1) {
        newInsights.push({
          type: 'trend',
          title: 'Mood Improving',
          description: `Your mood has improved by ${trend.toFixed(1)} points over the past week!`,
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'text-green-500'
        })
      } else if (trend < -1) {
        newInsights.push({
          type: 'trend',
          title: 'Mood Declining',
          description: `Your mood has decreased by ${Math.abs(trend).toFixed(1)} points. Consider trying some relaxation exercises.`,
          icon: <TrendingDown className="w-5 h-5" />,
          color: 'text-orange-500'
        })
      }
    }

    // Find patterns
    const moodCounts = data.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostFrequentMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
    if (mostFrequentMood) {
      newInsights.push({
        type: 'pattern',
        title: 'Mood Pattern',
        description: `You've been feeling ${mostFrequentMood[0]} most often (${mostFrequentMood[1]} times).`,
        icon: <BarChart3 className="w-5 h-5" />,
        color: 'text-blue-500'
      })
    }

    // Generate recommendations
    const averageScore = data.reduce((sum, entry) => sum + entry.score, 0) / data.length
    if (averageScore < 5) {
      newInsights.push({
        type: 'recommendation',
        title: 'Wellness Tip',
        description: 'Try the breathing exercises or meditation games to boost your mood.',
        icon: <Lightbulb className="w-5 h-5" />,
        color: 'text-purple-500'
      })
    }

    setInsights(newInsights)
    
    // Notify parent component
    if (onInsightGenerated && newInsights.length > 0) {
      onInsightGenerated(newInsights[0].description)
    }
  }

  const getMoodTrend = () => {
    if (moodData.length < 2) return 'stable'
    
    const recent = moodData.slice(-3)
    const earlier = moodData.slice(-6, -3)
    
    if (recent.length === 0 || earlier.length === 0) return 'stable'
    
    const recentAvg = recent.reduce((sum, d) => sum + d.score, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, d) => sum + d.score, 0) / earlier.length
    
    if (recentAvg > earlierAvg + 1) return 'improving'
    if (recentAvg < earlierAvg - 1) return 'declining'
    return 'stable'
  }

  const getMoodDistribution = () => {
    const distribution = moodData.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(distribution).map(([mood, count]) => ({
      mood,
      count,
      percentage: ((count / moodData.length) * 100).toFixed(1)
    }))
  }

  if (isLoading) {
    return (
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Mood Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Analyzing your mood patterns...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (moodData.length === 0) {
    return (
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Mood Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Start tracking your mood to see personalized insights and trends.
          </p>
        </CardContent>
      </Card>
    )
  }

  const trend = getMoodTrend()
  const distribution = getMoodDistribution()

  return (
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Mood Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {moodData.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Entries</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {(moodData.reduce((sum, d) => sum + d.score, 0) / moodData.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {trend === 'improving' ? '↗' : trend === 'declining' ? '↘' : '→'}
            </div>
            <div className="text-sm text-muted-foreground">Trend</div>
          </div>
        </div>

        {/* Mood Distribution */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Mood Distribution
          </h4>
          <div className="space-y-2">
            {distribution.map((item) => (
              <div key={item.mood} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="capitalize">{item.mood}</span>
                  <span className="text-xs text-muted-foreground">({item.count})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI Insights
            </h4>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary"
                >
                  <div className="flex items-start gap-3">
                    <div className={insight.color}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{insight.title}</h5>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 