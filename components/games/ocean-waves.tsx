"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Waves, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

export default function OceanWaves() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "exhale">("inhale");
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Setup audio on mount
  useEffect(() => {
    audioRef.current = new Audio("/sounds/waves.mp3");
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

  // Handle breathing cycle
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentPhase((prev) => {
          if (prev === "inhale") {
            setBreathCount((count) => count + 1);
            return "exhale";
          } else {
            return "inhale";
          }
        });
      }, 4000); // 4 seconds per phase
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Only play if volume is not 0
      if (volume > 0) {
        audioRef.current.volume = volume / 100;
        audioRef.current.play().catch(console.error);
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Auto-play when volume is increased from 0
  useEffect(() => {
    if (isPlaying && volume > 0 && audioRef.current) {
      audioRef.current.volume = volume / 100;
      if (audioRef.current.paused) {
        audioRef.current.play().catch(console.error);
      }
    } else if (isPlaying && volume === 0 && audioRef.current) {
      audioRef.current.pause();
    }
  }, [volume, isPlaying]);

  const reset = () => {
    setIsPlaying(false);
    setBreathCount(0);
    setCurrentPhase("inhale");
    audioRef.current?.pause();
    audioRef.current!.currentTime = 0;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Ocean Waves Breathing</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Match your breath with the gentle ocean waves
        </p>
      </div>

      <div className="relative w-full max-w-md h-64 bg-gradient-to-b from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6 overflow-hidden">
        {/* Ocean waves animation */}
        <motion.div
          animate={{
            y: isPlaying ? [0, -20, 0] : 0,
            scale: currentPhase === "inhale" ? [1, 1.1, 1] : [1, 0.9, 1],
          }}
          transition={{
            duration: 4,
            repeat: isPlaying ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Waves className="w-24 h-24 text-blue-500" />
        </motion.div>

        {/* Multiple wave layers for depth */}
        {[1, 2, 3].map((layer) => (
          <motion.div
            key={layer}
            animate={{
              x: isPlaying ? [0, 50, 0] : 0,
              opacity: isPlaying ? [0.3, 0.7, 0.3] : 0.3,
            }}
            transition={{
              duration: 4 + layer,
              repeat: isPlaying ? Infinity : 0,
              ease: "easeInOut",
              delay: layer * 0.5,
            }}
            className="absolute bottom-0 left-0 right-0 h-16 bg-blue-400/30 rounded-t-full"
            style={{ transform: `scaleY(${layer * 0.3})` }}
          />
        ))}

        {/* Breath indicator */}
        <div className="absolute top-4 left-4 right-4 text-center">
          <motion.div
            animate={{
              scale: currentPhase === "inhale" ? [1, 1.2, 1] : 1,
              color: currentPhase === "inhale" ? "#3b82f6" : "#6b7280",
            }}
            transition={{ duration: 0.5 }}
            className="text-lg font-semibold"
          >
            {currentPhase === "inhale" ? "Breathe In" : "Breathe Out"}
          </motion.div>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-lg font-semibold">Breaths: {breathCount}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Follow the wave rhythm
        </p>
      </div>

      <div className="flex gap-4">
        <Button onClick={togglePlay} variant={isPlaying ? "outline" : "default"}>
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? "Pause" : "Start"}
        </Button>
        <Button onClick={reset} variant="outline">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Volume Control */}
      <div className="w-64 mt-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Volume</label>
          <span className="text-sm text-muted-foreground">{volume}%</span>
        </div>
        <div className="flex items-center gap-2">
          {volume === 0 ? (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Volume2 className="w-4 h-4 text-muted-foreground" />
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

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Inhale as the wave rises</p>
        <p>Exhale as the wave falls</p>
      </div>
    </div>
  );
}