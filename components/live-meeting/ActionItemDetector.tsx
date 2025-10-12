import React from 'react';

interface ActionItem {
  id: string;
  text: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface ActionItemDetectorProps {
  actionItems: ActionItem[];
  className?: string;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const ActionItemDetector: React.FC<ActionItemDetectorProps> = ({
  actionItems,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Action Items</h4>
      {actionItems.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No action items detected yet...</p>
      ) : (
        <div className="space-y-3">
          {actionItems.map((item) => (
            <div key={item.id} className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-1">{item.text}</p>
                  <div className="flex items-center space-x-2">
                    {item.assignedTo && (
                      <span className="text-xs text-gray-600">
                        Assigned to: {item.assignedTo}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{item.timestamp}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(item.priority)}`}
                >
                  {item.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};