// lib/export/manager.ts

import { meetingsRepository, settingsRepository } from '../database';
import { pdfGenerator, PDFOptions, PDFGenerationResult } from './pdf-generator';
import { docxGenerator, DOCXOptions, DOCXGenerationResult } from './docx-generator';
import { textGenerator, TextOptions, TextGenerationResult } from './text-generator';

export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'md' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  includeTranscript?: boolean;
  includeSummary?: boolean;
  includeKeyPoints?: boolean;
  includeActionItems?: boolean;
  includeMetadata?: boolean;
  template?: 'professional' | 'minimal' | 'detailed';
  branding?: {
    logo?: string;
    companyName?: string;
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  size: number;
  format: ExportFormat;
  processingTime: number;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
  };
}

export interface ExportProgress {
  stage: 'preparing' | 'generating' | 'finalizing' | 'complete';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number;
}

export class ExportManager {
  private progressCallbacks: Set<(progress: ExportProgress) => void> = new Set();

  /**
   * Export meeting data in specified format
   */
  async exportMeeting(
    meetingId: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    const startTime = Date.now();

    try {
      this.updateProgress({
        stage: 'preparing',
        progress: 10,
        message: 'Preparing meeting data...',
      });

      // Validate meeting exists
      const meeting = await meetingsRepository.getById(meetingId);
      if (!meeting) {
        throw new Error(`Meeting ${meetingId} not found`);
      }

      this.updateProgress({
        stage: 'generating',
        progress: 30,
        message: `Generating ${options.format.toUpperCase()} file...`,
      });

      let result: ExportResult;

      switch (options.format) {
        case 'pdf':
          const pdfResult = await pdfGenerator.generateMeetingPDF(meetingId, options as PDFOptions);
          result = {
            blob: pdfResult.blob,
            filename: pdfResult.filename,
            size: pdfResult.size,
            format: 'pdf',
            processingTime: pdfResult.processingTime,
            metadata: {
              pageCount: pdfResult.pageCount,
            },
          };
          break;

        case 'docx':
          const docxResult = await docxGenerator.generateMeetingDOCX(meetingId, options as DOCXOptions);
          result = {
            blob: docxResult.blob,
            filename: docxResult.filename,
            size: docxResult.size,
            format: 'docx',
            processingTime: docxResult.processingTime,
          };
          break;

        case 'txt':
        case 'md':
        case 'json':
          const textResult = await textGenerator.generateMeetingText(meetingId, {
            ...options,
            format: options.format === 'txt' ? 'plain-text' :
                   options.format === 'md' ? 'markdown' : 'json',
          } as TextOptions);

          result = {
            blob: new Blob([textResult.content], {
              type: this.getMimeType(options.format),
            }),
            filename: textResult.filename,
            size: textResult.size,
            format: options.format,
            processingTime: textResult.processingTime,
            metadata: {
              wordCount: this.countWords(textResult.content),
            },
          };
          break;

        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      this.updateProgress({
        stage: 'finalizing',
        progress: 90,
        message: 'Finalizing export...',
      });

      // Log export in history
      await this.logExportHistory(meetingId, result);

      this.updateProgress({
        stage: 'complete',
        progress: 100,
        message: 'Export completed successfully',
      });

      return result;
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Export failed: ${error}`);
    }
  }

  /**
   * Export multiple meetings as batch
   */
  async exportMeetingsBatch(
    meetingIds: string[],
    options: ExportOptions
  ): Promise<ExportResult[]> {
    const results: ExportResult[] = [];

    for (let i = 0; i < meetingIds.length; i++) {
      const meetingId = meetingIds[i];

      this.updateProgress({
        stage: 'preparing',
        progress: (i / meetingIds.length) * 100,
        message: `Processing meeting ${i + 1} of ${meetingIds.length}...`,
      });

      const result = await this.exportMeeting(meetingId, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Get supported export formats
   */
  getSupportedFormats(): {
    format: ExportFormat;
    name: string;
    description: string;
    supported: boolean;
  }[] {
    return [
      {
        format: 'pdf',
        name: 'PDF Document',
        description: 'Portable Document Format with professional layout',
        supported: pdfGenerator.constructor.isSupported(),
      },
      {
        format: 'docx',
        name: 'Word Document',
        description: 'Microsoft Word compatible document',
        supported: docxGenerator.constructor.isSupported(),
      },
      {
        format: 'txt',
        name: 'Plain Text',
        description: 'Simple text file with basic formatting',
        supported: textGenerator.constructor.isSupported(),
      },
      {
        format: 'md',
        name: 'Markdown',
        description: 'Markdown formatted text with structure',
        supported: textGenerator.constructor.isSupported(),
      },
      {
        format: 'json',
        name: 'JSON Data',
        description: 'Structured data export for developers',
        supported: textGenerator.constructor.isSupported(),
      },
    ];
  }

  /**
   * Get export templates
   */
  getExportTemplates(): {
    id: string;
    name: string;
    description: string;
    options: Partial<ExportOptions>;
  }[] {
    return [
      {
        id: 'professional',
        name: 'Professional Report',
        description: 'Complete report with all sections and professional formatting',
        options: {
          includeTranscript: true,
          includeSummary: true,
          includeKeyPoints: true,
          includeActionItems: true,
          includeMetadata: true,
          template: 'professional',
        },
      },
      {
        id: 'meeting_minutes',
        name: 'Meeting Minutes',
        description: 'Formal meeting minutes format',
        options: {
          includeTranscript: false,
          includeSummary: true,
          includeKeyPoints: true,
          includeActionItems: true,
          includeMetadata: true,
          template: 'professional',
        },
      },
      {
        id: 'transcript_only',
        name: 'Transcript Only',
        description: 'Just the meeting transcript',
        options: {
          includeTranscript: true,
          includeSummary: false,
          includeKeyPoints: false,
          includeActionItems: false,
          includeMetadata: true,
          template: 'minimal',
        },
      },
      {
        id: 'summary_only',
        name: 'Summary Only',
        description: 'Key points and summary only',
        options: {
          includeTranscript: false,
          includeSummary: true,
          includeKeyPoints: true,
          includeActionItems: true,
          includeMetadata: true,
          template: 'minimal',
        },
      },
    ];
  }

  /**
   * Subscribe to export progress updates
   */
  onProgress(callback: (progress: ExportProgress) => void): () => void {
    this.progressCallbacks.add(callback);
    return () => {
      this.progressCallbacks.delete(callback);
    };
  }

  /**
   * Download exported file
   */
  downloadExport(result: ExportResult): void {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get MIME type for format
   */
  private getMimeType(format: ExportFormat): string {
    switch (format) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain';
      case 'md':
        return 'text/markdown';
      case 'json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Update progress and notify callbacks
   */
  private updateProgress(progress: ExportProgress): void {
    for (const callback of this.progressCallbacks) {
      try {
        callback(progress);
      } catch (error) {
        console.warn('Progress callback error:', error);
      }
    }
  }

  /**
   * Log export in history
   */
  private async logExportHistory(meetingId: string, result: ExportResult): Promise<void> {
    try {
      // This would typically store in a dedicated export history table
      // For now, we'll just log it
      console.log(`Export logged: ${meetingId} -> ${result.filename} (${result.size} bytes)`);
    } catch (error) {
      console.warn('Failed to log export history:', error);
    }
  }

  /**
   * Estimate export time based on content size
   */
  estimateExportTime(meetingId: string, format: ExportFormat): Promise<number> {
    // Simple estimation based on format complexity
    const baseTimes: Record<ExportFormat, number> = {
      pdf: 2000,    // 2 seconds
      docx: 1500,   // 1.5 seconds
      txt: 500,     // 0.5 seconds
      md: 500,      // 0.5 seconds
      json: 300,    // 0.3 seconds
    };

    return Promise.resolve(baseTimes[format] || 1000);
  }
}

// Singleton instance
export const exportManager = new ExportManager();