import { MonumentSlot } from './MonumentSlot';

export class ConstructionManager {
  private slots: MonumentSlot[];

  constructor(slotCount: number, buildDurationMs: number = 60_000) {
    this.slots = Array.from({ length: slotCount }, () => new MonumentSlot(buildDurationMs));
  }

  getSlots(): ReadonlyArray<MonumentSlot> {
    return this.slots;
  }

  isRegionComplete(now: number = Date.now()): boolean {
    return this.slots.every(slot => slot.isComplete(now));
  }

  completedCount(now: number = Date.now()): number {
    return this.slots.filter(slot => slot.isComplete(now)).length;
  }
}
