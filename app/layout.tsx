import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { BackendInitializer } from "@/components/BackendInitializer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Linka - AI Meetings Notetaker",
  description:
    "Never miss a meeting detail again. Privacy-first AI meeting transcription, translation, summarization, and smart notes. Chrome extension for seamless productivity.",
  keywords:
    "AI meetings, transcription, translation, summarization, smart notes, privacy-first, Chrome extension",
  authors: [{ name: "The Engineer's Network AI Team" }],
  openGraph: {
    title: "Linka - AI Meetings Notetaker",
    description:
      "Never miss a meeting detail again. Privacy-first AI meeting transcription, translation, summarization, and smart notes.",
    url: "https://linka-ai.com",
    siteName: "Linka",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Linka - AI Meetings Notetaker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Linka - AI Meetings Notetaker",
    description:
      "Never miss a meeting detail again. Privacy-first AI meeting transcription, translation, summarization, and smart notes.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-white text-gray-900`}
      >
        <ErrorBoundary>
          <BackendInitializer>
            <ClientLayout>{children}</ClientLayout>
          </BackendInitializer>
        </ErrorBoundary>
      </body>
    </html>
  );
}
