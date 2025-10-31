// lib/export/text-generator.ts

import { meetingsRepository } from '../database';

export interface TextOptions {
  includeTranscript?: boolean;
  includeSummary?: boolean;
  includeKeyPoints?: boolean;
  includeActionItems?: boolean;
  includeMetadata?: boolean;
  format?: 'plain-text' | 'markdown' | 'json';
  separator?: string;
}

export interface TextGenerationResult {
  content: string;
  filename: string;
  size: number;
  processingTime: number;
}

export class TextGenerator {
  /**
   * Generate text export from meeting data
   */
  async generateMeetingText(
    meetingId: string,
    options: TextOptions = {}
  ): Promise<TextGenerationResult> {
    const startTime = Date.now();

    try {
      // Get meeting data
      const meeting = await meetingsRepository.getById(meetingId);
      if (!meeting) {
        throw new Error(`Meeting ${meetingId} not found`);
      }

      // Merge options with defaults
      const finalOptions: Required<TextOptions> = {
        includeTranscript: true,
        includeSummary: true,
        includeKeyPoints: true,
        includeActionItems: true,
        includeMetadata: true,
        format: 'plain-text',
        separator: '\n\n',
        ...options,
      };

      // Generate content based on format
      let content: string;
      let extension: string;

      switch (finalOptions.format) {
        case 'json':
          content = this.generateJSON(meeting, finalOptions);
          extension = 'json';
          break;
        case 'markdown':
          content = this.generateMarkdown(meeting, finalOptions);
          extension = 'md';
          break;
        case 'plain-text':
        default:
          content = this.generatePlainText(meeting, finalOptions);
          extension = 'txt';
          break;
      }

      const processingTime = Date.now() - startTime;
      const filename = this.generateFilename(meeting, extension);

      return {
        content,
        filename,
        size: new Blob([content]).size,
        processingTime,
      };
    } catch (error) {
      console.error('Text generation failed:', error);
      throw new Error(`Text generation failed: ${error}`);
    }
  }

  /**
   * Generate plain text format
   */
  private generatePlainText(meeting: any, options: Required<TextOptions>): string {
    let content = '';

    // Title
    content += `${meeting.title || 'Meeting Notes'}\n`;
    content += '='.repeat((meeting.title || 'Meeting Notes').length) + '\n';
    content += options.separator;

    // Metadata
    if (options.includeMetadata) {
      const date = new Date(meeting.timestamp || meeting.createdAt).toLocaleDateString();
      const duration = meeting.duration ? `${meeting.duration} minutes` : 'Unknown duration';
      const participants = meeting.participants?.join(', ') || 'Unknown participants';

      content += `Date: ${date}\n`;
      content += `Duration: ${duration}\n`;
      content += `Participants: ${participants}\n`;
      content += options.separator;
    }

    // Summary
    if (options.includeSummary && meeting.summary) {
      content += 'SUMMARY\n';
      content += '-------\n';
      content += `${meeting.summary}\n`;
      content += options.separator;
    }

    // Key Points
    if (options.includeKeyPoints && meeting.keyPoints) {
      content += 'KEY POINTS\n';
      content += '----------\n';
      meeting.keyPoints.forEach((point: string, index: number) => {
        content += `${index + 1}. ${point}\n`;
      });
      content += options.separator;
    }

    // Action Items
    if (options.includeActionItems && meeting.actionItems) {
      content += 'ACTION ITEMS\n';
      content += '------------\n';
      meeting.actionItems.forEach((item: any, index: number) => {
        const status = item.completed ? '[DONE]' : '[PENDING]';
        content += `${status} ${item.text}\n`;
        if (item.assignedTo) {
          content += `   Assigned to: ${item.assignedTo}\n`;
        }
        if (item.dueDate) {
          content += `   Due: ${new Date(item.dueDate).toLocaleDateString()}\n`;
        }
        content += '\n';
      });
      content += options.separator;
    }

    // Transcript
    if (options.includeTranscript && meeting.transcript) {
      content += 'TRANSCRIPT\n';
      content += '----------\n';
      content += `${meeting.transcript}\n`;
    }

    return content.trim();
  }

  /**
   * Generate Markdown format
   */
  private generateMarkdown(meeting: any, options: Required<TextOptions>): string {
    let content = '';

    // Title
    content += `# ${meeting.title || 'Meeting Notes'}\n\n`;

    // Metadata
    if (options.includeMetadata) {
      const date = new Date(meeting.timestamp || meeting.createdAt).toLocaleDateString();
      const duration = meeting.duration ? `${meeting.duration} minutes` : 'Unknown duration';
      const participants = meeting.participants?.join(', ') || 'Unknown participants';

      content += `**Date:** ${date}\n`;
      content += `**Duration:** ${duration}\n`;
      content += `**Participants:** ${participants}\n\n`;
    }

    // Summary
    if (options.includeSummary && meeting.summary) {
      content += '## Summary\n\n';
      content += `${meeting.summary}\n\n`;
    }

    // Key Points
    if (options.includeKeyPoints && meeting.keyPoints) {
      content += '## Key Points\n\n';
      meeting.keyPoints.forEach((point: string) => {
        content += `- ${point}\n`;
      });
      content += '\n';
    }

    // Action Items
    if (options.includeActionItems && meeting.actionItems) {
      content += '## Action Items\n\n';
      meeting.actionItems.forEach((item: any) => {
        const status = item.completed ? '✅' : '⏳';
        content += `- ${status} ${item.text}\n`;
        if (item.assignedTo) {
          content += `  - **Assigned to:** ${item.assignedTo}\n`;
        }
        if (item.dueDate) {
          content += `  - **Due:** ${new Date(item.dueDate).toLocaleDateString()}\n`;
        }
      });
      content += '\n';
    }

    // Transcript
    if (options.includeTranscript && meeting.transcript) {
      content += '## Transcript\n\n';
      content += '```\n';
      content += `${meeting.transcript}\n`;
      content += '```\n';
    }

    return content.trim();
  }

  /**
   * Generate JSON format
   */
  private generateJSON(meeting: any, options: Required<TextOptions>): string {
    const data: any = {
      id: meeting.id,
      title: meeting.title,
      timestamp: meeting.timestamp || meeting.createdAt,
      duration: meeting.duration,
      participants: meeting.participants,
      exportedAt: new Date().toISOString(),
      exportOptions: options,
    };

    if (options.includeSummary && meeting.summary) {
      data.summary = meeting.summary;
    }

    if (options.includeKeyPoints && meeting.keyPoints) {
      data.keyPoints = meeting.keyPoints;
    }

    if (options.includeActionItems && meeting.actionItems) {
      data.actionItems = meeting.actionItems;
    }

    if (options.includeTranscript && meeting.transcript) {
      data.transcript = meeting.transcript;
    }

    // Add translations if available
    if (meeting.translations) {
      data.translations = meeting.translations;
    }

    // Add AI-generated content
    if (meeting.minutes) {
      data.minutes = meeting.minutes;
    }

    return JSON.stringify(data, null, 2);
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
   * Check if text generation is supported
   */
  static isSupported(): boolean {
    // Text generation is always supported
    return true;
  }
}

// Singleton instance
export const textGenerator = new TextGenerator();