"use client"
import { useState } from 'react';
import { ToneSelector } from './ToneSelector';
import { StylePresetCards } from './StylePresetCards';
import { CustomToneInput } from './CustomToneInput';

export function RewriterConfigPanel() {
    const [tone, setTone] = useState('professional');
    const [preset, setPreset] = useState('business');
    const [customTone, setCustomTone] = useState('');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Rewriter Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ToneSelector value={tone} onChange={setTone} />
                <StylePresetCards selectedPreset={preset} onChange={setPreset} />
                <CustomToneInput value={customTone} onChange={setCustomTone} />
            </div>
        </div>
    );
}