"use client"
import {ExportFormatSelector} from "./components/ExportFormatSelector";
import {PDFOptionsPanel} from './components/PDFOptionalPanel';
import {ExportBuilderPanel} from './components/ExportBuilderPanel';
import { SharingPanel } from './components/SharingPanel';
import { ExportHistoryList } from './components/ExportHistoryList';
import { ExportProvider } from './context/ExportContext';
import Link from 'next/link';




export default function ExportPage() {

    return (
        <ExportProvider>
            <main className='bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-400 
            min-h-screen transition-colors duration-300 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto' >
                <header className="mb-6">
                    <nav className="flex items-center space-x-2 text-sm mb-2 text-gray-500 dark:text-gray-400">
                        <Link href="#" className='hover:text-blue-500'>Dashboard</Link>
                        <span>{">"}</span>
                        <span>Export & Sharing Hub</span>
                    </nav>
                    <h1 className="text-2xl font-semibold">Export & Sharing Hub</h1>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-2 space-y-6">
                        <ExportFormatSelector />
                        <PDFOptionsPanel />
                        <ExportBuilderPanel />
                    </section>

                    <aside className="lg:col-span-1 space-y-6">
                        <SharingPanel />
                        <ExportHistoryList />
                    </aside>
                </div>
            </main>
        </ExportProvider>
    )
}