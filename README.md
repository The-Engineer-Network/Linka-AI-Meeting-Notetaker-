# Linka - AI Meetings Notetaker

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Chrome](https://img.shields.io/badge/Chrome-Extension-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

> **Privacy-first AI meeting notes with real-time transcription, translation, and smart summaries. Completely free, forever.**

Made with ❤️ by [The Engineer's Network AI Team](https://github.com/engineers-network)

---

## 🎯 The Problem We Solve

Traditional meeting note-taking solutions force you to choose between convenience and privacy. Most tools:
- Upload your sensitive conversations to external servers
- Require expensive subscriptions
- Lock your data in proprietary formats
- Compromise privacy for AI features

**Linka changes everything.**

By leveraging Chrome's built-in AI APIs (Gemini Nano), Linka processes everything **locally on your device**. Your meeting data never leaves your computer. No cloud uploads. No data mining. No compromises.

---

## ✨ Key Features

### 🎤 Live Transcription
Real-time speech-to-text powered by Chrome's built-in AI, with speaker identification and automatic formatting.

### 🌍 Multi-language Translation
Translate transcripts into 100+ languages on-the-fly, all processed locally for maximum privacy.

### 🤖 AI Summarization
Get intelligent summaries, key points, and action items extracted automatically from your meetings.

### 📝 Smart Notes
Auto-formatted meeting notes with contextual understanding and intelligent organization.

### 📤 One-Click Export
Export to PDF, Google Docs, Markdown, JSON, or plain text with customizable templates.

### 🔒 Privacy First
All AI processing happens locally using Chrome's built-in APIs. Your data stays on your device, always.

### 💰 Completely Free
No subscriptions, no trials, no credit cards. Free forever with unlimited meetings and transcriptions.

---

## 🏗️ Architecture Overview

### Extension Structure
```
linka-extension/
├── manifest.json              # Extension configuration
├── popup/                     # Extension popup UI
│   ├── index.html
│   ├── dashboard.jsx         # Page 1: Main Dashboard
│   ├── live-meeting.jsx      # Page 2: Live Meeting Interface
│   ├── ai-processing.jsx     # Page 3: AI Processing Center
│   ├── archive.jsx           # Page 4: Meeting Archive & Search
│   ├── export.jsx            # Page 5: Export & Sharing Hub
│   └── settings.jsx          # Page 6: Settings & Configuration
├── background/               # Service worker
│   ├── service-worker.js
│   └── ai-service.js         # Chrome AI API integration
├── content/                  # Content scripts
│   ├── meeting-capture.js
│   └── transcript-processor.js
├── styles/
│   ├── variables.css         # Design system variables
│   ├── components.css
│   └── tailwind.config.js
├── utils/
│   ├── indexeddb.js         # Local storage management
│   ├── chrome-ai.js         # AI API wrapper
│   └── export-service.js    # Export handlers
└── assets/
    ├── icons/
    ├── fonts/
    └── images/
```

---

## 🎨 Design System

### Color Palette

#### Primary Colors
```css
/* Main Brand Color - Calm Blue */
--primary-50: #EFF6FF;   /* Lightest blue background */
--primary-100: #DBEAFE;  /* Light blue accents */
--primary-500: #3B82F6;  /* Main blue - CTAs, links */
--primary-600: #2563EB;  /* Hover states */
--primary-700: #1D4ED8;  /* Active states */
```

#### Secondary Colors
```css
/* Soft Purple (AI/Tech feel) */
--secondary-50: #FAF5FF;   /* Lightest purple */
--secondary-100: #F3E8FF;  /* Light purple highlights */
--secondary-500: #A855F7;  /* Accent purple */
--secondary-600: #9333EA;  /* Hover purple */
```

#### Neutral Colors
```css
/* Backgrounds & Text */
--white: #FFFFFF;        /* Main background */
--gray-50: #F9FAFB;     /* Section backgrounds */
--gray-100: #F3F4F6;    /* Card backgrounds */
--gray-200: #E5E7EB;    /* Borders, dividers */
--gray-400: #9CA3AF;    /* Secondary text */
--gray-600: #4B5563;    /* Body text */
--gray-900: #111827;    /* Headings, primary text */
```

#### Semantic Colors
```css
/* Success/Features */
--success-500: #10B981;  /* Green for positive features */
--success-100: #D1FAE5;  /* Light green backgrounds */

/* Warning/Attention */
--warning-500: #F59E0B;  /* Orange for highlights */
--warning-100: #FEF3C7;  /* Light orange backgrounds */

/* Info */
--info-500: #06B6D4;     /* Cyan for informational */
--info-100: #CFFAFE;     /* Light cyan backgrounds */
```

### Typography

```css
/* Font Stack */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

/* Font Sizes (Tailwind Scale) */
--text-xs: 0.75rem;    /* 12px - Small labels */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Section titles */
--text-2xl: 1.5rem;    /* 24px - Page titles */
--text-3xl: 1.875rem;  /* 30px - Hero subheading */
--text-4xl: 2.25rem;   /* 36px - Hero heading (mobile) */
--text-5xl: 3rem;      /* 48px - Hero heading (desktop) */

/* Font Weights */
--font-normal: 400;    /* Body text */
--font-medium: 500;    /* Emphasis */
--font-semibold: 600;  /* Subheadings */
--font-bold: 700;      /* Headings */
```

### Spacing System (8px Grid)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

---

## 📄 Page Features Breakdown

### Page 0: Landing Page
**Purpose:** Convert visitors into users with clear value proposition

**Features:**
- Hero section with "Never Miss a Meeting Detail Again" messaging
- Feature showcase (6 cards: Live Transcription, Translation, Summarization, Smart Notes, Export, Privacy)
- How It Works (4-step visual guide)
- Demo/Screenshots section with tab interface
- Social proof testimonials
- Pricing section (Free forever)
- FAQ accordion
- Final CTA with gradient background
- Footer with product links

**Tech Stack:** HTML, CSS (Tailwind), Vanilla JS
**Design:** Light, clean, minimalist with blue/purple gradient accents

---

### Page 1: Main Dashboard
**Purpose:** Central hub for managing meetings and accessing features

**Features:**
- Live meeting status indicator
- Quick action buttons (Start Recording, Summarize, Translate, Export)
- Recent meetings list (last 10 with timestamps)
- Meeting statistics dashboard
- AI Pipeline status monitor
- Quick settings access

**Tech Stack:** React + TailwindCSS
**Storage:** IndexedDB for meeting data
**Real-time:** Chrome extension messaging API

---

### Page 2: Live Meeting Interface
**Purpose:** Real-time transcript capture during active meetings

**Features:**
- Live scrollable transcript display
- Speaker identification
- Recording controls (Start/Stop/Pause)
- Real-time AI processing (summarization, key points, action items)
- Manual quick note addition
- Meeting duration timer
- Export current session without stopping

**Tech Stack:** React + Chrome Speech Recognition API
**AI:** Chrome Gemini Nano for real-time processing
**Auto-save:** Every 30 seconds to IndexedDB

---

### Page 3: AI Processing Center
**Purpose:** Configure and manage AI-powered features

**Features:**
- AI pipeline configuration (summarizer, translator, proofreader, rewriter, writer)
- Processing queue visualization
- AI model selection interface
- Batch processing for multiple meetings
- Custom prompt creation and storage
- Processing history tracker

**Tech Stack:** React + Chrome's Gemini Nano APIs
**Storage:** Custom prompts in IndexedDB
**Queue:** Task queue management system

---

### Page 4: Meeting Archive & Search
**Purpose:** Browse, search, and manage historical meetings

**Features:**
- Paginated meeting browser
- Advanced search (full-text, date range, duration, participants)
- Expandable meeting detail cards
- Bulk operations (export, delete, AI processing)
- Custom tagging system
- Favorites/bookmarking

**Tech Stack:** React + Virtualized lists for performance
**Search:** IndexedDB full-text search indexing
**Export:** Multiple formats (PDF, JSON, TXT, Markdown)

---

### Page 5: Export & Sharing Hub
**Purpose:** Handle all export formats and sharing

**Features:**
- Multi-format export (PDF, Google Docs, TXT, JSON, Markdown)
- Pre-designed export templates
- Custom export builder (sections, headers, footers, branding)
- Direct email integration
- Cloud storage uploads (Google Drive)
- Export history tracking
- Batch export functionality

**Tech Stack:** React + PDF.js + Google APIs
**Cloud:** Google Drive API integration
**Templates:** Custom template engine

---

### Page 6: Settings & Configuration
**Purpose:** Manage preferences, privacy, and account

**Features:**
- Privacy controls (data retention, encryption, auto-delete)
- Extension preferences (AI defaults, notifications, shortcuts, theme)
- Account management (cloud sync, usage stats)
- Advanced settings (API config, debug mode, performance)
- Help & support section
- Settings backup/restore

**Tech Stack:** React + Chrome Storage API
**Auth:** Supabase/Firebase for cloud sync (optional)
**Validation:** Real-time settings validation

---

## 🔧 Coding Standards

### React Component Structure
```jsx
// Component template
import React, { useState, useEffect } from 'react';
import { chromeAI } from '@/utils/chrome-ai';
import { db } from '@/utils/indexeddb';

const ComponentName = () => {
  // State declarations
  const [data, setData] = useState(null);
  
  // Effects
  useEffect(() => {
    // Setup and cleanup
  }, []);
  
  // Handlers
  const handleAction = async () => {
    try {
      // Action logic
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  // Render
  return (
    <div className="p-6 bg-gray-50">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

### Tailwind CSS Usage
- Use **only core utility classes** (no custom classes requiring compilation)
- Follow mobile-first responsive design
- Maintain 8px spacing grid
- Use design system color variables

```jsx
// Good: Core Tailwind classes
<button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
  Click Me
</button>

// Avoid: Custom classes or @apply directives
<button className="custom-button">Click Me</button>
```

### Chrome AI Integration
```javascript
// AI Service wrapper
export const chromeAI = {
  async summarize(text, options = {}) {
    if (!window.ai?.summarizer) {
      throw new Error('Chrome AI not available');
    }
    
    const summarizer = await window.ai.summarizer.create(options);
    return await summarizer.summarize(text);
  },
  
  async translate(text, targetLang) {
    if (!window.ai?.translator) {
      throw new Error('Chrome Translator not available');
    }
    
    const translator = await window.ai.translator.create({
      sourceLanguage: 'en',
      targetLanguage: targetLang
    });
    return await translator.translate(text);
  }
};
```

### IndexedDB Pattern
```javascript
// Database service
export const db = {
  async saveMeeting(meetingData) {
    const db = await openDB('linka-meetings', 1);
    return await db.add('meetings', {
      ...meetingData,
      timestamp: Date.now()
    });
  },
  
  async getMeetings(limit = 10) {
    const db = await openDB('linka-meetings', 1);
    return await db.getAll('meetings', limit);
  },
  
  async searchTranscripts(query) {
    const db = await openDB('linka-meetings', 1);
    const meetings = await db.getAll('meetings');
    return meetings.filter(m => 
      m.transcript.toLowerCase().includes(query.toLowerCase())
    );
  }
};
```

---

## 🚀 Getting Started

### Prerequisites
- Chrome Browser v128+ (with built-in AI APIs enabled)
- Node.js v18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/engineers-network/linka-ai-notetaker.git
cd linka-ai-notetaker
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the extension**
```bash
npm run build
```

4. **Load in Chrome**
- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode" (top right)
- Click "Load unpacked"
- Select the `build` directory

### Development Mode

```bash
npm run dev
```

This starts the development server with hot reload.

---

## 🏗️ Chrome Extension Build Guide

### Manifest Configuration
```json
{
  "manifest_version": 3,
  "name": "Linka - AI Meetings Notetaker",
  "version": "1.0.0",
  "description": "Privacy-first AI meeting notes with real-time transcription and translation",
  "permissions": [
    "activeTab",
    "storage",
    "tabCapture",
    "offscreen"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "action": {
    "default_popup": "popup/index.html",
    "default_icon": {
      "16": "assets/icons/icon-16.png",
      "48": "assets/icons/icon-48.png",
      "128": "assets/icons/icon-128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/meeting-capture.js"]
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["assets/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### Build Steps

1. **Development Build**
```bash
npm run build:dev
```
- Unminified code
- Source maps enabled
- Hot reload active

2. **Production Build**
```bash
npm run build:prod
```
- Minified and optimized
- Source maps removed
- Performance optimized

3. **Create Release Package**
```bash
npm run package
```
Creates `linka-v1.0.0.zip` ready for Chrome Web Store submission.

---

## 📊 Performance Targets

- Initial load: < 200ms
- AI processing: < 2s for 1000 words
- Search query: < 100ms
- Export generation: < 3s for 10,000 words
- Lighthouse score: 95+

---

## 🔒 Privacy & Security

### Data Storage
- All meeting data stored locally in IndexedDB
- No external API calls for AI processing
- Optional cloud sync with end-to-end encryption

### Chrome AI APIs Used
- `window.ai.summarizer` - Local summarization
- `window.ai.translator` - Local translation
- `window.ai.languageModel` - Local language processing
- Speech Recognition API - Local transcription

### No Data Collection
- No analytics tracking
- No telemetry
- No cloud uploads (unless explicitly enabled)
- No third-party scripts

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow coding standards
4. Write tests for new features
5. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with Chrome's built-in AI APIs (Gemini Nano)
- Design inspired by modern productivity tools
- Icons by [Lucide](https://lucide.dev)
- Fonts: Inter by Rasmus Andersson

---

## 📞 Support

- 📧 Email: support@engineers-network.com
- 🐛 Issues: [GitHub Issues](https://github.com/engineers-network/linka-ai-notetaker/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/engineers-network/linka-ai-notetaker/discussions)
- 📚 Documentation: [docs.linka.app](https://docs.linka.app)

---

## 🗺️ Roadmap

### v1.1 (Q4 2025)
- [ ] Offline mode improvements
- [ ] More export templates
- [ ] Calendar integration
- [ ] Team collaboration features

### v1.2 (Q1 2026)
- [ ] Mobile app companion
- [ ] Advanced AI customization
- [ ] Meeting analytics dashboard
- [ ] API for third-party integrations

---

**Made with ❤️ by The Engineer's Network AI Team**

*Building privacy-first tools that respect your data and empower your productivity.*
