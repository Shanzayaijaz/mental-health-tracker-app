#  MoodSync AI - Mental Health Wellness Platform

A comprehensive mental health and wellness platform powered by AI, designed to help users track their emotional well-being, manage stress, and build healthy habits.

##  Features

### **Core Wellness Features**

#### **Mood Tracking & Analysis**
- **Real-time Mood Logging**: Track your daily emotions with 8 different mood states
- **AI-Powered Analysis**: Get personalized insights and recommendations based on your mood patterns
- **Mood History**: View your emotional journey over time with detailed analytics
- **Smart Notifications**: Gentle reminders to check in with your mental health

#### **Journaling & Reflection**
- **Rich Text Journaling**: Express yourself with a beautiful, distraction-free writing experience
- **AI Journal Analysis**: Get insights and patterns from your journal entries
- **Mood Correlation**: See how your writing relates to your emotional state
- **Privacy-First**: Your thoughts are encrypted and secure

#### **Interactive Wellness Games**
- **Anxiety Relief Games**: Engaging activities designed to reduce stress and anxiety
- **Mindfulness Exercises**: Guided breathing and meditation techniques
- **Cognitive Training**: Games that improve focus and mental clarity
- **Progress Tracking**: Monitor your improvement over time

#### **Goal Setting & Achievement**
- **Personal Wellness Goals**: Set and track meaningful mental health objectives
- **Progress Visualization**: Beautiful charts showing your journey
- **Milestone Celebrations**: Celebrate your achievements and growth
- **Adaptive Recommendations**: AI suggests goals based on your patterns

###  **User Experience**

#### **Beautiful Design**
- **Modern UI/UX**: Clean, intuitive interface designed for mental wellness
- **Dark/Light Themes**: Choose your preferred visual experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Accessibility**: Designed with mental health accessibility in mind

##  Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mental-health-ai.git
   cd mental-health-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   HUGGING_FACE_API_KEY= your_hf_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

##  Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### **Backend & Database**
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Reliable database
- **Row Level Security** - Data protection

### **Authentication & Security**
- **Supabase Auth** - Secure user authentication
- **JWT Tokens** - Stateless authentication
- **Encryption** - End-to-end data protection

##  Configuration

### **Environment Variables**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
HUGGING_FACE_API_KEY= your_hf_key
```

### **Database Schema**
The application uses the following main tables:
- `users` - User profiles and preferences
- `mood_entries` - Daily mood tracking data
- `journal_entries` - User journal entries
- `wellness_goals` - Personal wellness objectives
- `game_sessions` - Interactive game data

##  Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### **Other Platforms**
- **Netlify**: Configure build settings for Next.js
- **Railway**: Deploy with database included
- **DigitalOcean**: Use App Platform for easy deployment
