// lib/auth/token-manager.ts
const TOKEN_KEY = "linka_auth_token_v1";

export interface AuthToken {
  accessToken: string;
  expiresAt?: number; // epoch ms
  provider?: string;
  refreshToken?: string; // if available (store carefully)
}

export const TokenManager = {
  async save(token: AuthToken) {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set({ [TOKEN_KEY]: token }, () => resolve());
    });
  },

  async get(): Promise<AuthToken | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([TOKEN_KEY], (res) => {
        resolve(res[TOKEN_KEY] ?? null);
      });
    });
  },

  async clear() {
    return new Promise<void>((resolve) => {
      chrome.storage.local.remove([TOKEN_KEY], () => resolve());
    });
  },

  async isExpired(): Promise<boolean> {
    const t = await this.get();
    if (!t || !t.expiresAt) return true;
    return Date.now() > t.expiresAt;
  },

  // If using chrome.identity.getAuthToken (preferred for Google), use that to refresh:
async refreshUsingChromeIdentity(interactive = false): Promise<AuthToken> {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive }, (result) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);

        // ✅ Safely extract string token
        let token: string | undefined;
        if (typeof result === "string") {
          token = result;
        } else if (result && typeof result === "object" && "token" in result) {
          // Some typings define result as GetAuthTokenResult
          token = (result as chrome.identity.GetAuthTokenResult).token;
        }

        if (!token) return reject(new Error("No token returned from chrome.identity"));

        const at: AuthToken = { accessToken: token, provider: "google" };
        this.save(at).then(() => resolve(at));
      });
    });
  },
};
