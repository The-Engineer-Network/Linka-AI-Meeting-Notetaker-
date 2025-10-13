"use client"
import { useState } from 'react';
import { ModelCards } from './ModelCards';

export function AIModelSelector() {
    const [selectedModel, setSelectedModel] = useState('gpt-4');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">AI Model Selection</h3>
            <ModelCards selectedModel={selectedModel} onChange={setSelectedModel} />
        </div>
    );
}