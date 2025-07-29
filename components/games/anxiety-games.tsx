"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Flower2, Wind, TreePine, Waves, Music2 , Flame } from "lucide-react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BreathingGame } from "./breathing-game";
import { ZenGarden } from "./zen-garden";
import { ForestGame } from "./forest-game";
import OceanWaves from "./ocean-waves";
import CandleFocus from "./candle-focus";
import { supabase, getCurrentUser, GameResult } from "@/lib/supabase";

const games = [
  {
    id: "breathing",
    title: "Breathing Patterns",
    description: "Follow calming breathing exercises with visual guidance",
    icon: Wind,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    duration: "5 mins",
  },
  {
    id: "garden",
    title: "Zen Garden",
    description: "Create and maintain your digital peaceful space",
    icon: Flower2,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    duration: "10 mins",
  },
  {
    id: "forest",
    title: "Mindful Forest",
    description: "Take a peaceful walk through a virtual forest",
    icon: TreePine,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    duration: "15 mins",
  },
  {
    id: "waves",
    title: "Ocean Waves",
    description: "Match your breath with gentle ocean waves",
    icon: Waves,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    duration: "8 mins",
  },
  {
    id: "candle_focus",
    title: "Candle Focus",
    description: "Stare at a flickering candle and tap when your mind drifts",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    duration: "3–10 mins",
  },
];

interface AnxietyGamesProps {
  onGamePlayed?: (gameName: string, description: string) => Promise<void>;
}

export const AnxietyGames = ({ onGamePlayed }: AnxietyGamesProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGameStart = async (gameId: string) => {
    setSelectedGame(gameId);
    setIsLoading(true);
    setShowGame(true);

    setTimeout(async () => {
        setIsLoading(false);
      
        // Log the activity
        if (onGamePlayed) {
          try {
            const description = games.find((g) => g.id === gameId)?.description || "";
            await onGamePlayed(gameId, description);
          } catch (error) {
            console.error("Error logging game activity:", error);
          }
        }
      }, 1000);
  };

  const handleGameComplete = async (gameData: {
    gameType: string;
    duration: number;
    score?: number;
    driftCount?: number;
    breathCount?: number;
  }) => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const gameResult: Partial<GameResult> = {
        user_id: user.id,
        game_type: gameData.gameType,
        duration: gameData.duration,
        score: gameData.score,
        drift_count: gameData.driftCount,
        breath_count: gameData.breathCount,
      };

      const { error } = await supabase
        .from('game_results')
        .insert([gameResult]);

      if (error) {
        console.error("Error saving game result:", error);
      } else {
        console.log("Game result saved successfully");
      }
    } catch (error) {
      console.error("Error saving game result:", error);
    }
  };

  const renderGame = () => {
    switch (selectedGame) {
      case "breathing":
        return <BreathingGame onGameComplete={handleGameComplete} />;
      case "garden":
        return <ZenGarden />;
      case "forest":
        return <ForestGame />;
      case "waves":
        return <OceanWaves />;
      case "candle_focus":
        return <CandleFocus onGameComplete={handleGameComplete} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            Anxiety Relief Activities
          </CardTitle>
          <CardDescription>
            Interactive exercises to help reduce stress and anxiety
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`border-primary/10 hover:bg-primary/5 transition-colors cursor-pointer ${
                    selectedGame === game.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleGameStart(game.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl ${game.bgColor} ${game.color}`}
                      >
                        <game.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{game.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {game.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Music2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {game.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {selectedGame && (
            <div className="mt-6 text-center">
              <Button className="gap-2" onClick={() => setSelectedGame(null)}>
                <Gamepad2 className="h-4 w-4" />
                Start {games.find((g) => g.id === selectedGame)?.title}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showGame} onOpenChange={setShowGame}>
  <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {games.find((g) => g.id === selectedGame)?.title}
      </DialogTitle>
    </DialogHeader>

    {isLoading ? (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
      </div>
    ) : (
      renderGame()
    )}
  </DialogContent>
</Dialog>

    </>
  );
};