"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Chrome, Heart, Mail, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const footerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-100/30 to-purple-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-indigo-100/30 to-pink-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Brand section */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Chrome className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Linka
              </span>
            </Link>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-md">
              Transform your meetings with AI-powered transcription, real-time translation,
              and intelligent summaries. Privacy-first, always free.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 hover:shadow-lg active:scale-95 cursor-pointer"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 hover:shadow-lg active:scale-95 cursor-pointer"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 hover:shadow-lg active:scale-95 cursor-pointer"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          {/* Product links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-all duration-200 flex items-center gap-2 active:scale-95 cursor-pointer">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-all duration-200 flex items-center gap-2 active:scale-95 cursor-pointer">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#demo" className="text-gray-600 hover:text-blue-600 transition-all duration-200 flex items-center gap-2 active:scale-95 cursor-pointer">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Demo
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Support links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#faq" className="text-gray-600 hover:text-blue-600 transition-all duration-200 flex items-center gap-2 active:scale-95 cursor-pointer">
                  <MessageCircle className="w-4 h-4" />
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:support@linka.ai" className="text-gray-600 hover:text-blue-600 transition-all duration-200 flex items-center gap-2 active:scale-95 cursor-pointer">
                  <Mail className="w-4 h-4" />
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-blue-600 transition-all duration-200 flex items-center gap-2 active:scale-95 cursor-pointer">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 hover:text-blue-600 transition-all duration-200 flex items-center gap-2 active:scale-95 cursor-pointer">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                  Terms of Service
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom section */}
        <motion.div
          className="border-t border-gray-200/50 pt-8 flex flex-col md:flex-row justify-between items-center"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-4 md:mb-0">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>by</span>
            <span className="font-medium text-gray-900">The Engineer's Network AI Team</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>© 2024 Linka. All rights reserved.</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}