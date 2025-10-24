"use client";

import { ExportFormatSelector } from "./components/ExportFormatSelector";
import { PDFOptionsPanel } from "./components/PDFOptionsPanel";
import { ExportBuilderPanel } from "./components/ExportBuilderPanel";
import { TemplateGallery } from "./components/TemplateGallery";
import { SharingPanel } from "./components/SharingPanel";
import { ExportHistoryList } from "./components/ExportHistoryList";
import { BatchExportPanel } from "./components/BatchExportPanel";
import { ExportProgressModal } from "./components/ExportProgressModal";
import { ExportProvider } from "./context/ExportContext";
import { useEffect } from "react";

/**
 * Export & Sharing Hub Page
 * --------------------------
 * This page is designed for:
 * - Selecting export formats (PDF, DOCX, TXT, etc.)
 * - Customizing layouts, templates, and branding
 * - Sharing exports via email/cloud/links
 * - Viewing export history and batch operations
 * 
 * Fully supports:
 * - Dark/Light themes
 * - 320px popup mode for Chrome extension
 * - Context-based state management
 */




export default function ExportPage() {

     // Optional: auto-apply dark mode based on user preference
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  }, []);

    return (
        <ExportProvider>
      <main className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 min-h-screen transition-colors duration-300 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto narrow-view pt-24">
        {/* Breadcrumb Header */}
        <header className="mb-6">
          <nav className="flex items-center space-x-2 text-sm mb-2 text-gray-500 dark:text-gray-400">
            <a href="/dashboard" className="hover:text-blue-500">Dashboard</a>
            <span>{">"}</span>
            <span>Export & Sharing Hub</span>
          </nav>
          <h1 className="text-2xl font-semibold">Export & Sharing Hub</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage export formats, templates, and sharing options.
          </p>
        </header>

        {/* Main Layout: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Main Configuration Panels) */}
          <section className="lg:col-span-2 space-y-6">
            <ExportFormatSelector />
            <PDFOptionsPanel />
            <ExportBuilderPanel />
            <TemplateGallery />
          </section>

          {/* Right Column (Sharing, History, Batch) */}
          <aside className="lg:col-span-1 space-y-6">
            <SharingPanel />
            <ExportHistoryList />
            <BatchExportPanel />
          </aside>
        </div>

        {/* Modal (progress feedback, always mounted for access) */}
        <div className="mt-8 flex justify-center">
          <ExportProgressModal />
        </div>
      </main>
    </ExportProvider>
    )
}