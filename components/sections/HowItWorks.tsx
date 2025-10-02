"use client";

import { motion } from "framer-motion";
import { Chrome, Mic, FileText, Download, ArrowRight, Play, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Chrome,
    title: "Install Extension",
    description: "Add Linka to Chrome with one click. No signup required.",
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100",
  },
  {
    icon: Play,
    title: "Start Meeting",
    description: "Join your meeting as usual. Linka runs silently in the background.",
    color: "from-green-500 to-green-600",
    bgColor: "from-green-50 to-green-100",
  },
  {
    icon: Mic,
    title: "AI Transcribes",
    description: "Real-time transcription with speaker identification and timestamps.",
    color: "from-purple-500 to-purple-600",
    bgColor: "from-purple-50 to-purple-100",
  },
  {
    icon: FileText,
    title: "Get Insights",
    description: "Receive summaries, action items, and smart notes instantly.",
    color: "from-orange-500 to-orange-600",
    bgColor: "from-orange-50 to-orange-100",
  },
  {
    icon: Download,
    title: "Export & Share",
    description: "Export to your favorite tools or share with your team.",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "from-indigo-50 to-indigo-100",
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

const stepVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const arrowVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay: 0.3 },
  },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works in
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              5 Simple Steps
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From installation to insights - Linka makes meeting productivity effortless.
            No complex setup, no learning curve.
          </p>
        </motion.div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block">
          <motion.div
            className="relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Timeline line */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200" />

            <div className="grid grid-cols-5 gap-8">
              {steps.map((step, index) => (
                <motion.div key={index} variants={stepVariants} className="relative">
                  {/* Step circle */}
                  <div className={`relative mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${step.color} shadow-lg flex items-center justify-center mb-6 z-10`}>
                    <step.icon className="w-8 h-8 text-white" />
                    <div className="absolute -inset-2 bg-white/20 rounded-full blur-sm" />
                  </div>

                  {/* Content */}
                  <div className={`bg-gradient-to-br ${step.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-center leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <motion.div
                      className="absolute top-20 -right-4 z-20"
                      variants={arrowVariants}
                    >
                      <div className="bg-white rounded-full p-2 shadow-lg">
                        <ArrowRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden">
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {steps.map((step, index) => (
              <motion.div key={index} variants={stepVariants} className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} shadow-lg flex items-center justify-center`}>
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex-1 bg-gradient-to-br ${step.bgColor} rounded-xl p-4 shadow-lg`}>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-6 py-3 mb-6">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Ready to get started?</span>
          </div>
          <p className="text-gray-600 mb-8">
            Join thousands of professionals who have transformed their meeting experience.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Try Linka Free
          </button>
        </motion.div>
      </div>
    </section>
  );
}