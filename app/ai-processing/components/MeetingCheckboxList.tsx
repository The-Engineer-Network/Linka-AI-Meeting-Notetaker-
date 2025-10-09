interface MeetingCheckboxListProps {
    selectedMeetings: string[];
    onChange: (meetings: string[]) => void;
}

const meetings = [
    { id: '1', name: 'Team Standup - 2024-01-15', duration: '30 min' },
    { id: '2', name: 'Client Presentation Review', duration: '45 min' },
    { id: '3', name: 'Product Planning Session', duration: '60 min' },
    { id: '4', name: 'Bug Triage Meeting', duration: '25 min' },
    { id: '5', name: 'Sprint Retrospective', duration: '40 min' },
];

export function MeetingCheckboxList({ selectedMeetings, onChange }: MeetingCheckboxListProps) {
    const handleChange = (meetingId: string, checked: boolean) => {
        if (checked) {
            onChange([...selectedMeetings, meetingId]);
        } else {
            onChange(selectedMeetings.filter(id => id !== meetingId));
        }
    };

    return (
        <div className="space-y-2 max-h-60 overflow-y-auto">
            {meetings.map((meeting) => (
                <label key={meeting.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <input
                        type="checkbox"
                        checked={selectedMeetings.includes(meeting.id)}
                        onChange={(e) => handleChange(meeting.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{meeting.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{meeting.duration}</div>
                    </div>
                </label>
            ))}
        </div>
    );
}