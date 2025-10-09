interface SensitivitySliderProps {
    value: number;
    onChange: (value: number) => void;
}

export function SensitivitySlider({ value, onChange }: SensitivitySliderProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sensitivity Level
            </label>
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">Low</span>
                <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">High</span>
            </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                {value}/10
            </div>
        </div>
    );
}