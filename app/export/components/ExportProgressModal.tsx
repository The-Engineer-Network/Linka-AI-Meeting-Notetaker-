"use client"
import { useExport } from "../context/ExportContext";
import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";


export const ExportProgressModal = () => {
    const { exportSettings } = useExport();
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [completed, setCompleted] = useState(false);

    const startExport = () => {
    setIsVisible(true);
    setProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setCompleted(true);
      }
    }, 400);
  };

  return (
   <>
      <button
        onClick={startExport}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
      >
        Start Export (Modal)
      </button>

      {isVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-80 p-6 text-center">
            <h3 className="text-lg font-semibold mb-3">
              Exporting as {exportSettings.format.toUpperCase()}
            </h3>

            {!completed ? (
              <>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please wait... {progress}%
                </p>
              </>
            ) : (
              <>
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-green-600 dark:text-green-400">
                  Export completed successfully!
                </p>
                <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Download File
                </button>
              </>
            )}

            <button
              onClick={() => setIsVisible(false)}
              className="mt-4 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {completed ? "Close" : "Cancel"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

