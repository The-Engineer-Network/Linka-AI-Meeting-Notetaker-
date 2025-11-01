// lib/auth/chrome-identity.ts

export interface ChromeIdentityUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  locale?: string;
}

export interface AuthToken {
  token: string;
  expiresAt: number;
  scopes: string[];
}

export class ChromeIdentityService {
  private static readonly TOKEN_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  /**
   * Check if Chrome Identity API is available
   */
  static isAvailable(): boolean {
    return typeof chrome !== 'undefined' && !!chrome.identity;
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(): Promise<ChromeIdentityUser | null> {
    if (!this.isAvailable()) {
      throw new Error('Chrome Identity API not available');
    }

    try {
      const token = await this.getAuthToken();

      if (!token) {
        return null;
      }

      // Get user profile from Google OAuth
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }

      const profile = await response.json();

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        locale: profile.locale,
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Get authentication token
   */
  static async getAuthToken(interactive = true): Promise<AuthToken | null> {
    if (!this.isAvailable()) {
      throw new Error('Chrome Identity API not available');
    }

    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken(
        {
          interactive,
          scopes: this.TOKEN_SCOPES,
        },
        (token) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (!token) {
            resolve(null);
            return;
          }

          // Get token info to check expiration
          chrome.identity.getProfileUserInfo((userInfo) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }

            resolve({
              token,
              expiresAt: Date.now() + (3600 * 1000), // Assume 1 hour expiration
              scopes: this.TOKEN_SCOPES,
            });
          });
        }
      );
    });
  }

  /**
   * Remove cached authentication token
   */
  static async removeCachedAuthToken(): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({}, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (token) {
          chrome.identity.removeCachedAuthToken({ token }, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Launch web authentication flow
   */
  static async launchWebAuthFlow(url: string, interactive = true): Promise<string | null> {
    if (!this.isAvailable()) {
      throw new Error('Chrome Identity API not available');
    }

    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        {
          url,
          interactive,
        },
        (redirectUrl) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          resolve(redirectUrl || null);
        }
      );
    });
  }

  /**
   * Get profile user info
   */
  static async getProfileUserInfo(): Promise<{ email: string; id: string } | null> {
    if (!this.isAvailable()) {
      throw new Error('Chrome Identity API not available');
    }

    return new Promise((resolve, reject) => {
      chrome.identity.getProfileUserInfo((userInfo) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve(userInfo);
      });
    });
  }

  /**
   * Check if user is signed in
   */
  static async isSignedIn(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch {
      return false;
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<void> {
    await this.removeCachedAuthToken();
  }

  /**
   * Handle authentication errors
   */
  static getAuthErrorMessage(error: any): string {
    if (error.message?.includes('OAuth2 not granted or revoked')) {
      return 'Authentication permission was denied. Please try again and grant the necessary permissions.';
    }

    if (error.message?.includes('The user did not approve access')) {
      return 'Authentication was cancelled. Please try again if you want to sign in.';
    }

    if (error.message?.includes('Network error')) {
      return 'Network error occurred during authentication. Please check your internet connection and try again.';
    }

    return error.message || 'Authentication failed. Please try again.';
  }

  /**
   * Refresh authentication token if needed
   */
  static async refreshTokenIfNeeded(): Promise<AuthToken | null> {
    try {
      const token = await this.getAuthToken(false);

      if (!token) {
        return null;
      }

      // Check if token is close to expiration (within 5 minutes)
      const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);

      if (token.expiresAt < fiveMinutesFromNow) {
        // Token is expiring soon, get a fresh one
        await this.removeCachedAuthToken();
        return await this.getAuthToken(false);
      }

      return token;
    } catch (error) {
      console.warn('Failed to refresh token:', error);
      return null;
    }
  }
}

// Export singleton instance
export const chromeIdentity = ChromeIdentityService;
