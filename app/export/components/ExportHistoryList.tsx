"use client";
import { Download, Trash2 } from "lucide-react";

const mockHistory = [
  {
    id: 1,
    name: "Meeting 1 Summary",
    format: "PDF",
    size: "5.2 MB",
  },
  {
    id: 2,
    name: "Weekly Standup Transcript",
    format: "Plain Text",
    size: "0.5 MB",
  },
];

export const ExportHistoryList = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
      <h2 className="text-xl font-semibold mb-4">Export History</h2>

      <div className="space-y-3 text-sm">
        {mockHistory.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2"
          >
            <div>
              <p className="font-medium truncate">{item.name}</p>
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {item.format}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {item.size}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="text-red-500 text-sm mt-4 hover:text-red-700 dark:hover:text-red-300 transition">
        Clear History
      </button>
    </div>
  );
};
