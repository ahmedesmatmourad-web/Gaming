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
    // valley_of_the_kings base gold rate is 2, legacy gain from nile_delta is 0.5 -> multiplier 1.5
    expect(manager.getProductionRate('gold')).toBe(3);
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
