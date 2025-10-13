interface AutoTranslateToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

export function AutoTranslateToggle({ enabled, onChange }: AutoTranslateToggleProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto Translate
            </label>
            <div className="flex items-center">
                <button
                    type="button"
                    onClick={() => onChange(!enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    {enabled ? 'Enabled' : 'Disabled'}
                </span>
            </div>
        </div>
    );
}