"use client"
import { useState } from 'react';
import { PromptsList } from './PromptsList';

interface Prompt {
    id: string;
    name: string;
}

export function CustomPromptsManager() {
    const [prompts, setPrompts] = useState<Prompt[]>([
        { id: '1', name: 'Meeting Summary Prompt' },
        { id: '2', name: 'Action Items Extractor' },
        { id: '3', name: 'Key Decisions Logger' },
    ]);

    const handleEdit = (id: string) => {
        // Open edit modal
        alert(`Edit prompt ${id}`);
    };

    const handleDelete = (id: string) => {
        setPrompts(prompts.filter(p => p.id !== id));
    };

    const handleTest = (id: string) => {
        // Test the prompt
        alert(`Test prompt ${id}`);
    };

    const handleAddNew = () => {
        // Open add modal
        alert('Add new prompt');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Custom Prompts</h3>
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                >
                    Add New Prompt
                </button>
            </div>
            <PromptsList
                prompts={prompts}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTest={handleTest}
            />
        </div>
    );
}