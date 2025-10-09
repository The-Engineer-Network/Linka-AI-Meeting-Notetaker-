"use client"
import { useState } from 'react';
import { LengthSlider } from './LengthSlider';
import { DetailLevelSelect } from './DetailLevelSelect';
import { SummaryStyleToggle } from './SummaryStyleToggle';

export function SummarizerConfigPanel() {
    const [length, setLength] = useState(1); // Medium
    const [detailLevel, setDetailLevel] = useState('detailed');
    const [style, setStyle] = useState('bullet');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Summarizer Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <LengthSlider value={length} onChange={setLength} />
                <DetailLevelSelect value={detailLevel} onChange={setDetailLevel} />
                <SummaryStyleToggle value={style} onChange={setStyle} />
            </div>
        </div>
    );
}