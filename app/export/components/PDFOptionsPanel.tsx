"use client";
import { useExport } from "../context/ExportContext";

export function PDFOptionsPanel() {
  const { exportSettings, setExportSettings } = useExport();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
      <h2 className="text-xl font-semibold mb-4">Export Options</h2>

      <div className="space-y-2 mb-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={exportSettings.includeTranscript}
            onChange={() =>
              setExportSettings((prev: any) => ({
                ...prev,
                includeTranscript: !prev.includeTranscript,
              }))
            }
            className="form-checkbox text-blue-600 rounded-sm"
          />
          <span>Include Transcript</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={exportSettings.includeSummary}
            onChange={() =>
              setExportSettings((prev: any) => ({
                ...prev,
                includeSummary: !prev.includeSummary,
              }))
            }
            className="form-checkbox text-blue-600 rounded-sm"
          />
          <span>Include Summary</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={exportSettings.includeActions}
            onChange={() =>
              setExportSettings((prev: any) => ({
                ...prev,
                includeActions: !prev.includeActions,
              }))
            }
            className="form-checkbox text-blue-600 rounded-sm"
          />
          <span>Include Action Items</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Layout Selector
          </label>
          <select
            value={exportSettings.layout}
            onChange={(e) =>
              setExportSettings((prev: any) => ({
                ...prev,
                layout: e.target.value,
              }))
            }
            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg"
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>

        <div className="flex items-center pt-5">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={exportSettings.includeTimestamps}
              onChange={() =>
                setExportSettings((prev: any) => ({
                  ...prev,
                  includeTimestamps: !prev.includeTimestamps,
                }))
              }
              className="form-checkbox text-blue-600 rounded-sm"
            />
            <span>Include Timestamps</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Preview
        </button>
        <button
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Finalize Export
        </button>
      </div>
    </div>
  );
}