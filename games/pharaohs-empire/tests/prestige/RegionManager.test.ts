import { describe, it, expect } from 'vitest';
import { RegionManager } from '../../src/prestige/RegionManager';

describe('RegionManager', () => {
  it('starts on the first region', () => {
    const manager = new RegionManager();
    expect(manager.getActiveRegion().definition.id).toBe('nile_delta');
  });

  it('refuses to expand until the region is complete', () => {
    const manager = new RegionManager();
    expect(manager.canExpand()).toBe(false);
    expect(manager.expandToNextRegion()).toBe(false);
  });

  it('expands to the next region once complete, keeping the old region as passive', () => {
    const manager = new RegionManager();
    for (const slot of manager.getActiveRegion().construction.getSlots()) {
      slot.fill({ track: 'monuments', tier: 5 }, 0);
      slot.speedUp();
    }
    expect(manager.expandToNextRegion(1)).toBe(true);
    expect(manager.getActiveRegion().definition.id).toBe('valley_of_the_kings');
    expect(manager.getAllRegions()[0].passiveOnly).toBe(true);
  });

  it('applies the legacy multiplier to production rates after expanding', () => {
    const manager = new RegionManager();
    for (const slot of manager.getActiveRegion().construction.getSlots()) {
      slot.fill({ track: 'monuments', tier: 5 }, 0);
      slot.speedUp();
    }
    manager.expandToNextRegion(1);
    // valley_of_the_kings base gold rate is 2, legacy gain from nile_delta is 0.5 -> multiplier 1.5.
    // Active contributes 1.5 * 2 = 3; passive nile_delta contributes 1.5 * (1 * 0.25) = 0.375.
    expect(manager.getProductionRate('gold')).toBeCloseTo(3.375, 6);
  });

  it('adds 25% of each passive region base rate (legacy-scaled) to the active region rate', () => {
    const manager = new RegionManager();
    for (const slot of manager.getActiveRegion().construction.getSlots()) {
      slot.fill({ track: 'monuments', tier: 5 }, 0);
      slot.speedUp();
    }
    manager.expandToNextRegion(1);
    // After expansion: legacy multiplier = 1 + 0.5 = 1.5.
    // Active region (valley_of_the_kings) gold base = 2.
    // Passive region (nile_delta) gold base = 1, contributes 25%.
    // Expected = 1.5 * 2 + 1.5 * (1 * 0.25) = 3 + 0.375 = 3.375.
    expect(manager.getProductionRate('gold')).toBeCloseTo(3.375, 6);
  });

  it('refuses to expand past the last region', () => {
    const manager = new RegionManager();
    for (const slot of manager.getActiveRegion().construction.getSlots()) {
      slot.fill({ track: 'monuments', tier: 5 }, 0);
      slot.speedUp();
    }
    expect(manager.expandToNextRegion(1)).toBe(true);

    for (const slot of manager.getActiveRegion().construction.getSlots()) {
      slot.fill({ track: 'monuments', tier: 5 }, 0);
      slot.speedUp();
    }
    expect(manager.canExpand(1)).toBe(false);
    expect(manager.expandToNextRegion(1)).toBe(false);
    expect(manager.getActiveRegion().definition.id).toBe('valley_of_the_kings');
  });

  it('restoreState to region 0 with legacy 1 matches a fresh manager', () => {
    const fresh = new RegionManager();
    const restored = new RegionManager();
    restored.restoreState(0, 1);
    expect(restored.getActiveRegion().definition.id).toBe(fresh.getActiveRegion().definition.id);
    expect(restored.getActiveRegion().definition.id).toBe('nile_delta');
    expect(restored.getAllRegions()[0].passiveOnly).toBe(false);
    expect(restored.getLegacyMultiplier().getValue()).toBe(1);
    expect(restored.getProductionRate('gold')).toBeCloseTo(fresh.getProductionRate('gold'), 6);
  });

  it('restoreState to region 1 reactivates prior regions as passive and sets legacy', () => {
    const manager = new RegionManager();
    manager.restoreState(1, 1.5);
    expect(manager.getActiveRegion().definition.id).toBe('valley_of_the_kings');
    expect(manager.getAllRegions()[0].definition.id).toBe('nile_delta');
    expect(manager.getAllRegions()[0].passiveOnly).toBe(true);
    expect(manager.getLegacyMultiplier().getValue()).toBe(1.5);
  });

  it('never resets or destroys the old region after expansion', () => {
    const manager = new RegionManager();
    const oldConstruction = manager.getActiveRegion().construction;
    for (const slot of oldConstruction.getSlots()) {
      slot.fill({ track: 'monuments', tier: 5 }, 0);
      slot.speedUp();
    }
    manager.expandToNextRegion(1);
    const oldRegionState = manager.getAllRegions()[0];
    expect(oldRegionState.construction).toBe(oldConstruction);
    expect(oldRegionState.construction.isRegionComplete(1)).toBe(true);
    expect(oldRegionState.passiveOnly).toBe(true);
  });
});
