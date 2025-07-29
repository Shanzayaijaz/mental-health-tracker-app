"use client";

import { useState, useEffect } from "react";
import { motion} from "framer-motion";
import { Trophy, Target, Plus, X, Calendar, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AchievementService, WellnessGoalService } from "@/lib/achievement-service";
import { Achievement, WellnessGoal } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/supabase";

export function AchievementSection() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<WellnessGoal[]>([]);
  const [achievementProgress, setAchievementProgress] = useState({ unlocked: 0, total: 0 });
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showCompletedGoals, setShowCompletedGoals] = useState(true);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    goal_type: "custom" as const,
    target_value: 1,
    unit: "times"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      // Load achievements and goals
      const [userAchievements, userGoals, progress] = await Promise.all([
        AchievementService.getUserAchievements(user.id),
        WellnessGoalService.getUserGoals(user.id),
        AchievementService.getAchievementProgress(user.id)
      ]);

      setAchievements(userAchievements);
      setGoals(userGoals);
      setAchievementProgress(progress);
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  };



  const createGoal = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const goal = await WellnessGoalService.createGoal({
        user_id: user.id,
        title: newGoal.title,
        description: newGoal.description,
        goal_type: newGoal.goal_type,
        target_value: newGoal.target_value,
        current_value: 0,
        unit: newGoal.unit,
        is_completed: false
      });

      if (goal) {
        setGoals(prev => [goal, ...prev]);
        setShowGoalDialog(false);
        setNewGoal({
          title: "",
          description: "",
          goal_type: "custom",
          target_value: 1,
          unit: "times"
        });
      }
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const success = await WellnessGoalService.deleteGoal(goalId);
      if (success) {
        setGoals(prev => prev.filter(g => g.id !== goalId));
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const updateGoalProgress = async (goalId: string, increment: number = 1) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newValue = goal.current_value + increment;
      const success = await WellnessGoalService.updateGoalProgress(goalId, newValue);
      
      if (success) {
        setGoals(prev => prev.map(g => 
          g.id === goalId 
            ? { ...g, current_value: newValue, is_completed: newValue >= g.target_value }
            : g
        ));
      }
    } catch (error) {
      console.error("Error updating goal progress:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Progress */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-semibold">Achievements</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {achievementProgress.unlocked}/{achievementProgress.total} unlocked
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>How it works:</strong> Achievements unlock automatically when you use the app. 
            Track moods, play games, write journals, and run mood analysis to earn them!
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.slice(0, 8).map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-4 bg-muted/50 rounded-lg"
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <h4 className="font-medium text-sm mb-1">{achievement.title}</h4>
              <p className="text-xs text-muted-foreground">{achievement.description}</p>
              {achievement.unlocked_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(achievement.unlocked_at).toLocaleDateString()}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {achievements.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Start using the app to unlock achievements!
          </p>
        )}
      </div>

      {/* Wellness Goals */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold">Wellness Goals</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompletedGoals(!showCompletedGoals)}
              className="text-xs"
            >
              {showCompletedGoals ? "Hide" : "Show"} Completed
            </Button>
            <Button
              size="sm"
              onClick={() => setShowGoalDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          </div>
        </div>

        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs text-green-700 dark:text-green-300">
            🎯 <strong>How it works:</strong> Goals automatically track your progress as you use the app. 
            For custom goals like &quot;walking&quot;, use the +1/+5/+10 buttons to manually update progress!
          </p>
        </div>

        <div className="space-y-4">
          {goals
            .filter(goal => showCompletedGoals || !goal.is_completed)
            .map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                goal.is_completed 
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                  : "bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {goal.is_completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-500" />
                  )}
                  <h4 className={`font-medium ${goal.is_completed ? "line-through text-green-700 dark:text-green-300" : ""}`}>
                    {goal.title}
                  </h4>
                  {goal.is_completed && (
                    <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goal.id && deleteGoal(goal.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className={`text-sm mb-3 ${goal.is_completed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                {goal.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  Progress: {goal.current_value}/{goal.target_value} {goal.unit}
                </div>
                <div className="w-24 bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      goal.is_completed ? "bg-green-500" : "bg-primary"
                    }`}
                    style={{
                      width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>

              {!goal.is_completed && (
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateGoalProgress(goal.id!, 1)}
                    className="text-xs"
                  >
                    +1 {goal.unit}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateGoalProgress(goal.id!, 5)}
                    className="text-xs"
                  >
                    +5 {goal.unit}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateGoalProgress(goal.id!, 10)}
                    className="text-xs"
                  >
                    +10 {goal.unit}
                  </Button>
                </div>
              )}

              {goal.completed_at && (
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  Completed: {new Date(goal.completed_at).toLocaleDateString()}
                </div>
              )}

              {goal.deadline && !goal.is_completed && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Due: {new Date(goal.deadline).toLocaleDateString()}
                </div>
              )}
            </motion.div>
          ))}

          {goals.filter(goal => showCompletedGoals || !goal.is_completed).length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {showCompletedGoals 
                ? "No wellness goals yet. Create your first goal to get started!" 
                : "No active goals. Create a new goal or show completed goals."
              }
            </p>
          )}
        </div>
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Wellness Goal</DialogTitle>
            <DialogDescription>
              Set a personal wellness goal to track your progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Goal Title</label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border border-input rounded-md mt-1"
                placeholder="e.g., Practice meditation daily"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border border-input rounded-md mt-1"
                rows={3}
                placeholder="Describe your goal..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Target</label>
                <input
                  type="number"
                  value={newGoal.target_value}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target_value: parseInt(e.target.value) || 1 }))}
                  className="w-full p-2 border border-input rounded-md mt-1"
                  min="1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Unit</label>
                <input
                  type="text"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full p-2 border border-input rounded-md mt-1"
                  placeholder="times, days, etc."
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowGoalDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createGoal}
                disabled={!newGoal.title.trim()}
                className="flex-1"
              >
                Create Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 