const SAVE_KEY = 'pharaohs_empire_save_v1';

export interface SaveData {
  version: number;
  wallet: Record<string, number>;
  lastActiveTimestamp: number;
  legacyMultiplier: number;
  activeRegionIndex: number;
  offlineCapMs: number;
}

export class SaveManager {
  save(data: SaveData): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  load(): SaveData | null {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as SaveData;
      if (parsed.version !== 1) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(SAVE_KEY);
  }
}
