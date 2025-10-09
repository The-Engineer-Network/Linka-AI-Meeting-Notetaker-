import { PromptCard } from './PromptCard';

interface Prompt {
    id: string;
    name: string;
}

interface PromptsListProps {
    prompts: Prompt[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onTest: (id: string) => void;
}

export function PromptsList({ prompts, onEdit, onDelete, onTest }: PromptsListProps) {
    return (
        <div className="space-y-3">
            {prompts.map((prompt) => (
                <PromptCard
                    key={prompt.id}
                    id={prompt.id}
                    name={prompt.name}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onTest={onTest}
                />
            ))}
        </div>
    );
}