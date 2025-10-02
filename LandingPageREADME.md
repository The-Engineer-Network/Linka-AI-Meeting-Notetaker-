# Linka Landing Page

A modern, responsive landing page for Linka - an AI-powered meeting notetaker Chrome extension with real-time transcription and intelligent summaries.

---

## Overview

This landing page showcases Linka's core features and value proposition. Built with Next.js 14, TypeScript, and Tailwind CSS for optimal performance and SEO.

---

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/The-Engineer-Network/Linka-AI-Meeting-Notetaker-.git

# Navigate to landing page folder
cd Linka-AI-Meeting-Notetaker-/landing

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build for Production

```bash
npm run build
npm run start
```

---

## Project Structure

```
landing/
├── app/
│   ├── layout.tsx              # Root layout with SEO
│   ├── page.tsx                # Main landing page
│   └── globals.css             # Global styles
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx         # Navigation header
│   │   └── Footer.tsx         # Site footer
│   ├── sections/
│   │   ├── Hero.tsx           # Hero section
│   │   ├── Features.tsx       # Feature showcase
│   │   ├── HowItWorks.tsx     # Process explanation
│   │   ├── Demo.tsx           # Product demo
│   │   ├── Testimonials.tsx   # User testimonials
│   │   ├── Pricing.tsx        # Pricing information
│   │   ├── FAQ.tsx            # FAQ section
│   │   └── CTA.tsx            # Call-to-action
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── utils.ts               # Utility functions
│   └── constants.ts           # Design constants
├── public/                    # Static assets
└── styles/                    # Additional styles
```

---

## Design System

### Colors
- Primary: `#3B82F6` (Blue)
- Secondary: `#A855F7` (Purple)
- Accent: Blue to Purple gradient

### Typography
- Font: Inter
- Spacing: 8px grid system

### Principles
- Mobile-first responsive design
- Smooth animations
- Accessibility compliant

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

The site deploys automatically with zero configuration.

### Manual Deployment

Build the project and deploy the `.next` folder to any static hosting service.

---

## Development

### Adding New Sections

Create a component in `components/sections/` and import it in `app/page.tsx`:

```tsx
import NewSection from '@/components/sections/NewSection';

export default function Home() {
  return (
    <>
      <Hero />
      <NewSection />
      <CTA />
    </>
  );
}
```

### Styling Guidelines

- Use Tailwind utility classes
- Follow mobile-first approach
- Maintain consistent spacing

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

---

## License

MIT License - see LICENSE file for details.