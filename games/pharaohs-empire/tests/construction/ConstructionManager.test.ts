import { describe, it, expect } from 'vitest';
import { MonumentSlot } from '../../src/construction/MonumentSlot';
import { ConstructionManager } from '../../src/construction/ConstructionManager';

describe('MonumentSlot', () => {
  it('is not complete immediately after filling', () => {
    const slot = new MonumentSlot(60_000);
    slot.fill({ track: 'monuments', tier: 5 }, 1_000);
    expect(slot.isComplete(1_500)).toBe(false);
  });

  it('completes once the build duration has elapsed', () => {
    const slot = new MonumentSlot(60_000);
    slot.fill({ track: 'monuments', tier: 5 }, 1_000);
    expect(slot.isComplete(61_000)).toBe(true);
  });

  it('completes instantly when sped up', () => {
    const slot = new MonumentSlot(60_000);
    slot.fill({ track: 'monuments', tier: 5 }, 1_000);
    slot.speedUp();
    expect(slot.isComplete(1_001)).toBe(true);
  });

  it('stores an applied cosmetic skin', () => {
    const slot = new MonumentSlot();
    slot.applySkin('golden_finish');
    expect(slot.getSkinId()).toBe('golden_finish');
  });
});

describe('ConstructionManager', () => {
  it('is not region-complete until every slot is complete', () => {
    const manager = new ConstructionManager(2, 60_000);
    const slots = manager.getSlots();
    slots[0].fill({ track: 'monuments', tier: 5 }, 0);
    slots[0].speedUp();
    expect(manager.isRegionComplete(1)).toBe(false);
    expect(manager.completedCount(1)).toBe(1);
  });

  it('is region-complete once every slot is complete', () => {
    const manager = new ConstructionManager(2, 60_000);
    for (const slot of manager.getSlots()) {
      slot.fill({ track: 'monuments', tier: 5 }, 0);
      slot.speedUp();
    }
    expect(manager.isRegionComplete(1)).toBe(true);
  });
});
