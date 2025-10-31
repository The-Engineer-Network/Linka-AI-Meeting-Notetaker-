// lib/export/__tests__/export.test.ts

import { ExportManager, exportManager } from '../manager';
import { PDFGenerator, pdfGenerator } from '../pdf-generator';
import { DOCXGenerator, docxGenerator } from '../docx-generator';
import { TextGenerator, textGenerator } from '../text-generator';
import { CloudStorageManager, cloudStorageManager } from '../cloud-storage';
import { SharingManager, sharingManager } from '../sharing';
import { ExportSystem, exportSystem } from '../index';

// Mock dependencies
jest.mock('../../database', () => ({
  meetingsRepository: {
    getById: jest.fn(),
  },
  settingsRepository: {
    getGlobalSettings: jest.fn(),
  },
}));

// Mock DOM elements
Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockImplementation((tag) => {
    if (tag === 'canvas') {
      return {
        getContext: jest.fn().mockReturnValue({
          fillRect: jest.fn(),
          fillText: jest.fn(),
        }),
        width: 800,
        height: 600,
      };
    }
    if (tag === 'a') {
      return {
        href: '',
        download: '',
        click: jest.fn(),
      };
    }
    return {};
  }),
});

Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://test.com',
  },
});

describe('Export System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock meeting data
    const mockMeetingsRepo = require('../../database').meetingsRepository;
    mockMeetingsRepo.getById.mockResolvedValue({
      id: 'meeting-123',
      title: 'Test Meeting',
      timestamp: new Date(),
      duration: 60,
      participants: ['John Doe', 'Jane Smith'],
      transcript: 'This is a test transcript.',
      summary: 'This is a test summary.',
      keyPoints: ['Point 1', 'Point 2'],
      actionItems: [{ text: 'Action 1', completed: false }],
    });

    // Mock settings
    const mockSettingsRepo = require('../../database').settingsRepository;
    mockSettingsRepo.getGlobalSettings.mockResolvedValue({
      branding: {
        logo: 'logo.png',
        companyName: 'Test Company',
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#10b981',
        },
      },
    });
  });

  describe('ExportManager', () => {
    test('should export meeting in PDF format', async () => {
      const result = await exportManager.exportMeeting('meeting-123', {
        format: 'pdf',
        includeTranscript: true,
        includeSummary: true,
      });

      expect(result).toHaveProperty('blob');
      expect(result).toHaveProperty('filename');
      expect(result.format).toBe('pdf');
      expect(result.filename).toMatch(/\.pdf$/);
    });

    test('should export meeting in DOCX format', async () => {
      const result = await exportManager.exportMeeting('meeting-123', {
        format: 'docx',
        includeTranscript: true,
        includeSummary: true,
      });

      expect(result).toHaveProperty('blob');
      expect(result).toHaveProperty('filename');
      expect(result.format).toBe('docx');
      expect(result.filename).toMatch(/\.docx$/);
    });

    test('should export meeting in text formats', async () => {
      const formats: Array<'txt' | 'md' | 'json'> = ['txt', 'md', 'json'];

      for (const format of formats) {
        const result = await exportManager.exportMeeting('meeting-123', {
          format,
          includeTranscript: true,
          includeSummary: true,
        });

        expect(result).toHaveProperty('blob');
        expect(result).toHaveProperty('filename');
        expect(result.format).toBe(format);
      }
    });

    test('should get supported formats', () => {
      const formats = exportManager.getSupportedFormats();

      expect(formats).toBeInstanceOf(Array);
      expect(formats.length).toBeGreaterThan(0);

      formats.forEach(format => {
        expect(format).toHaveProperty('format');
        expect(format).toHaveProperty('name');
        expect(format).toHaveProperty('supported');
      });
    });

    test('should get export templates', () => {
      const templates = exportManager.getExportTemplates();

      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);

      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('options');
      });
    });

    test('should handle export progress callbacks', async () => {
      const progressCallback = jest.fn();

      const unsubscribe = exportManager.onProgress(progressCallback);

      // Start an export to trigger progress
      const exportPromise = exportManager.exportMeeting('meeting-123', {
        format: 'txt',
      });

      // Wait a bit for progress callbacks
      await new Promise(resolve => setTimeout(resolve, 100));

      unsubscribe();

      expect(progressCallback).toHaveBeenCalled();
    });
  });

  describe('CloudStorageManager', () => {
    test('should get available providers', () => {
      const providers = cloudStorageManager.getAvailableProviders();

      expect(providers).toBeInstanceOf(Array);
      expect(providers.length).toBeGreaterThan(0);

      providers.forEach(provider => {
        expect(provider).toHaveProperty('name');
        expect(provider).toHaveProperty('id');
        expect(provider).toHaveProperty('authRequired');
        expect(provider).toHaveProperty('supported');
      });
    });

    test('should upload to cloud storage', async () => {
      const blob = new Blob(['test content'], { type: 'text/plain' });
      const filename = 'test.txt';

      const result = await cloudStorageManager.uploadToCloud(blob, filename, {
        provider: 'google-drive',
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('provider');
      expect(result.provider).toBe('google-drive');
    });

    test('should handle authentication', async () => {
      const authenticated = await cloudStorageManager.authenticate('google-drive');
      expect(typeof authenticated).toBe('boolean');

      const isAuth = cloudStorageManager.isAuthenticated('google-drive');
      expect(typeof isAuth).toBe('boolean');
    });
  });

  describe('SharingManager', () => {
    test('should share meeting via link', async () => {
      const result = await sharingManager.shareMeeting(
        'meeting-123',
        { format: 'txt' },
        { method: 'link', expirationHours: 24 }
      );

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('shareUrl');
    });

    test('should share meeting via email', async () => {
      const result = await sharingManager.shareMeeting(
        'meeting-123',
        { format: 'txt' },
        {
          method: 'email',
          recipients: ['test@example.com'],
          subject: 'Meeting Notes',
        }
      );

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('recipients');
    });

    test('should get sharing statistics', () => {
      const stats = sharingManager.getSharingStats();

      expect(stats).toHaveProperty('totalShared');
      expect(stats).toHaveProperty('activeShares');
      expect(stats).toHaveProperty('totalAccesses');
    });
  });

  describe('ExportSystem', () => {
    test('should export meeting', async () => {
      const result = await exportSystem.exportMeeting('meeting-123', {
        format: 'txt',
      });

      expect(result).toHaveProperty('blob');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('format');
    });

    test('should share meeting', async () => {
      const result = await exportSystem.shareMeeting(
        'meeting-123',
        { format: 'txt' },
        { method: 'link' }
      );

      expect(result).toHaveProperty('success');
    });

    test('should upload to cloud', async () => {
      const blob = new Blob(['test'], { type: 'text/plain' });

      const result = await exportSystem.uploadToCloud(blob, 'test.txt', {
        provider: 'google-drive',
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('provider');
    });

    test('should get supported formats', () => {
      const formats = exportSystem.getSupportedFormats();
      expect(formats).toBeInstanceOf(Array);
    });

    test('should get export templates', () => {
      const templates = exportSystem.getExportTemplates();
      expect(templates).toBeInstanceOf(Array);
    });

    test('should get cloud providers', () => {
      const providers = exportSystem.getCloudProviders();
      expect(providers).toBeInstanceOf(Array);
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent meeting', async () => {
      const mockMeetingsRepo = require('../../database').meetingsRepository;
      mockMeetingsRepo.getById.mockResolvedValue(null);

      await expect(
        exportManager.exportMeeting('non-existent', { format: 'txt' })
      ).rejects.toThrow('Meeting non-existent not found');
    });

    test('should handle unsupported export format', async () => {
      await expect(
        exportManager.exportMeeting('meeting-123', { format: 'unsupported' as any })
      ).rejects.toThrow('Unsupported export format');
    });

    test('should handle cloud upload failures', async () => {
      const blob = new Blob(['test'], { type: 'text/plain' });

      // This should not throw but return a failed result
      const result = await cloudStorageManager.uploadToCloud(blob, 'test.txt', {
        provider: 'unsupported' as any,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    test('should perform complete export and share workflow', async () => {
      // Export meeting
      const exportResult = await exportSystem.exportMeeting('meeting-123', {
        format: 'txt',
        includeTranscript: true,
        includeSummary: true,
      });

      expect(exportResult.success).toBeUndefined(); // ExportResult doesn't have success
      expect(exportResult.blob).toBeInstanceOf(Blob);

      // Share the exported file
      const shareResult = await exportSystem.shareMeeting(
        'meeting-123',
        { format: 'txt' },
        {
          method: 'link',
          expirationHours: 24,
        }
      );

      expect(shareResult.success).toBe(true);
      expect(shareResult.shareUrl).toBeDefined();
    });

    test('should handle batch exports', async () => {
      const meetingIds = ['meeting-123', 'meeting-456'];

      // Mock second meeting
      const mockMeetingsRepo = require('../../database').meetingsRepository;
      mockMeetingsRepo.getById.mockImplementation((id: string) => {
        if (id === 'meeting-456') {
          return Promise.resolve({
            id: 'meeting-456',
            title: 'Second Meeting',
            timestamp: new Date(),
            transcript: 'Second meeting transcript.',
          });
        }
        return Promise.resolve({
          id: 'meeting-123',
          title: 'Test Meeting',
          timestamp: new Date(),
          transcript: 'This is a test transcript.',
        });
      });

      const results = await exportManager.exportMeetingsBatch(meetingIds, {
        format: 'txt',
      });

      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result).toHaveProperty('blob');
        expect(result).toHaveProperty('filename');
      });
    });
  });
});