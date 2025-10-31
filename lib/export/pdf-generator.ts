// lib/export/pdf-generator.ts

import { settingsRepository, meetingsRepository } from '../database';

export interface PDFOptions {
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
  layout?: {
    fontSize?: number;
    lineHeight?: number;
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
}

export interface PDFGenerationResult {
  blob: Blob;
  filename: string;
  size: number;
  pageCount: number;
  processingTime: number;
}

export class PDFGenerator {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    this.initializeCanvas();
  }

  /**
   * Initialize canvas for PDF generation
   */
  private initializeCanvas(): void {
    try {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');

      if (!this.ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Set default canvas size (A4 at 300 DPI)
      this.canvas.width = 2480; // 8.27 inches * 300 DPI
      this.canvas.height = 3508; // 11.69 inches * 300 DPI
    } catch (error) {
      console.error('Failed to initialize canvas for PDF generation:', error);
    }
  }

  /**
   * Generate PDF from meeting data
   */
  async generateMeetingPDF(
    meetingId: string,
    options: PDFOptions = {}
  ): Promise<PDFGenerationResult> {
    const startTime = Date.now();

    try {
      // Get meeting data
      const meeting = await meetingsRepository.getById(meetingId);
      if (!meeting) {
        throw new Error(`Meeting ${meetingId} not found`);
      }

      // Get user settings for branding
      const settings = await settingsRepository.getGlobalSettings();

      // Merge options with defaults
      const finalOptions: Required<PDFOptions> = {
        includeTranscript: true,
        includeSummary: true,
        includeKeyPoints: true,
        includeActionItems: true,
        includeMetadata: true,
        template: 'professional',
        branding: {
          logo: settings.branding?.logo,
          companyName: settings.branding?.companyName || 'Linka AI',
          colors: {
            primary: settings.branding?.colors?.primary || '#2563eb',
            secondary: settings.branding?.colors?.secondary || '#64748b',
            accent: settings.branding?.colors?.accent || '#10b981',
          },
        },
        layout: {
          fontSize: 12,
          lineHeight: 1.4,
          margins: {
            top: 72, // 1 inch in points
            right: 72,
            bottom: 72,
            left: 72,
          },
        },
        ...options,
      };

      // Generate PDF content
      const pdfBlob = await this.createPDFBlob(meeting, finalOptions);

      const processingTime = Date.now() - startTime;
      const filename = this.generateFilename(meeting, 'pdf');

      return {
        blob: pdfBlob,
        filename,
        size: pdfBlob.size,
        pageCount: this.estimatePageCount(meeting, finalOptions),
        processingTime,
      };
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error}`);
    }
  }

  /**
   * Create PDF blob using canvas-based approach
   */
  private async createPDFBlob(meeting: any, options: Required<PDFOptions>): Promise<Blob> {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not initialized');
    }

    // For now, we'll create a simple text-based PDF representation
    // In a real implementation, you would use a PDF library like jsPDF or PDFKit
    // or integrate with a service like Puppeteer for HTML-to-PDF conversion

    const pdfContent = this.generatePDFContent(meeting, options);

    // Create a simple text blob for now
    // This would be replaced with actual PDF generation
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * Generate PDF content as text (placeholder for actual PDF generation)
   */
  private generatePDFContent(meeting: any, options: Required<PDFOptions>): string {
    let content = `%PDF-1.4\n`;

    // Add PDF header and metadata
    content += `1 0 obj\n`;
    content += `<<\n`;
    content += `/Type /Catalog\n`;
    content += `/Pages 2 0 R\n`;
    content += `>>\n`;
    content += `endobj\n`;

    // Add pages object
    content += `2 0 obj\n`;
    content += `<<\n`;
    content += `/Type /Pages\n`;
    content += `/Kids [3 0 R]\n`;
    content += `/Count 1\n`;
    content += `>>\n`;
    content += `endobj\n`;

    // Add page content
    content += `3 0 obj\n`;
    content += `<<\n`;
    content += `/Type /Page\n`;
    content += `/Parent 2 0 R\n`;
    content += `/MediaBox [0 0 612 792]\n`; // Letter size
    content += `/Contents 4 0 R\n`;
    content += `/Resources << /Font << /F1 5 0 R >> >>\n`;
    content += `>>\n`;
    content += `endobj\n`;

    // Add content stream
    content += `4 0 obj\n`;
    content += `<<\n`;
    content += `/Length ${this.generateContentStream(meeting, options).length}\n`;
    content += `>>\n`;
    content += `stream\n`;
    content += this.generateContentStream(meeting, options);
    content += `endstream\n`;
    content += `endobj\n`;

    // Add font
    content += `5 0 obj\n`;
    content += `<<\n`;
    content += `/Type /Font\n`;
    content += `/Subtype /Type1\n`;
    content += `/BaseFont /Helvetica\n`;
    content += `>>\n`;
    content += `endobj\n`;

    // Add xref table
    content += `xref\n`;
    content += `0 6\n`;
    content += `0000000000 65535 f \n`;
    content += `0000000009 00000 n \n`;
    content += `0000000058 00000 n \n`;
    content += `0000000115 00000 n \n`;
    content += `0000000274 00000 n \n`;
    content += `0000001000 00000 n \n`;

    // Add trailer
    content += `trailer\n`;
    content += `<<\n`;
    content += `/Size 6\n`;
    content += `/Root 1 0 R\n`;
    content += `>>\n`;
    content += `startxref\n`;
    content += `${content.length}\n`;
    content += `%%EOF\n`;

    return content;
  }

  /**
   * Generate PDF content stream
   */
  private generateContentStream(meeting: any, options: Required<PDFOptions>): string {
    let stream = '';

    // Set font and position
    stream += '/F1 12 Tf\n';
    stream += '72 720 Td\n';

    // Add title
    stream += `(${meeting.title || 'Meeting Notes'}) Tj\n`;
    stream += '0 -24 Td\n';

    // Add metadata if requested
    if (options.includeMetadata) {
      const date = new Date(meeting.timestamp || meeting.createdAt).toLocaleDateString();
      const duration = meeting.duration ? `${meeting.duration} minutes` : 'Unknown duration';

      stream += `(Date: ${date}) Tj\n`;
      stream += '0 -18 Td\n';
      stream += `(Duration: ${duration}) Tj\n`;
      stream += '0 -18 Td\n';
      stream += `(Participants: ${meeting.participants?.length || 0}) Tj\n`;
      stream += '0 -24 Td\n';
    }

    // Add summary if requested
    if (options.includeSummary && meeting.summary) {
      stream += '(Summary) Tj\n';
      stream += '0 -18 Td\n';
      const summaryLines = this.wrapText(meeting.summary, 80);
      summaryLines.forEach(line => {
        stream += `(${line}) Tj\n`;
        stream += '0 -14 Td\n';
      });
      stream += '0 -12 Td\n';
    }

    // Add key points if requested
    if (options.includeKeyPoints && meeting.keyPoints) {
      stream += '(Key Points) Tj\n';
      stream += '0 -18 Td\n';
      meeting.keyPoints.forEach((point: string, index: number) => {
        stream += `(${index + 1}. ${point}) Tj\n`;
        stream += '0 -14 Td\n';
      });
      stream += '0 -12 Td\n';
    }

    // Add action items if requested
    if (options.includeActionItems && meeting.actionItems) {
      stream += '(Action Items) Tj\n';
      stream += '0 -18 Td\n';
      meeting.actionItems.forEach((item: any, index: number) => {
        const status = item.completed ? '[DONE]' : '[PENDING]';
        stream += `(${status} ${item.text}) Tj\n`;
        stream += '0 -14 Td\n';
      });
    }

    return stream;
  }

  /**
   * Wrap text to fit within width
   */
  private wrapText(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  /**
   * Generate filename for export
   */
  private generateFilename(meeting: any, extension: string): string {
    const title = meeting.title || 'meeting';
    const date = new Date(meeting.timestamp || meeting.createdAt).toISOString().split('T')[0];
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${sanitizedTitle}_${date}.${extension}`;
  }

  /**
   * Estimate page count based on content
   */
  private estimatePageCount(meeting: any, options: Required<PDFOptions>): number {
    let contentLength = 0;

    if (options.includeTranscript && meeting.transcript) {
      contentLength += meeting.transcript.length;
    }
    if (options.includeSummary && meeting.summary) {
      contentLength += meeting.summary.length;
    }
    if (options.includeKeyPoints && meeting.keyPoints) {
      contentLength += meeting.keyPoints.join(' ').length;
    }
    if (options.includeActionItems && meeting.actionItems) {
      contentLength += meeting.actionItems.join(' ').length;
    }

    // Rough estimation: ~3000 characters per page
    const estimatedPages = Math.max(1, Math.ceil(contentLength / 3000));
    return estimatedPages;
  }

  /**
   * Check if PDF generation is supported
   */
  static isSupported(): boolean {
    return typeof document !== 'undefined' && !!document.createElement('canvas').getContext('2d');
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.canvas = null;
    this.ctx = null;
  }
}

// Singleton instance
export const pdfGenerator = new PDFGenerator();