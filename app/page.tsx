/**
 * Linka Landing Page - Main Entry Point
 *
 * This is the main landing page component that orchestrates all sections
 * of the Linka Chrome extension landing page. Each section is a modular
 * component that can be easily modified or reordered.
 *
 * Architecture (per README):
 * - Uses Next.js 14 App Router
 * - Modular section-based design for easy maintenance
 * - Responsive design with mobile-first approach
 * - Framer Motion animations for smooth interactions
 *
 * To modify the page structure:
 * 1. Import new section components at the top
 * 2. Add them to the JSX in desired order
 * 3. Each section handles its own styling and animations
 *
 * For other developers:
 * - All sections are in /components/sections/ (README: sections folder)
 * - UI components are in /components/ui/ (README: ui folder)
 * - Layout components are in /components/layout/ (README: layout folder)
 * - Routes for app features are in /app/ (README: dashboard, settings, profile)
 */

// Import section components (README: Modular Design - self-contained components)
import { Hero } from "@/components/sections/Hero"; // Main value proposition section
import { Features } from "@/components/sections/Features"; // Feature showcase with animations
import { HowItWorks } from "@/components/sections/HowItWorks"; // User journey visualization
import { Demo } from "@/components/sections/Demo"; // Product demonstration
import { Testimonials } from "@/components/sections/Testimonials"; // Social proof
import { Pricing } from "@/components/sections/Pricing"; // Pricing information
import { FAQ } from "@/components/sections/FAQ"; // Common questions
import { CTA } from "@/components/sections/CTA"; // Call-to-action

/**
 * Home Page Component
 *
 * Renders the complete landing page by composing all section components.
 * The order here determines the visual flow of the page.
 *
 * Current section order (README-aligned):
 * 1. Hero - Main value proposition and CTA
 * 2. Features - Key capabilities showcase
 * 3. HowItWorks - Step-by-step user journey
 * 4. Demo - Product demonstration and screenshots
 * 5. Testimonials - Social proof and user reviews
 * 6. Pricing - Cost information
 * 7. FAQ - Common questions
 * 8. CTA - Final conversion push
 *
 * README Architecture: Modular Design - Each section is self-contained
 */
export default function Home() {
  return (
    <>
      {/* Hero Section - Main headline, value prop, and primary CTA */}
      {/* README: Main value proposition section */}
      <Hero />

      {/* Features Section - Showcase key capabilities with animations */}
      {/* README: Feature showcase with animations */}
      <Features />

      {/* How It Works - Step-by-step user journey visualization */}
      {/* README: User journey visualization */}
      <HowItWorks />

      {/* Demo Section - Product demonstration and screenshots */}
      {/* README: Product demonstration */}
      <Demo />

      {/* Testimonials - Social proof and user reviews */}
      {/* README: Social proof */}
      <Testimonials />

      {/* Pricing Section - Transparent pricing information */}
      {/* README: Pricing information */}
      <Pricing />

      {/* FAQ Section - Address common user questions */}
      {/* README: Common questions */}
      <FAQ />

      {/* Final CTA - Last chance for conversion */}
      {/* README: Call-to-action */}
      <CTA />
    </>
  );
}
