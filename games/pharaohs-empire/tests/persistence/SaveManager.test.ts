import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '../../src/persistence/SaveManager';

describe('SaveManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when nothing has been saved', () => {
    expect(new SaveManager().load()).toBeNull();
  });

  it('round-trips a save through localStorage', () => {
    const manager = new SaveManager();
    const data = {
      version: 1,
      wallet: { gold: 120 },
      lastActiveTimestamp: 123456,
      legacyMultiplier: 1.5,
      activeRegionIndex: 1
    };
    manager.save(data);
    expect(manager.load()).toEqual(data);
  });

  it('rejects data saved under a different version', () => {
    localStorage.setItem('pharaohs_empire_save_v1', JSON.stringify({ version: 2 }));
    expect(new SaveManager().load()).toBeNull();
  });

  it('clears the save', () => {
    const manager = new SaveManager();
    manager.save({ version: 1, wallet: {}, lastActiveTimestamp: 0, legacyMultiplier: 1, activeRegionIndex: 0 });
    manager.clear();
    expect(manager.load()).toBeNull();
  });
});
