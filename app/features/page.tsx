"use client";

import { motion } from "framer-motion";
import { 
  Brain, 
  Heart, 
  Target, 
  BookOpen, 
  Gamepad2, 
  BarChart3,
  Shield,
  Sparkles,
  Play,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FeaturesPage() {
  const mainFeatures = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Mood Analysis",
      description: "Our advanced AI analyzes your mood patterns, identifies trends, and provides personalized insights to help you understand your emotional well-being.",
      benefits: [
        "Real-time mood tracking",
        "Pattern recognition",
        "Personalized insights",
        "Predictive analytics"
      ],
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Interactive Mindfulness Games",
      description: "Engage with scientifically-designed games that reduce anxiety, improve focus, and promote mental clarity through guided meditation and breathing exercises.",
      benefits: [
        "Breathing exercises",
        "Focus meditation",
        "Zen garden",
        "Ocean waves relaxation"
      ],
      color: "from-green-500 to-teal-600"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Personal Journal",
      description: "A private, secure space to reflect on your thoughts, track your mental health journey, and gain deeper insights into your emotional patterns.",
      benefits: [
        "Private journaling",
        "Mood tagging",
        "Search functionality",
        "Progress tracking"
      ],
      color: "from-orange-500 to-red-600"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Comprehensive Analytics",
      description: "Visualize your mental health journey with detailed charts, progress tracking, and actionable insights to help you achieve your wellness goals.",
      benefits: [
        "Mood trends",
        "Activity tracking",
        "Streak monitoring",
        "Goal setting"
      ],
      color: "from-purple-500 to-pink-600"
    }
  ];

  const additionalFeatures = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Your mental health data is encrypted and secure. We never share your information with third parties."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Personalized Experience",
      description: "AI adapts to your unique needs and provides tailored recommendations based on your patterns."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Access mental health support anytime, anywhere with our always-available AI companion."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Evidence-Based",
      description: "All features are built on validated therapeutic techniques and mental health research."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Powerful{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Features
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover how AI-powered tools can transform your mental health journey with personalized support and insights.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-16">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Feature Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white`}>
                      {feature.icon}
                    </div>
                    <h2 className="text-3xl font-bold">{feature.title}</h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/dashboard">
                    <Button className="mt-4">
                      Try Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>


              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">More Amazing Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for a comprehensive mental health experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Preview Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="bg-card rounded-2xl p-8 md:p-12 border border-border"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Try Our Mindfulness Games</h2>
              <p className="text-lg text-muted-foreground">
                Experience the power of interactive mental health tools
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { name: "Breathing Exercise", icon: "🫁", desc: "Guided breathing for relaxation" },
                { name: "Candle Focus", icon: "🕯️", desc: "Concentration meditation game" },
                { name: "Zen Garden", icon: "🌸", desc: "Digital zen garden experience" }
              ].map((game) => (
                <div key={game.name} className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-4xl mb-2">{game.icon}</div>
                  <h3 className="font-semibold mb-1">{game.name}</h3>
                  <p className="text-sm text-muted-foreground">{game.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Start Playing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Experience These Features?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who are already improving their mental health with our AI-powered platform.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 