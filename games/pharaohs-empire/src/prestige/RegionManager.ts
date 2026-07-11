import { REGIONS, RegionDefinition } from '../data/RegionDefinitions';
import { LegacyMultiplier } from './LegacyMultiplier';
import { ConstructionManager } from '../construction/ConstructionManager';

export interface RegionState {
  definition: RegionDefinition;
  construction: ConstructionManager;
  passiveOnly: boolean;
}

export class RegionManager {
  private regions: RegionState[] = [];
  private activeIndex: number = 0;
  private legacy: LegacyMultiplier = new LegacyMultiplier();

  constructor() {
    this.activateRegion(0);
  }

  private activateRegion(index: number): void {
    const definition = REGIONS[index];
    this.regions[index] = {
      definition,
      construction: new ConstructionManager(definition.monumentSlotCount),
      passiveOnly: false
    };
  }

  /**
   * Rebuild region state from a persisted save. Regions 0..activeRegionIndex are
   * re-activated; every region before the active one is marked passiveOnly so
   * getProductionRate's passive-region summing still contributes. The historical
   * monument-construction progress of passive regions is not preserved by the
   * save format (accepted MVP limitation) — only their passive status is.
   */
  restoreState(activeRegionIndex: number, legacyMultiplierValue: number): void {
    this.regions = [];
    for (let index = 0; index <= activeRegionIndex; index += 1) {
      this.activateRegion(index);
      if (index < activeRegionIndex) {
        this.regions[index].passiveOnly = true;
      }
    }
    this.activeIndex = activeRegionIndex;
    this.legacy.setValue(legacyMultiplierValue);
  }

  getActiveRegion(): RegionState {
    return this.regions[this.activeIndex];
  }

  getLegacyMultiplier(): LegacyMultiplier {
    return this.legacy;
  }

  getProductionRate(resource: 'gold' | 'monument_materials' | 'relic_materials'): number {
    // Active region produces at its full base rate; every passive (previously
    // completed) region keeps generating at a flat 25% of its base rate. Both
    // are scaled by the current legacy multiplier. The 25% factor is a
    // deliberate MVP simplification of game spec §3's "prior region keeps
    // passively generating at a reduced rate" — no per-region tuning data
    // exists yet, so a single flat factor is used.
    let total = this.legacy.applyTo(this.getActiveRegion().definition.baseProductionPerSecond[resource]);
    for (const region of this.regions) {
      if (region.passiveOnly) {
        total += this.legacy.applyTo(region.definition.baseProductionPerSecond[resource] * 0.25);
      }
    }
    return total;
  }

  canExpand(now: number = Date.now()): boolean {
    if (this.activeIndex >= REGIONS.length - 1) return false;
    return this.getActiveRegion().construction.isRegionComplete(now);
  }

  expandToNextRegion(now: number = Date.now()): boolean {
    if (!this.canExpand(now)) return false;
    this.regions[this.activeIndex].passiveOnly = true;
    this.legacy.increaseBy(this.getActiveRegion().definition.legacyMultiplierGain);
    this.activeIndex += 1;
    this.activateRegion(this.activeIndex);
    return true;
  }

  getAllRegions(): ReadonlyArray<RegionState> {
    return this.regions;
  }
}
