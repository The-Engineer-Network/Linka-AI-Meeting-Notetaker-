"use client";

import { motion } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "Is Linka really free?",
    answer: "Yes, Linka is completely free to use with no hidden fees, subscriptions, or usage limits. We believe in making productivity tools accessible to everyone.",
    icon: HelpCircle,
  },
  {
    question: "How accurate is the transcription?",
    answer: "Linka uses state-of-the-art AI models to achieve 99%+ accuracy in transcription. Our models are continuously trained on diverse speech patterns and languages.",
    icon: MessageCircle,
  },
  {
    question: "Is my data really private?",
    answer: "Absolutely. Linka processes everything locally on your device. No audio, transcripts, or data ever leaves your computer. We don't store, share, or analyze your conversations.",
    icon: HelpCircle,
  },
  {
    question: "Which browsers are supported?",
    answer: "Linka is a Chrome extension, so it works with Google Chrome, Microsoft Edge, Brave, and other Chromium-based browsers. Firefox support is coming soon.",
    icon: MessageCircle,
  },
  {
    question: "Can I export my meeting data?",
    answer: "Yes! Export transcripts, summaries, and notes to PDF, DOCX, TXT, or integrate directly with tools like Notion, Slack, Google Docs, and more.",
    icon: HelpCircle,
  },
  {
    question: "What languages are supported?",
    answer: "Linka supports transcription and translation for 50+ languages including English, Spanish, French, German, Chinese, Japanese, Arabic, and many more.",
    icon: MessageCircle,
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

const faqVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function FAQ() {
  return (
    <section id="faq" className="py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-bl from-blue-100/30 to-purple-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-gradient-to-tr from-indigo-100/30 to-pink-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 mb-6">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Got Questions?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              to Know
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We've answered the most common questions about Linka.
            Can't find what you're looking for? Contact our support team.
          </p>
        </motion.div>

        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {faqs.map((faq, index) => (
            <motion.details
              key={index}
              variants={faqVariants}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <faq.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-6 pb-6">
                <div className="pl-14">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </motion.details>
          ))}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you get the most out of Linka.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}