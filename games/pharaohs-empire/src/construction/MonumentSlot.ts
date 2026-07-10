import { MergeItem } from '../merge/MergeItem';

export class MonumentSlot {
  private filledItem: MergeItem | null = null;
  private buildStartedAt: number | null = null;
  private skinId: string | null = null;
  private fillTime: number | null = null;

  constructor(private buildDurationMs: number = 60_000) {}

  isFilled(): boolean {
    return this.filledItem !== null;
  }

  fill(item: MergeItem, now: number = Date.now()): void {
    if (this.isFilled()) throw new Error('Monument slot already filled');
    this.filledItem = item;
    this.buildStartedAt = now;
    this.fillTime = now;
  }

  isComplete(now: number = Date.now()): boolean {
    if (!this.isFilled() || this.buildStartedAt === null) return false;
    return now - this.buildStartedAt >= this.buildDurationMs;
  }

  speedUp(): void {
    if (!this.isFilled() || this.fillTime === null) return;
    this.buildStartedAt = this.fillTime - this.buildDurationMs;
  }

  applySkin(skinId: string): void {
    this.skinId = skinId;
  }

  getSkinId(): string | null {
    return this.skinId;
  }
}
