"use client";
import { Send, HardDrive, Box, Copy } from "lucide-react";

export const SharingPanel = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
      <h2 className="text-xl font-semibold mb-4">Sharing Options</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email Share</label>
        <div className="flex space-x-2">
          <input
            type="email"
            placeholder="Enter email address"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm"
          />
          <button
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <p className="text-sm font-medium mb-2">Save to Cloud:</p>
      <div className="flex space-x-3 mb-4">
        <button
          className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          title="Google Drive"
        >
          <HardDrive className="w-5 h-5 text-yellow-600" />
        </button>
        <button
          className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          title="Dropbox"
        >
          <Box className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      <label className="flex items-center justify-between text-sm mb-2">
        <span>Shareable Link Generator</span>
        <input type="checkbox" className="peer sr-only" />
        <div className="relative w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-green-500 after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-4"></div>
      </label>

      <div className="flex space-x-2">
        <input
          type="text"
          value="https://app.link/export-j34k"
          readOnly
          className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-xs truncate"
        />
        <button
          className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
          title="Copy Link"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
