"use client"
import { useState } from 'react';
import { LanguageMultiSelect } from './LanguageMultiSelect';
import { AutoTranslateToggle } from './AutoTranslateToggle';
import { TranslationQualitySelect } from './TranslationQualitySelect';

export function TranslationConfigPanel() {
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [autoTranslate, setAutoTranslate] = useState(false);
    const [quality, setQuality] = useState('standard');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Translation Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <LanguageMultiSelect selectedLanguages={selectedLanguages} onChange={setSelectedLanguages} />
                <AutoTranslateToggle enabled={autoTranslate} onChange={setAutoTranslate} />
                <TranslationQualitySelect value={quality} onChange={setQuality} />
            </div>
        </div>
    );
}