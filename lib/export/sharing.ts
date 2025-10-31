// lib/export/sharing.ts

import { meetingsRepository } from '../database';
import { exportManager, ExportOptions } from './manager';
import { cloudStorageManager, CloudUploadOptions } from './cloud-storage';

export interface SharingOptions {
  method: 'email' | 'link' | 'cloud' | 'direct';
  recipients?: string[];
  subject?: string;
  message?: string;
  expirationHours?: number;
  password?: string;
  cloudProvider?: CloudUploadOptions['provider'];
  makePublic?: boolean;
}

export interface SharingResult {
  success: boolean;
  shareUrl?: string;
  directUrl?: string;
  cloudUrl?: string;
  recipients?: string[];
  expiresAt?: number;
  accessCode?: string;
  error?: string;
}

export interface SharedFile {
  id: string;
  meetingId: string;
  filename: string;
  shareUrl: string;
  createdAt: number;
  expiresAt?: number;
  accessCount: number;
  lastAccessed?: number;
  password?: string;
  recipients?: string[];
}

export class SharingManager {
  private sharedFiles: Map<string, SharedFile> = new Map();

  /**
   * Share meeting export
   */
  async shareMeeting(
    meetingId: string,
    exportOptions: ExportOptions,
    sharingOptions: SharingOptions
  ): Promise<SharingResult> {
    try {
      // First export the meeting
      const exportResult = await exportManager.exportMeeting(meetingId, exportOptions);

      // Then share based on method
      switch (sharingOptions.method) {
        case 'email':
          return await this.shareViaEmail(meetingId, exportResult, sharingOptions);

        case 'link':
          return await this.shareViaLink(meetingId, exportResult, sharingOptions);

        case 'cloud':
          return await this.shareViaCloud(meetingId, exportResult, sharingOptions);

        case 'direct':
          return await this.shareDirectly(meetingId, exportResult, sharingOptions);

        default:
          throw new Error(`Unsupported sharing method: ${sharingOptions.method}`);
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sharing error',
      };
    }
  }

  /**
   * Share via email
   */
  private async shareViaEmail(
    meetingId: string,
    exportResult: any,
    options: SharingOptions
  ): Promise<SharingResult> {
    if (!options.recipients || options.recipients.length === 0) {
      throw new Error('Recipients are required for email sharing');
    }

    // Create a temporary share link
    const linkResult = await this.shareViaLink(meetingId, exportResult, {
      ...options,
      method: 'link',
    });

    if (!linkResult.shareUrl) {
      throw new Error('Failed to create share link for email');
    }

    // Send email (in a real implementation, this would call an email service)
    const emailSent = await this.sendEmail(
      options.recipients,
      options.subject || `Meeting Notes: ${exportResult.filename}`,
      options.message || `Please find the meeting notes attached: ${linkResult.shareUrl}`,
      linkResult.shareUrl
    );

    return {
      success: emailSent,
      shareUrl: linkResult.shareUrl,
      recipients: options.recipients,
      expiresAt: linkResult.expiresAt,
    };
  }

  /**
   * Share via temporary link
   */
  private async shareViaLink(
    meetingId: string,
    exportResult: any,
    options: SharingOptions
  ): Promise<SharingResult> {
    const shareId = this.generateShareId();
    const expiresAt = options.expirationHours
      ? Date.now() + (options.expirationHours * 60 * 60 * 1000)
      : undefined;

    const sharedFile: SharedFile = {
      id: shareId,
      meetingId,
      filename: exportResult.filename,
      shareUrl: `${window.location.origin}/shared/${shareId}`,
      createdAt: Date.now(),
      expiresAt,
      accessCount: 0,
      password: options.password,
      recipients: options.recipients,
    };

    // Store the actual file blob for retrieval
    this.sharedFiles.set(shareId, sharedFile);

    // In a real implementation, you'd store this in a database
    // and upload the file to a temporary storage location

    return {
      success: true,
      shareUrl: sharedFile.shareUrl,
      expiresAt,
      accessCode: options.password,
    };
  }

  /**
   * Share via cloud storage
   */
  private async shareViaCloud(
    meetingId: string,
    exportResult: any,
    options: SharingOptions
  ): Promise<SharingResult> {
    if (!options.cloudProvider) {
      throw new Error('Cloud provider is required for cloud sharing');
    }

    // Check authentication
    if (!cloudStorageManager.isAuthenticated(options.cloudProvider)) {
      throw new Error(`Not authenticated with ${options.cloudProvider}`);
    }

    // Upload to cloud
    const uploadResult = await cloudStorageManager.uploadToCloud(
      exportResult.blob,
      exportResult.filename,
      {
        provider: options.cloudProvider,
        makePublic: options.makePublic,
      }
    );

    if (!uploadResult.success) {
      throw new Error(`Cloud upload failed: ${uploadResult.error}`);
    }

    return {
      success: true,
      cloudUrl: uploadResult.url,
      shareUrl: uploadResult.shareUrl,
    };
  }

  /**
   * Share directly (download link)
   */
  private async shareDirectly(
    meetingId: string,
    exportResult: any,
    options: SharingOptions
  ): Promise<SharingResult> {
    // Create a blob URL for direct download
    const blobUrl = URL.createObjectURL(exportResult.blob);

    return {
      success: true,
      directUrl: blobUrl,
    };
  }

  /**
   * Access shared file
   */
  async accessSharedFile(shareId: string, password?: string): Promise<any | null> {
    const sharedFile = this.sharedFiles.get(shareId);

    if (!sharedFile) {
      return null;
    }

    // Check expiration
    if (sharedFile.expiresAt && Date.now() > sharedFile.expiresAt) {
      this.sharedFiles.delete(shareId);
      return null;
    }

    // Check password
    if (sharedFile.password && sharedFile.password !== password) {
      return null;
    }

    // Update access statistics
    sharedFile.accessCount++;
    sharedFile.lastAccessed = Date.now();

    return sharedFile;
  }

  /**
   * Get sharing statistics
   */
  getSharingStats(): {
    totalShared: number;
    activeShares: number;
    totalAccesses: number;
  } {
    let totalAccesses = 0;
    let activeShares = 0;

    for (const file of this.sharedFiles.values()) {
      if (!file.expiresAt || Date.now() <= file.expiresAt) {
        activeShares++;
      }
      totalAccesses += file.accessCount;
    }

    return {
      totalShared: this.sharedFiles.size,
      activeShares,
      totalAccesses,
    };
  }

  /**
   * Clean up expired shares
   */
  cleanupExpiredShares(): number {
    let removed = 0;
    const now = Date.now();

    for (const [shareId, file] of this.sharedFiles.entries()) {
      if (file.expiresAt && now > file.expiresAt) {
        this.sharedFiles.delete(shareId);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Send email (placeholder implementation)
   */
  private async sendEmail(
    recipients: string[],
    subject: string,
    message: string,
    attachmentUrl: string
  ): Promise<boolean> {
    // Placeholder implementation
    // In a real implementation, this would integrate with an email service
    console.log('Sending email:', {
      recipients,
      subject,
      message,
      attachmentUrl,
    });

    // Simulate email sending
    await this.delay(1000);

    return true;
  }

  /**
   * Generate unique share ID
   */
  private generateShareId(): string {
    return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const sharingManager = new SharingManager();

// Auto-cleanup expired shares every hour
setInterval(() => {
  const removed = sharingManager.cleanupExpiredShares();
  if (removed > 0) {
    console.log(`Cleaned up ${removed} expired shares`);
  }
}, 60 * 60 * 1000);