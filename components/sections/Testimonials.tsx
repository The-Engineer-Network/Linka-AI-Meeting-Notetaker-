"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Manager at TechCorp",
    avatar: "/avatar1.png",
    quote: "Linka has revolutionized how I handle meetings. The transcription is spot on and saves me hours every week. The AI summaries are game-changing!",
    rating: 5,
    company: "TechCorp",
    highlight: "Saves 5+ hours/week",
  },
  {
    name: "Mike Chen",
    role: "Team Lead at StartupXYZ",
    avatar: "/avatar2.png",
    quote: "The AI summaries are incredible. I can focus on the conversation instead of taking notes. Linka's privacy-first approach gives me peace of mind.",
    rating: 5,
    company: "StartupXYZ",
    highlight: "99% accuracy",
  },
  {
    name: "Emily Davis",
    role: "Consultant at Global Solutions",
    avatar: "/avatar3.png",
    quote: "As a consultant, I attend dozens of meetings weekly. Linka captures every detail and provides actionable insights. It's become indispensable.",
    rating: 5,
    company: "Global Solutions",
    highlight: "Zero missed details",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function Testimonials() {
  return (
    <section className="py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/50 to-purple-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-100/50 to-pink-100/50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-yellow-600 fill-current" />
            <span className="text-sm font-medium text-gray-700">4.9/5 from 10,000+ users</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Loved by Teams
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of professionals who have transformed their meeting experience
            with Linka's AI-powered productivity tools.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Quote icon */}
                <div className="absolute top-4 right-4 text-gray-200 group-hover:text-blue-200 transition-colors">
                  <Quote className="w-8 h-8" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 p-6 pb-0">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <CardContent className="p-6 pt-4">
                  <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 relative">
                    "{testimonial.quote}"
                  </blockquote>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        {testimonial.highlight}
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Hover effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">G2</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">4.8/5</div>
                <div className="text-xs text-gray-600">G2 Rating</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">C</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Chrome Web Store</div>
                <div className="text-xs text-gray-600">Featured Extension</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">10K+</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Active Users</div>
                <div className="text-xs text-gray-600">And growing</div>
              </div>
            </div>
          </div>

          <p className="text-gray-600">
            Trusted by teams at <span className="font-semibold text-gray-900">Google, Microsoft, Amazon</span> and more
          </p>
        </motion.div>
      </div>
    </section>
  );
}