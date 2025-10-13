"use client"
import Link from 'next/link';
import { AIPipelineHeader } from './components/AIPipelineHeader';
import { ConfigurationTabs } from './components/ConfigurationTabs';
import { SummarizerConfigPanel } from './components/SummarizerConfigPanel';
import { TranslationConfigPanel } from './components/TranslationConfigPanel';
import { ProofreaderConfigPanel } from './components/ProofreaderConfigPanel';
import { RewriterConfigPanel } from './components/RewriterConfigPanel';
import { WriterConfigPanel } from './components/WriterConfigPanel';
import { ProcessingQueuePanel } from './components/ProcessingQueuePanel';
import { AIModelSelector } from './components/AIModelSelector';
import { BatchProcessingPanel } from './components/BatchProcessingPanel';
import { CustomPromptsManager } from './components/CustomPromptsManager';
import { ProcessingHistoryPanel } from './components/ProcessingHistoryPanel';
import { useState } from 'react';

export default function AIProcessingPage() {
    const [activeTab, setActiveTab] = useState('summarizer');

    const renderConfigPanel = () => {
        switch (activeTab) {
            case 'summarizer':
                return <SummarizerConfigPanel />;
            case 'translation':
                return <TranslationConfigPanel />;
            case 'proofreader':
                return <ProofreaderConfigPanel />;
            case 'rewriter':
                return <RewriterConfigPanel />;
            case 'writer':
                return <WriterConfigPanel />;
            default:
                return <SummarizerConfigPanel />;
        }
    };

    return (
        <main className='bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-400
        min-h-screen transition-colors duration-300 p-4 sm:p-6 lg:p-8 mx-auto' >
            <header className="mb-6">
                <nav className="flex items-center space-x-2 text-sm mb-2 mt-4 text-gray-500 dark:text-gray-400">
                    <Link href="/" className='hover:text-blue-500'>Dashboard</Link>
                    <span>{">"}</span>
                    <span>AI Processing Center</span>
                </nav>
            </header>

            <AIPipelineHeader />

            <div className="space-y-6">
                {/* Configuration Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Configuration</h2>
                    <ConfigurationTabs activeTab={activeTab} onTabChange={setActiveTab} />
                    <div className="mt-4">
                        {renderConfigPanel()}
                    </div>
                </section>

                {/* Processing Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Processing</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ProcessingQueuePanel />
                        <AIModelSelector />
                    </div>
                </section>

                {/* Batch Processing Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Batch Processing</h2>
                    <BatchProcessingPanel />
                </section>

                {/* Management Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Management</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CustomPromptsManager />
                        <ProcessingHistoryPanel />
                    </div>
                </section>
            </div>
        </main>
    )
}