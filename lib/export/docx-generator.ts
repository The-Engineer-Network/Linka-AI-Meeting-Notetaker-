// lib/export/docx-generator.ts

import { settingsRepository, meetingsRepository } from '../database';

export interface DOCXOptions {
  includeTranscript?: boolean;
  includeSummary?: boolean;
  includeKeyPoints?: boolean;
  includeActionItems?: boolean;
  includeMetadata?: boolean;
  template?: 'professional' | 'minimal' | 'detailed';
  styling?: {
    fontFamily?: string;
    fontSize?: number;
    headingStyle?: 'bold' | 'underline' | 'italic';
    bulletStyle?: 'dash' | 'bullet' | 'number';
  };
}

export interface DOCXGenerationResult {
  blob: Blob;
  filename: string;
  size: number;
  processingTime: number;
}

export class DOCXGenerator {
  /**
   * Generate DOCX from meeting data
   */
  async generateMeetingDOCX(
    meetingId: string,
    options: DOCXOptions = {}
  ): Promise<DOCXGenerationResult> {
    const startTime = Date.now();

    try {
      // Get meeting data
      const meeting = await meetingsRepository.getById(meetingId);
      if (!meeting) {
        throw new Error(`Meeting ${meetingId} not found`);
      }

      // Merge options with defaults
      const finalOptions: Required<DOCXOptions> = {
        includeTranscript: true,
        includeSummary: true,
        includeKeyPoints: true,
        includeActionItems: true,
        includeMetadata: true,
        template: 'professional',
        styling: {
          fontFamily: 'Arial',
          fontSize: 12,
          headingStyle: 'bold',
          bulletStyle: 'bullet',
        },
        ...options,
      };

      // Generate DOCX content
      const docxBlob = await this.createDOCXBlob(meeting, finalOptions);

      const processingTime = Date.now() - startTime;
      const filename = this.generateFilename(meeting, 'docx');

      return {
        blob: docxBlob,
        filename,
        size: docxBlob.size,
        processingTime,
      };
    } catch (error) {
      console.error('DOCX generation failed:', error);
      throw new Error(`DOCX generation failed: ${error}`);
    }
  }

  /**
   * Create DOCX blob using Office Open XML format
   */
  private async createDOCXBlob(meeting: any, options: Required<DOCXOptions>): Promise<Blob> {
    // Generate DOCX content as Office Open XML
    const docxContent = this.generateDOCXContent(meeting, options);

    // Create ZIP archive containing DOCX structure
    // In a real implementation, you would use a library like docx or create the ZIP structure manually
    // For now, we'll create a simple XML blob
    return new Blob([docxContent], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  }

  /**
   * Generate DOCX content as Office Open XML
   */
  private generateDOCXContent(meeting: any, options: Required<DOCXOptions>): string {
    let content = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

    // Word document structure
    content += '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n';
    content += '<w:body>\n';

    // Title
    content += this.createParagraph(meeting.title || 'Meeting Notes', {
      style: 'Title',
      fontSize: 24,
      bold: true,
    });

    // Metadata
    if (options.includeMetadata) {
      const date = new Date(meeting.timestamp || meeting.createdAt).toLocaleDateString();
      const duration = meeting.duration ? `${meeting.duration} minutes` : 'Unknown duration';
      const participants = meeting.participants?.join(', ') || 'Unknown participants';

      content += this.createParagraph(`Date: ${date}`, { style: 'Normal' });
      content += this.createParagraph(`Duration: ${duration}`, { style: 'Normal' });
      content += this.createParagraph(`Participants: ${participants}`, { style: 'Normal' });
      content += '<w:p><w:r><w:br/></w:r></w:p>\n'; // Line break
    }

    // Summary
    if (options.includeSummary && meeting.summary) {
      content += this.createHeading('Summary', 1);
      content += this.createParagraph(meeting.summary, { style: 'Normal' });
      content += '<w:p><w:r><w:br/></w:r></w:p>\n';
    }

    // Key Points
    if (options.includeKeyPoints && meeting.keyPoints) {
      content += this.createHeading('Key Points', 1);
      meeting.keyPoints.forEach((point: string) => {
        content += this.createListItem(point, 1);
      });
      content += '<w:p><w:r><w:br/></w:r></w:p>\n';
    }

    // Action Items
    if (options.includeActionItems && meeting.actionItems) {
      content += this.createHeading('Action Items', 1);
      meeting.actionItems.forEach((item: any) => {
        const status = item.completed ? '[DONE]' : '[PENDING]';
        content += this.createListItem(`${status} ${item.text}`, 1);
      });
      content += '<w:p><w:r><w:br/></w:r></w:p>\n';
    }

    // Transcript
    if (options.includeTranscript && meeting.transcript) {
      content += this.createHeading('Transcript', 1);
      content += this.createParagraph(meeting.transcript, {
        style: 'Normal',
        fontSize: 10,
      });
    }

    content += '</w:body>\n';
    content += '</w:document>\n';

    return content;
  }

  /**
   * Create a paragraph element
   */
  private createParagraph(
    text: string,
    options: {
      style?: string;
      fontSize?: number;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
    } = {}
  ): string {
    let para = '<w:p>\n';

    if (options.style) {
      para += `<w:pPr><w:pStyle w:val="${options.style}"/></w:pPr>\n`;
    }

    para += '<w:r>\n';

    // Run properties
    if (options.fontSize || options.bold || options.italic || options.underline) {
      para += '<w:rPr>\n';
      if (options.fontSize) {
        para += `<w:sz w:val="${options.fontSize * 2}"/><w:szCs w:val="${options.fontSize * 2}"/>\n`;
      }
      if (options.bold) {
        para += '<w:b/>\n';
      }
      if (options.italic) {
        para += '<w:i/>\n';
      }
      if (options.underline) {
        para += '<w:u w:val="single"/>\n';
      }
      para += '</w:rPr>\n';
    }

    para += `<w:t>${this.escapeXml(text)}</w:t>\n`;
    para += '</w:r>\n';
    para += '</w:p>\n';

    return para;
  }

  /**
   * Create a heading
   */
  private createHeading(text: string, level: number): string {
    const style = `Heading${level}`;
    return this.createParagraph(text, {
      style,
      fontSize: Math.max(12, 18 - level * 2),
      bold: true,
    });
  }

  /**
   * Create a list item
   */
  private createListItem(text: string, level: number): string {
    // Simple list implementation - in a real DOCX, you'd use numbering definitions
    const indent = '  '.repeat(level - 1);
    const bullet = level === 1 ? '•' : '◦';
    return this.createParagraph(`${indent}${bullet} ${text}`, { style: 'ListParagraph' });
  }

  /**
   * Escape XML characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, ''');
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
   * Check if DOCX generation is supported
   */
  static isSupported(): boolean {
    // DOCX generation requires XML manipulation capabilities
    return typeof document !== 'undefined';
  }
}

// Singleton instance
export const docxGenerator = new DOCXGenerator();