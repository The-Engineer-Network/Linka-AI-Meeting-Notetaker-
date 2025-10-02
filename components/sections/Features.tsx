/**
 * Features Section Component - Product Capabilities Showcase
 *
 * Displays the 6 core features of Linka in an interactive grid layout:
 * - Live Transcription, Smart Translation, AI Summarization
 * - Smart Notes, Export Options, Privacy First
 *
 * README Design System:
 * - Colors: Blue (#3B82F6) to Purple (#A855F7) gradient
 * - Typography: Inter font family, 8px spacing system
 * - Interactions: Hover effects, active states, smooth transitions
 * - Shadows: Subtle shadows for depth and hierarchy
 *
 * For other developers:
 * - Each feature has unique gradient colors and hover effects
 * - Staggered animations for smooth reveal on scroll
 * - Stats section provides credibility and social proof
 * - Cards scale and glow on hover for tactile feedback
 * - Icons from Lucide React for consistency (README: Lucide React icons)
 */

"use client";

// Import UI components (README: UI components in /components/ui/)
import { Mic, Languages, FileText, Brain, Download, Shield, Sparkles } from "lucide-react"; // README: Lucide React icons
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // README: Card components
import { motion } from "framer-motion"; // README: Framer Motion for animations

const features = [
  {
    icon: Mic,
    title: "Live Transcription",
    description: "Real-time transcription of your meetings with 99% accuracy using advanced AI models.",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
  },
  {
    icon: Languages,
    title: "Smart Translation",
    description: "Instant translation to 50+ languages with context-aware localization.",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
  },
  {
    icon: FileText,
    title: "AI Summarization",
    description: "Intelligent summaries with key points, action items, and sentiment analysis.",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
  },
  {
    icon: Brain,
    title: "Smart Notes",
    description: "Context-aware note-taking that captures important moments automatically.",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-50 to-red-50",
  },
  {
    icon: Download,
    title: "Multi-Format Export",
    description: "Export to PDF, DOCX, TXT, or integrate with Notion, Slack, and more.",
    gradient: "from-indigo-500 to-purple-500",
    bgGradient: "from-indigo-50 to-purple-50",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "End-to-end encryption with zero data retention. Your meetings stay private.",
    gradient: "from-slate-500 to-gray-500",
    bgGradient: "from-slate-50 to-gray-50",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }, // easeOut
  },
};

export function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need for
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Perfect Meetings
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Built with cutting-edge AI and designed for the modern workplace.
            Transform how your team collaborates and communicates.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Card className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br ${feature.bgGradient} hover:scale-105 cursor-pointer`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <CardHeader className="relative z-10 pb-4">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-4 shadow-lg`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <div className="mt-4 flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>

                {/* Hover effect overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats section */}
        <motion.div
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">99%</div>
            <div className="text-sm text-gray-600">Accuracy Rate</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">50+</div>
            <div className="text-sm text-gray-600">Languages</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">10M+</div>
            <div className="text-sm text-gray-600">Minutes Processed</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">4.9★</div>
            <div className="text-sm text-gray-600">User Rating</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}