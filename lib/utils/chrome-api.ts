// lib/utils/chrome-api.ts

/**
 * Chrome API utilities for web app environment
 * Provides safe access to Chrome APIs with fallbacks
 */

export class ChromeAPIUtils {
  /**
   * Check if running in Chrome extension environment
   */
  static isChromeExtension(): boolean {
    return typeof chrome !== 'undefined' &&
           typeof chrome.runtime !== 'undefined' &&
           typeof chrome.runtime.getManifest === 'function';
  }

  /**
   * Check if Chrome Identity API is available
   */
  static isIdentityAvailable(): boolean {
    return this.isChromeExtension() && !!chrome.identity;
  }

  /**
   * Check if Chrome Storage API is available
   */
  static isStorageAvailable(): boolean {
    return this.isChromeExtension() && !!chrome.storage;
  }

  /**
   * Check if Chrome Tabs API is available
   */
  static isTabsAvailable(): boolean {
    return this.isChromeExtension() && !!chrome.tabs;
  }

  /**
   * Check if Chrome Tab Capture API is available
   */
  static isTabCaptureAvailable(): boolean {
    return this.isChromeExtension() && !!chrome.tabCapture;
  }

  /**
   * Check if Chrome Scripting API is available
   */
  static isScriptingAvailable(): boolean {
    return this.isChromeExtension() && !!chrome.scripting;
  }

  /**
   * Safe Chrome API call with error handling
   */
  static async safeChromeCall<T>(
    apiCall: () => Promise<T>,
    fallback?: T,
    errorMessage?: string
  ): Promise<T | undefined> {
    if (!this.isChromeExtension()) {
      console.warn('Chrome API not available - running in web app mode');
      return fallback;
    }

    try {
      return await apiCall();
    } catch (error) {
      console.error(errorMessage || 'Chrome API call failed:', error);
      return fallback;
    }
  }

  /**
   * Get Chrome runtime last error
   */
  static getLastError(): string | undefined {
    if (!this.isChromeExtension()) {
      return undefined;
    }

    return chrome.runtime.lastError?.message;
  }

  /**
   * Check if user has granted required permissions
   */
  static async checkPermissions(permissions: string[]): Promise<boolean> {
    if (!this.isChromeExtension() || !chrome.permissions) {
      return false;
    }

    return new Promise((resolve) => {
      chrome.permissions.contains({ permissions }, (result) => {
        resolve(result);
      });
    });
  }

  /**
   * Request permissions from user
   */
  static async requestPermissions(permissions: string[]): Promise<boolean> {
    if (!this.isChromeExtension() || !chrome.permissions) {
      return false;
    }

    return new Promise((resolve) => {
      chrome.permissions.request({ permissions }, (granted) => {
        resolve(granted);
      });
    });
  }

  /**
   * Get extension manifest
   */
  static getManifest() {
    if (!this.isChromeExtension()) {
      return null;
    }

    try {
      return chrome.runtime.getManifest();
    } catch (error) {
      console.error('Failed to get manifest:', error);
      return null;
    }
  }

  /**
   * Send message to extension background script
   */
  static sendMessage(message: any): Promise<any> {
    if (!this.isChromeExtension()) {
      return Promise.reject(new Error('Chrome extension not available'));
    }

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (this.getLastError()) {
          reject(new Error(this.getLastError()));
          return;
        }
        resolve(response);
      });
    });
  }

  /**
   * Listen for messages from extension
   */
  static onMessage(callback: (message: any, sender: any, sendResponse: Function) => void) {
    if (!this.isChromeExtension()) {
      console.warn('Chrome messaging not available in web app mode');
      return { removeListener: () => {} };
    }

    const listener = (message: any, sender: any, sendResponse: Function) => {
      callback(message, sender, sendResponse);
    };

    chrome.runtime.onMessage.addListener(listener);

    return {
      removeListener: () => {
        chrome.runtime.onMessage.removeListener(listener);
      }
    };
  }

  /**
   * Get current tab information
   */
  static async getCurrentTab(): Promise<chrome.tabs.Tab | null> {
    return this.safeChromeCall(async () => {
      return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          resolve(tabs[0] || null);
        });
      });
    }, null);
  }

  /**
   * Check if current tab is a supported meeting platform
   */
  static isMeetingPlatform(url?: string): boolean {
    if (!url) return false;

    const meetingDomains = [
      'meet.google.com',
      'zoom.us',
      'teams.microsoft.com',
      'slack.com',
      'discord.com',
      'webex.com'
    ];

    try {
      const urlObj = new URL(url);
      return meetingDomains.some(domain =>
        urlObj.hostname.includes(domain) ||
        urlObj.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  /**
   * Get browser information
   */
  static getBrowserInfo(): { name: string; version: string } | null {
    if (!this.isChromeExtension()) {
      return null;
    }

    const manifest = this.getManifest();
    if (!manifest) return null;

    return {
      name: 'Chrome',
      version: manifest.version || 'unknown'
    };
  }

  /**
   * Check if extension is in development mode
   */
  static isDevelopment(): boolean {
    if (!this.isChromeExtension()) {
      return process.env.NODE_ENV === 'development';
    }

    const manifest = this.getManifest();
    return manifest?.version_name?.includes('dev') ||
           manifest?.version?.includes('dev') ||
           false;
  }

  /**
   * Get extension ID
   */
  static getExtensionId(): string | null {
    if (!this.isChromeExtension()) {
      return null;
    }

    try {
      return chrome.runtime.id;
    } catch {
      return null;
    }
  }

  /**
   * Open extension options page
   */
  static openOptionsPage(): void {
    if (!this.isChromeExtension()) {
      console.warn('Options page not available in web app mode');
      return;
    }

    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      // Fallback for older Chrome versions
      const optionsUrl = chrome.runtime.getURL('options.html');
      chrome.tabs.create({ url: optionsUrl });
    }
  }

  /**
   * Reload extension (development only)
   */
  static reloadExtension(): void {
    if (!this.isChromeExtension() || !this.isDevelopment()) {
      return;
    }

    chrome.runtime.reload();
  }
}

// Export singleton instance
export const chromeAPI = ChromeAPIUtils;