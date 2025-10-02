"use client";

import { motion } from "framer-motion";
import { Play, Pause, Volume2, Settings, Maximize, Chrome, Mic, Users, Clock } from "lucide-react";
import { useState } from "react";

const demoVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, staggerChildren: 0.1 },
  },
};

export function Demo() {
  const [isPlaying, setIsPlaying] = useState(true);

  const mockTranscript = [
    { speaker: "John", text: "Let's discuss the Q4 roadmap for our product launch.", time: "0:12" },
    { speaker: "Sarah", text: "I think we should focus on the mobile app improvements first.", time: "0:18" },
    { speaker: "Mike", text: "Agreed. The user feedback has been overwhelmingly positive about the new features.", time: "0:25" },
    { speaker: "AI Summary", text: "Key points: Q4 roadmap discussion, mobile app priority, positive user feedback.", time: "0:30", isSummary: true },
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 mb-6 shadow-lg">
            <Play className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Live Demo</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            See Linka in
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Real Action
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience how Linka transforms your meetings with live transcription,
            intelligent summaries, and seamless integration.
          </p>
        </motion.div>

        <motion.div
          className="relative mx-auto max-w-6xl"
          variants={demoVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Browser mockup */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Browser header */}
            <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Chrome className="w-4 h-4" />
                  <span>Linka Extension - Meeting Active</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <Users className="w-4 h-4" />
                <span className="text-sm">4 participants</span>
                <Clock className="w-4 h-4" />
                <span className="text-sm">12:34</span>
              </div>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
              {/* Left side - Video/meeting interface */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Meeting Room</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-600">Recording</span>
                  </div>
                </div>

                {/* Mock video grid */}
                <div className="grid grid-cols-2 gap-3 flex-1 mb-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20" />
                      <div className="text-gray-500 text-sm">Participant {i}</div>
                      {i === 1 && (
                        <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          <Mic className="w-3 h-3 inline mr-1" />
                          Speaking
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 text-gray-700" /> : <Play className="w-5 h-5 text-gray-700" />}
                  </button>
                  <button className="bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all">
                    <Volume2 className="w-5 h-5 text-gray-700" />
                  </button>
                  <button className="bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all">
                    <Settings className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Right side - Linka interface */}
              <div className="bg-white p-6 flex flex-col border-l border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Linka Active
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>

                {/* Transcript */}
                <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-64">
                  {mockTranscript.map((item, index) => (
                    <motion.div
                      key={index}
                      className={`p-3 rounded-lg ${
                        item.isSummary
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                          : 'bg-gray-50'
                      }`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.5, duration: 0.5 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${
                          item.isSummary ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {item.speaker}
                        </span>
                        <span className="text-xs text-gray-500">{item.time}</span>
                      </div>
                      <p className={`text-sm ${
                        item.isSummary ? 'text-blue-800 font-medium' : 'text-gray-600'
                      }`}>
                        {item.text}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:shadow-lg transition-all">
                    Export Summary
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition-all">
                    Share Notes
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <motion.div
            className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Live Demo
          </motion.div>

          <motion.div
            className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Real-time transcription active
            </div>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-8 mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">99.5%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{"<200ms"}</div>
            <div className="text-sm text-gray-600">Latency</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">24/7</div>
            <div className="text-sm text-gray-600">Availability</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
