"use client";
import { useExport } from "../context/ExportContext";

export const ExportBuilderPanel = () => {
  const { exportSettings } = useExport();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
      <h2 className="text-xl font-semibold mb-4">Custom Export Builder</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Header</label>
          <input
            type="text"
            placeholder="Enter header text"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Footer</label>
          <input
            type="text"
            placeholder="Enter footer text"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Logo Uploader</label>
        <input
          type="file"
          accept="image/*"
          className="w-full text-sm border border-gray-300 dark:border-gray-600 p-2 rounded-lg"
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          Preview Export
        </button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition">
          Save Template
        </button>
      </div>
    </div>
  );
};
