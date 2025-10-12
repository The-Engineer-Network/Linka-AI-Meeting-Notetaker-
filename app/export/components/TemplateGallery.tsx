"use client"

import Image from "next/image";
import { useExport } from "../context/ExportContext";
import { Image as ImageIcon, PlusCircle } from "lucide-react";

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "A sleek and contemporary design.",
    thumbnail: "/templates/modern.png",
  },
  {
    id: "classic",
    name: "Classic",
    description: "A timeless and elegant layout.",
    thumbnail: "/templates/classic.png",
  },
  {
    id: "compact",
    name: "Compact",
    description: "A vibrant and artistic style.",
    thumbnail: "/templates/compact.png",
  },
];

export function TemplateGallery() {
  const { exportSettings, setExportSettings } = useExport();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
      <h2 className="text-xl font-semibold mb-4">Template Gallery</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-3 rounded-lg border-2 transition cursor-pointer ${
              exportSettings.template === template.id
                ? "border-blue-500"
                : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
            }`}
            onClick={() =>
              setExportSettings((prev: any) => ({
                ...prev,
                template: template.id,
              }))
            }
          >
            {/* image preview container */}
            <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                {/* background Thumbnail with blur placeholder */}
                <Image
                  src={template.thumbnail}
                  alt={template.name}
                  layout="fill"
                  className="object-cover opaity-40"
                  placeholder="blur"
                 blurDataURL="/placeholder.png"
                 sizes="(max-width: 400px) 100vw, 50vw"
                />

                {/* Overlay fallback Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                </div>
            </div>
            {/* text section */}
            <h3 className="font-medium text-sm">{template.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {template.description}
            </p>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full flex item-center justify-center gap-2 text-sm font-medium 
      px-4 py-2 border border-dashed border-gray-400 rounded-lg
       hover:bg-gray-100 dark:hover:bg-gray-700 transition">
        <PlusCircle className="w-4 h-4" /> Create Custom Template
      </button>
    </div>
  );
}