"use client";
import { useExport } from "../context/ExportContext";
import { FileText, Loader } from "lucide-react";
import { useState } from "react";

const mockMeetings = [
  { id: 1, name: "Design Sync Meeting" },
  { id: 2, name: "Client Review Session" },
  { id: 3, name: "Team Standup" },
];

export const BatchExportPanel = () => {
  const { exportSettings } = useExport();
  const [selected, setSelected] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleExportAll = () => {
    setIsExporting(true);
    setProgress(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 10;
      setProgress(step);
      if (step >= 100) {
        clearInterval(interval);
        setIsExporting(false);
      }
    }, 300);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
      <h2 className="text-xl font-semibold mb-4">Batch Export</h2>

      <div className="space-y-2 mb-4">
        {mockMeetings.map((meeting) => (
          <label
            key={meeting.id}
            className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-700 pb-1"
          >
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selected.includes(meeting.id)}
                onChange={() => toggleSelect(meeting.id)}
                className="form-checkbox text-blue-600"
              />
              <span>{meeting.name}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <select
          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg"
          defaultValue={exportSettings.format}
        >
          <option value="pdf">PDF</option>
          <option value="text">Plain Text</option>
          <option value="json">JSON</option>
        </select>
        <button
          onClick={handleExportAll}
          disabled={isExporting || selected.length === 0}
          className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition ${
            isExporting
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isExporting ? (
            <span className="flex items-center gap-1">
              <Loader className="w-4 h-4 animate-spin" /> Exporting...
            </span>
          ) : (
            "Export Selected"
          )}
        </button>
      </div>

      {isExporting && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
