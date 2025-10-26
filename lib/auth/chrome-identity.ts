// lib/auth/chrome-identity.ts
export async function launchOAuthFlow(authUrl: string, interactive = true): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      chrome.identity.launchWebAuthFlow({ url: authUrl, interactive }, (redirectUrl) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        if (!redirectUrl) return reject(new Error("No redirect URL"));
        resolve(redirectUrl);
      });
    } catch(err) {
      reject(err);
    }
  });
}

// Example: build an OAuth URL for Google (clientId and scopes must match your console config)
export function buildGoogleOAuthUrl(clientId: string, scopes: string[], redirectUri: string, state?: string) {
  const scope = encodeURIComponent(scopes.join(" "));
  const redirect = encodeURIComponent(redirectUri);
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=token&redirect_uri=${redirect}&scope=${scope}&include_granted_scopes=true&state=${encodeURIComponent(state||"")}`;
}
