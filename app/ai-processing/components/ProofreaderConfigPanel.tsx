"use client"
import { useState } from 'react';
import { SensitivitySlider } from './SensitivitySlider';
import { CorrectionTypeCheckboxes } from './CorrectionTypeCheckboxes';
import { SuggestionModeSelect } from './SuggestionModeSelect';

export function ProofreaderConfigPanel() {
    const [sensitivity, setSensitivity] = useState(5);
    const [correctionTypes, setCorrectionTypes] = useState<string[]>(['grammar', 'spelling', 'punctuation']);
    const [suggestionMode, setSuggestionMode] = useState('automatic');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Proofreader Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SensitivitySlider value={sensitivity} onChange={setSensitivity} />
                <CorrectionTypeCheckboxes selectedTypes={correctionTypes} onChange={setCorrectionTypes} />
                <SuggestionModeSelect value={suggestionMode} onChange={setSuggestionMode} />
            </div>
        </div>
    );
}