"use client";
import {useExport } from "../context/ExportContext";
import {FileText, Code, AlignLeft, Hash, Icon } from "lucide-react";


export function ExportFormatSelector() {
    const {exportSettings, setExportSettings} = useExport();

    const formats = [
        {id: "pdf", label: "PDF", icon: FileText, color: "text-blue-600" },
        {id: "docs", label: "Google Docs", icon: FileText, color: "text-gray-600" },
        {id: "text", label: "Plain Text", icon: AlignLeft, color: "text-gray-500" },
        {id: "json", label: "JSON", icon: Code, color: "text-purple-600" },
        {id: "markdown", label: "Markdown", icon: Hash, color: "text-yellow-600" },
    ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
  <h2 className="text-xl font-semibold mb-4">Export Format Selector</h2>
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
    {formats.map(({ id, label, icon: Icon, color }) => (
      <label
        key={id}
        className={`cursor-pointer border-2 p-3 rounded-lg transition ${
          exportSettings.format === id
            ? "border-blue-500"
            : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
        }`}
      >
        <input
          type="radio"
          name="format"
          value={id}
          checked={exportSettings.format === id}
          onChange={() => setExportSettings((prev: any) => ({ ...prev, format: id }))}
          className="hidden"
        />
          <Icon className={`w-6 h-6 ${color} mb-1`} />
          <span>{label}</span>
      </label>
    ))}
  </div>
</div>
  )
}


