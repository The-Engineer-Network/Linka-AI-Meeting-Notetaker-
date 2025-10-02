/**
 * Hero Section Component - Main Value Proposition
 *
 * This is the most important section of the landing page that:
 * - Captures attention with animated headline and background
 * - Communicates the core value proposition clearly
 * - Provides clear call-to-action for Chrome extension installation
 * - Includes trust indicators and social proof elements
 *
 * README Design System:
 * - Colors: Blue (#3B82F6) to Purple (#A855F7) gradient
 * - Typography: Inter font family, 8px spacing system
 * - Interactions: Hover effects, active states, smooth transitions
 * - Shadows: Subtle shadows for depth and hierarchy
 *
 * For other developers:
 * - Animations are staggered for performance (container → items → stats)
 * - Floating icons use continuous animations for visual interest
 * - Background uses multiple gradient layers for depth
 * - Chrome extension badge reinforces the product type
 * - Trust indicators build credibility immediately
 */

"use client";

// Import UI components (README: UI components in /components/ui/)
import { Button } from "@/components/ui/button"; // Custom button with tactile feedback
import Image from "next/image";
import { motion } from "framer-motion"; // README: Framer Motion for animations
import { Chrome, Sparkles, Zap, Shield } from "lucide-react"; // README: Lucide React icons

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0, 0, 0.2, 1] }, // easeOut
  },
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: [0.4, 0, 0.2, 1], // easeInOut
    },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden pb-16">
      {/* Animated background elements (README: Colors - Blue to Purple gradient) */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <motion.div
        className="absolute top-32 left-20 text-blue-500/60"
        variants={floatingVariants}
        animate="animate"
      >
        <Chrome size={48} />
      </motion.div>
      <motion.div
        className="absolute top-40 right-32 text-purple-500/60"
        variants={floatingVariants}
        animate="animate"
      >
        <Sparkles size={40} />
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-32 text-indigo-500/60"
        variants={floatingVariants}
        animate="animate"
      >
        <Zap size={44} />
      </motion.div>
      <motion.div
        className="absolute bottom-32 right-20 text-blue-500/60"
        variants={floatingVariants}
        animate="animate"
      >
        <Shield size={42} />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Chrome Extension Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 mb-8 shadow-lg"
            variants={itemVariants}
          >
            <Chrome className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Chrome Extension</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Never Miss
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              a Meeting Detail
            </span>
            <br />
            <span className="text-gray-800">Again</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Transform your meetings with AI-powered transcription, real-time translation,
            intelligent summaries, and privacy-first note-taking. Built for the modern workplace.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            variants={itemVariants}
          >
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-full">
              <Chrome className="w-5 h-5 mr-2" />
              Add to Chrome - Free
            </Button>
            <Button variant="outline" className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 text-lg px-8 py-4 rounded-full transition-all duration-300">
              Learn More
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Privacy First</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Real-time Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>AI Powered</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Impact Dashboard */}
        <motion.div
          className="mt-16 relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-2xl transform rotate-1" />
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200/50"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                  <div className="text-sm text-gray-600">Meetings Transcribed</div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full w-4/5"></div>
                  </div>
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200/50"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-3xl font-bold text-purple-600 mb-2">99%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-600 h-2 rounded-full w-full"></div>
                  </div>
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200/50"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
                  <div className="text-sm text-gray-600">Languages</div>
                  <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                  </div>
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200/50"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-3xl font-bold text-orange-600 mb-2">5hrs</div>
                  <div className="text-sm text-gray-600">Time Saved/Week</div>
                  <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                    <div className="bg-orange-600 h-2 rounded-full w-5/6"></div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-6 py-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ professionals worldwide</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
