interface AIPipelineHeaderProps {
    title?: string;
    description?: string;
}

export function AIPipelineHeader({
    title = "AI Processing Center",
    description = "Configure and manage your AI-powered meeting processing pipeline"
}: AIPipelineHeaderProps) {
    return (
        <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
        </div>
    );
}