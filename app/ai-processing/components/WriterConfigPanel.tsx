"use client"
import { useState } from 'react';
import { CustomPromptTextarea } from './CustomPromptTextarea';
import { PromptTemplateSelector } from './PromptTemplateSelector';
import { SavedPromptsDropdown } from './SavedPromptsDropdown';

export function WriterConfigPanel() {
    const [customPrompt, setCustomPrompt] = useState('');
    const [template, setTemplate] = useState('custom');
    const [savedPrompt, setSavedPrompt] = useState('');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Writer Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CustomPromptTextarea value={customPrompt} onChange={setCustomPrompt} />
                <PromptTemplateSelector value={template} onChange={setTemplate} />
                <SavedPromptsDropdown value={savedPrompt} onChange={setSavedPrompt} />
            </div>
        </div>
    );
}