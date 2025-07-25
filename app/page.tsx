"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ripple } from "@/components/ui/ripple";
import { Button } from "@/components/ui/button";
import { ArrowRight, HeartPulse, Waves, Lightbulb, MessageCircle, Sparkles, SmilePlus, Calendar } from "lucide-react";
export default function Home() {
  const emotions = [
    { value: 0, label: "😢 Sad", color: "bg-indigo-200" },
    { value: 15, label: "😤 Frustrated", color: "bg-orange-200" },
    { value: 30, label: "😡 Angry", color: "bg-red-300" },
    { value: 45, label: "😰 Anxious", color: "bg-sky-200" },
    { value: 50, label: "😐 Neutral", color: "bg-gray-200" },
    { value: 70, label: "😊 Content", color: "bg-green-200" },
    { value: 90, label: "🤗 Happy", color: "bg-yellow-200" },
  ];

  const [selectedEmotion, setSelectedEmotion] = useState(60);
  const [mounted, setMounted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const features = [
    {
      icon: HeartPulse,
      title: "24/7 Support",
      description: "Always here to listen and support you, any time of day",
      color: "from-rose-500/20",
      delay: 0.2,
    },
    {
      icon: Lightbulb,
      title: "Smart Insights",
      description: "Personalized guidance powered by emotional intelligence",
      color: "from-amber-500/20",
      delay: 0.4,
    },
    {
      icon: MessageCircle,
      title: "Gentle Prompts",
      description: "Answer thoughtful questions to reflect and process emotions",
      color: "from-blue-500/20",
      delay: 0.6,
    },
    {
      icon: Sparkles,
      title: "Mood Tracking",
      description: "Monitor how you feel over time with subtle daily check-ins",
      color: "from-purple-500/20",
      delay: 0.8,
    },
    {
      icon: SmilePlus,
      title: "Emotional Boosts",
      description: "Get uplifting messages when you need them the most",
      color: "from-green-500/20",
      delay: 1.0,
    },
    {
      icon: Calendar,
      title: "Weekly Reflections",
      description: "Review your emotional journey and grow with intention",
      color: "from-indigo-500/20",
      delay: 1.2,
    },
  ];
  const currentEmotion = emotions.find((e) => e.value === selectedEmotion) ?? emotions[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] mt-20 flex flex-col items-center justify-center py-12 px-4">
        {/* Background Blobs & Blur */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div
            className={`absolute w-[500px] h-[500px] rounded-full blur-3xl top-0 -left-20 transition-all duration-700 ease-in-out
            bg-gradient-to-r ${currentEmotion.color} to-transparent opacity-60`}
          />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl bottom-0 right-0 animate-pulse delay-700" />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />
        </div>

        {/* Ripple Effect */}
        <Ripple className="text-gray-400/40 dark:text-white/20" />

        {/* Animated Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative space-y-8 text-center"
        >
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm border border-primary/20 bg-primary/5 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
            <Waves className="w-4 h-4 animate-wave text-primary" />
            <span className="relative text-foreground/90 dark:text-foreground after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-primary/30 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300">
              Your AI-Powered Mental Health Ally
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-plus-jakarta tracking-tight">
            <span className="inline-block bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)] hover:to-primary transition-all duration-300">
              How are you really feeling?
            </span>
            <br />
            <span className="inline-block mt-2 bg-gradient-to-b from-foreground to-foreground/90 bg-clip-text text-transparent">
              Let’s check in
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-[600px] mx-auto text-base md:text-lg text-muted-foreground leading-relaxed tracking-wide">
            Take a moment to reflect. Your emotions matter — and this space is here to help you understand them without judgment.
          </p>
        </motion.div>
      </section>

      {/* Emotion Selector Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 space-y-8 text-center pb-20"
      >
        <h2 className="text-2xl font-semibold mb-6">How are you feeling today?</h2>

        <div className="flex flex-wrap justify-center gap-3">
          {emotions.map((emotion) => (
            <button
              key={emotion.value}
              onClick={() => setSelectedEmotion(emotion.value)}
              className={`p-4 text-3xl rounded-full shadow-md hover:scale-105 transition-all duration-200 ${
                selectedEmotion === emotion.value
                  ? `${emotion.color} ring-4 ring-offset-2 ring-accent`
                  : "bg-muted"
              }`}
            >
              {emotion.label.split(" ")[0]}
            </button>
          ))}
        </div>

        <p className="mt-6 text-lg">
          You selected:{" "}
          <span className="font-bold">{currentEmotion.label}</span>
        </p>
        {selectedEmotion && (
  <Button
    size="lg"
    onClick={() => setShowDialog(true)}
    className="relative group h-12 px-8 mt-6 rounded-full bg-gradient-to-r from-primary via-primary/90 to-secondary hover:to-primary shadow-lg shadow-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/30"
  >
    <span className="relative z-10 font-medium flex items-center gap-2">
    Talk About It
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
    </span>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-size-200 bg-pos-0 group-hover:bg-pos-100" />
  </Button>
)}

      </motion.div>
      <section className="relative py-20 px-4 overflow-hidden">
  <div className="max-w-6xl mx-auto">
    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center mb-16 space-y-4"
    >
      <h2 className="text-3xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent dark:text-primary/90">
        How MoodSync Helps You
      </h2>
      <p className="text-foreground dark:text-foreground/95 max-w-2xl mx-auto font-medium text-lg">
      Feel seen, heard, and supported — anytime.
      </p>
    </motion.div>

    {/* Grid of Features */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-foreground">
      {features.map(({ icon: Icon, title, description, color, delay }, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay }}
          viewport={{ once: true }}
          className="bg-card p-6 rounded-xl shadow-sm"
        >
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br ${color} mb-4`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm">{description}</p>
        </motion.div>
      ))}
    </div>
  </div>

      </section>
    </div>
   
  );
}
