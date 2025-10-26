// lib/user/profile-manager.ts
export interface UserProfile {
  id?: string;
  displayName?: string;
  email?: string;
  preferredLanguage?: string;
  createdAt: number;
  usageStats: {
    meetingsCreated: number;
    minutesProcessed: number;
    lastActive?: number;
  };
}

export const ProfileManager = {
  async get(): Promise<UserProfile | null> {
    return new Promise((res) => {
      chrome.storage.local.get(["linka_user_profile_v1"], (r) =>
        res(r["linka_user_profile_v1"] ?? null)
      );
    });
  },

  async save(profile: Partial<UserProfile>) {
    const current =
      (await this.get()) ?? {
        createdAt: Date.now(),
        usageStats: { meetingsCreated: 0, minutesProcessed: 0 },
      };

    const merged: UserProfile = {
      ...current,
      ...profile,
      usageStats: { ...current.usageStats, ...(profile.usageStats ?? {}) },
    };

    return new Promise<void>((res) => {
      chrome.storage.local.set({ linka_user_profile_v1: merged }, () => res());
    });
  },

  async incrementUsage(delta: Partial<UserProfile["usageStats"]>) {
    const profile =
      (await this.get()) ?? {
        createdAt: Date.now(),
        usageStats: { meetingsCreated: 0, minutesProcessed: 0 },
      };

    // ✅ Strongly typed merge — no `any`
    profile.usageStats = { ...profile.usageStats, ...delta };

    return this.save(profile);
  },
};
