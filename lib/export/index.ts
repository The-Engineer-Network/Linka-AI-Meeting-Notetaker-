// lib/export/index.ts

// Export generators
export { pdfGenerator, PDFGenerator } from './pdf-generator';
export { docxGenerator, DOCXGenerator } from './docx-generator';
export { textGenerator, TextGenerator } from './text-generator';

// Export manager
export { exportManager, ExportManager } from './manager';

// Cloud storage
export { cloudStorageManager, CloudStorageManager } from './cloud-storage';

// Sharing
export { sharingManager, SharingManager } from './sharing';

// Types
export type {
  PDFOptions,
  PDFGenerationResult,
} from './pdf-generator';

export type {
  DOCXOptions,
  DOCXGenerationResult,
} from './docx-generator';

export type {
  TextOptions,
  TextGenerationResult,
} from './text-generator';

export type {
  ExportFormat,
  ExportOptions,
  ExportResult,
  ExportProgress,
} from './manager';

export type {
  CloudStorageProvider,
  CloudUploadOptions,
  CloudUploadResult,
} from './cloud-storage';

export type {
  SharingOptions,
  SharingResult,
  SharedFile,
} from './sharing';

// Main Export System class for easy integration
export class ExportSystem {
  constructor() {
    // Initialize cleanup routines
    this.setupPeriodicCleanup();
  }

  /**
   * Export meeting in specified format
   */
  async exportMeeting(
    meetingId: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    return await exportManager.exportMeeting(meetingId, options);
  }

  /**
   * Share exported meeting
   */
  async shareMeeting(
    meetingId: string,
    exportOptions: ExportOptions,
    sharingOptions: any
  ): Promise<any> {
    return await sharingManager.shareMeeting(meetingId, exportOptions, sharingOptions);
  }

  /**
   * Upload to cloud storage
   */
  async uploadToCloud(
    blob: Blob,
    filename: string,
    options: CloudUploadOptions
  ): Promise<any> {
    return await cloudStorageManager.uploadToCloud(blob, filename, options);
  }

  /**
   * Get available export formats
   */
  getSupportedFormats(): any[] {
    return exportManager.getSupportedFormats();
  }

  /**
   * Get export templates
   */
  getExportTemplates(): any[] {
    return exportManager.getExportTemplates();
  }

  /**
   * Get cloud storage providers
   */
  getCloudProviders(): any[] {
    return cloudStorageManager.getAvailableProviders();
  }

  /**
   * Authenticate with cloud provider
   */
  async authenticateCloudProvider(provider: string): Promise<boolean> {
    return await cloudStorageManager.authenticate(provider as any);
  }

  /**
   * Check if authenticated with cloud provider
   */
  isCloudAuthenticated(provider: string): boolean {
    return cloudStorageManager.isAuthenticated(provider as any);
  }

  /**
   * Get sharing statistics
   */
  getSharingStats(): any {
    return sharingManager.getSharingStats();
  }

  /**
   * Download exported file
   */
  downloadExport(result: ExportResult): void {
    exportManager.downloadExport(result);
  }

  /**
   * Subscribe to export progress
   */
  onExportProgress(callback: (progress: any) => void): () => void {
    return exportManager.onProgress(callback);
  }

  /**
   * Setup periodic cleanup
   */
  private setupPeriodicCleanup(): void {
    // Clean up expired shares every hour
    setInterval(() => {
      try {
        sharingManager.cleanupExpiredShares();
      } catch (error) {
        console.warn('Share cleanup error:', error);
      }
    }, 60 * 60 * 1000);
  }
}

// Singleton instance
export const exportSystem = new ExportSystem();