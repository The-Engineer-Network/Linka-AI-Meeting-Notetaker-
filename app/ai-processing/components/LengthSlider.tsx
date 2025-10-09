interface LengthSliderProps {
    value: number;
    onChange: (value: number) => void;
}

const lengthOptions = [
    { value: 0, label: 'Short' },
    { value: 1, label: 'Medium' },
    { value: 2, label: 'Long' },
];

export function LengthSlider({ value, onChange }: LengthSliderProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Summary Length
            </label>
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">Short</span>
                <input
                    type="range"
                    min="0"
                    max="2"
                    step="1"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">Long</span>
            </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                {lengthOptions.find(opt => opt.value === value)?.label}
            </div>
        </div>
    );
}