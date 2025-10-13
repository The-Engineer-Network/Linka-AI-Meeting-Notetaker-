interface ConfigurationTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const tabs = [
    { id: 'summarizer', label: 'Summarizer' },
    { id: 'translation', label: 'Translation' },
    { id: 'proofreader', label: 'Proofreader' },
    { id: 'rewriter', label: 'Rewriter' },
    { id: 'writer', label: 'Writer' },
];

export function ConfigurationTabs({ activeTab, onTabChange }: ConfigurationTabsProps) {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="space-x-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}