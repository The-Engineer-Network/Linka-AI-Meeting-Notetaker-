"use client"
import React from 'react'
import  { createContext, useContext, useState, ReactNode } from "react";

type ExportState = {
    format: string;
    includeTranscript: boolean;
    includeSummary: boolean;
    includeActions: boolean;
    layout: "portrait" | "landscape";
};

const ExportContext = createContext<any>(null);

export const ExportProvider = ({ children }: {children: ReactNode}) => {
    const [exportSettings, setExportSettings] = useState<ExportState>({
        format: "pdf",
        includeTranscript: true,
        includeSummary: true,
        includeActions: false,
        layout: "portrait",
    });

    return (
        <ExportContext.Provider value={{ exportSettings, setExportSettings}}>
            {children}
        </ExportContext.Provider>
    )
}

export const useExport = () => useContext(ExportContext);
