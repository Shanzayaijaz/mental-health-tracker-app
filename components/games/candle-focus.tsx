"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Flame, Play, Pause, RotateCcw, Target, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface CandleFocusProps {
  onGameComplete?: (data: {
    gameType: string;
    duration: number;
    score: number;
    driftCount: number;
  }) => void;
}

export default function CandleFocus({ onGameComplete }: CandleFocusProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [driftCount, setDriftCount] = useState(0);
  const [sessionDuration] = useState(180); // 3 minutes default
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Setup audio on mount
    audioRef.current = new Audio("/sounds/candle.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;

    return () => {
      audioRef.current?.pause();
      audioRef.current!.currentTime = 0;
    };
  }, [volume]);

  // Sync volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && focusTime < sessionDuration) {
      interval = setInterval(() => {
        setFocusTime(prev => prev + 1);
      }, 1000);
    } else if (focusTime >= sessionDuration) {
      setIsPlaying(false);
      audioRef.current?.pause();
    }

    return () => clearInterval(interval);
  }, [isPlaying, focusTime, sessionDuration]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Only play if volume is not 0
      if (volume > 0) {
        audioRef.current.volume = volume / 100;
        audioRef.current.play().catch((error) => {
          console.log("Audio play error (can be ignored):", error);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Auto-play when volume is increased from 0
  useEffect(() => {
    if (isPlaying && volume > 0 && audioRef.current) {
      audioRef.current.volume = volume / 100;
      if (audioRef.current.paused) {
        // Small delay to prevent play/pause conflict
        setTimeout(() => {
          if (audioRef.current && !audioRef.current.paused) return;
          audioRef.current?.play().catch((error) => {
            console.log("Audio play error (can be ignored):", error);
          });
        }, 100);
      }
    } else if (isPlaying && volume === 0 && audioRef.current) {
      audioRef.current.pause();
    }
  }, [volume, isPlaying]);

  const reset = () => {
    setIsPlaying(false);
    setFocusTime(0);
    setDriftCount(0);
    audioRef.current?.pause();
    audioRef.current!.currentTime = 0;
  };

  const handleDrift = () => {
    setDriftCount(prev => prev + 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const focusScore = Math.max(0, 100 - (driftCount * 10));

  // Track game completion
  useEffect(() => {
    if (focusTime >= sessionDuration && onGameComplete) {
      onGameComplete({
        gameType: "candle_focus",
        duration: focusTime,
        score: focusScore,
        driftCount: driftCount,
      });
    }
  }, [focusTime, sessionDuration, focusScore, driftCount, onGameComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold mb-1">Candle Focus Meditation</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Stare at the candle flame and tap when your mind drifts
        </p>
      </div>

      <div className="relative w-full max-w-sm h-48 bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-4 flex items-center justify-center">
        {/* Candle flame */}
        <motion.div
          animate={{
            scale: isPlaying ? [1, 1.1, 0.9, 1] : 1,
            rotate: isPlaying ? [0, 1, -1, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: isPlaying ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="text-center"
        >
          <Flame className="w-12 h-12 text-orange-500 mx-auto mb-2" />
          <div className="w-1.5 h-6 bg-orange-400 rounded-full mx-auto" />
        </motion.div>

        {/* Focus indicator */}
        {isPlaying && (
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            className="absolute top-2 right-2"
          >
            <Target className="w-4 h-4 text-green-500" />
          </motion.div>
        )}
      </div>

      <div className="text-center mb-4 space-y-1">
        <p className="text-xl font-bold">{formatTime(focusTime)}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Focus Score: {focusScore}%
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Mind drifts: {driftCount}
        </p>
      </div>

      <div className="flex gap-2 mb-3">
        <Button onClick={togglePlay} variant={isPlaying ? "outline" : "default"} size="sm">
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isPlaying ? "Pause" : "Start"}
        </Button>
        <Button onClick={reset} variant="outline" size="sm">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {isPlaying && (
        <Button 
          onClick={handleDrift} 
          variant="outline" 
          size="sm"
          className="text-red-500 border-red-300 hover:bg-red-50"
        >
          Mind Drifted
        </Button>
      )}

      {/* Volume Control */}
      <div className="w-48 mt-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium">Volume</label>
          <span className="text-xs text-muted-foreground">{volume}%</span>
        </div>
        <div className="flex items-center gap-2">
          {volume === 0 ? (
            <VolumeX className="w-3 h-3 text-muted-foreground" />
          ) : (
            <Volume2 className="w-3 h-3 text-muted-foreground" />
          )}
          <Slider
            value={[volume]}
            onValueChange={(val: number[]) => setVolume(val[0])}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
        <p>Focus on the flame</p>
        <p>Tap &quot;Mind Drifted&quot; when you lose focus</p>
      </div>
    </div>
  );
}