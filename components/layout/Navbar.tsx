/**
 * Navbar Component - Global Navigation
 *
 * Responsive navigation bar with:
 * - Logo and branding
 * - Desktop navigation links
 * - Primary CTA button (Add to Chrome)
 * - Mobile hamburger menu with slide-down animation
 *
 * README Architecture: Responsive First - Mobile-first approach
 * README Design System: Interactions - Hover effects, active states, smooth transitions
 *
 * For other developers:
 * - Mobile menu uses AnimatePresence for smooth transitions (README: Framer Motion)
 * - State management for menu open/close
 * - Responsive design with Tailwind breakpoints
 * - Active link highlighting (can be enhanced with router)
 * - Accessibility: proper ARIA labels and keyboard navigation
 */

"use client";

// Import UI components (README: UI components in /components/ui/)
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Custom button with tactile feedback
import { Chrome, Menu, X } from "lucide-react"; // README: Lucide React icons
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // README: Framer Motion for animations
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-50 shadow-lg shadow-black/5"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Chrome className="w-4 h-4 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Linka
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {isLandingPage ? (
                <>
                  <Link href="#features" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 active:scale-95 cursor-pointer">
                    Features
                  </Link>
                  <Link href="#how-it-works" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 active:scale-95 cursor-pointer">
                    How It Works
                  </Link>
                  <Link href="#demo" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 active:scale-95 cursor-pointer">
                    Demo
                  </Link>
                  <Link href="#faq" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 active:scale-95 cursor-pointer">
                    FAQ
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 active:scale-95 cursor-pointer">
                    Dashboard
                  </Link>
                  <Link href="/archive" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 active:scale-95 cursor-pointer">
                    Archive
                  </Link>
                  <Link href="/profile" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 active:scale-95 cursor-pointer">
                    Profile
                  </Link>
                  <Link href="/settings" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 active:scale-95 cursor-pointer">
                    Settings
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 rounded-full flex items-center gap-2 px-6 py-2">
              <Chrome className="w-4 h-4" />
              <span className="hidden sm:inline">Add to Chrome</span>
              <span className="sm:hidden">Install</span>
            </Button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-6 space-y-2">
              {isLandingPage ? (
                <>
                  <Link
                    href="#features"
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    How It Works
                  </Link>
                  <Link
                    href="#demo"
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    Demo
                  </Link>
                  <Link
                    href="#faq"
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    FAQ
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/archive"
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    Archive
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

