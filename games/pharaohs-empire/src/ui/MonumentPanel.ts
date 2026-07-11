import Phaser from 'phaser';
import { MergeBoard } from '../merge/MergeBoard';
import { ConstructionManager } from '../construction/ConstructionManager';
import { AdService } from '../ads/AdService';
import { AnalyticsService } from '../analytics/AnalyticsService';
import { getMaxTier } from '../data/MergeItemDefinitions';

// Mirrors ConstructionManager's default buildDurationMs. Used only for the
// cosmetic countdown text; the authoritative "is it done?" check is always
// MonumentSlot.isComplete(now), so a speed-up ad still reads as complete here.
const BUILD_DURATION_MS = 60_000;
const SLOT_SIZE = 56;
const SLOT_SPACING = 96;

/**
 * UI below the Monuments board: one square per construction slot plus controls
 * to feed a max-tier monument item into an empty slot and to speed a build up
 * with a rewarded ad. Disposable — rebuilt for each region's ConstructionManager
 * on expansion.
 */
export class MonumentPanel {
  private objects: Phaser.GameObjects.GameObject[] = [];
  private slotRects: Phaser.GameObjects.Rectangle[] = [];
  private slotTexts: Phaser.GameObjects.Text[] = [];
  private speedUpRects: Phaser.GameObjects.Rectangle[] = [];
  private speedUpLabels: Phaser.GameObjects.Text[] = [];
  private fillTimes: (number | null)[] = [];
  private wasComplete: boolean[] = [];
  private destroyed = false;

  constructor(
    private scene: Phaser.Scene,
    private board: MergeBoard,
    private construction: ConstructionManager,
    private adService: AdService,
    private analytics: AnalyticsService,
    private originX: number,
    private originY: number,
    private onBoardChanged: () => void
  ) {
    const slots = this.construction.getSlots();
    this.fillTimes = slots.map(() => null);
    this.wasComplete = slots.map(() => false);

    this.text(originX, originY - 34, 'Monuments', '18px', '#f2d16b');
    this.button(originX + 200, originY - 34, 200, 36, 'Build Monument', () => this.handleBuild());

    for (let i = 0; i < slots.length; i++) {
      const x = originX + i * SLOT_SPACING;
      const rect = this.scene.add
        .rectangle(x, originY, SLOT_SIZE, SLOT_SIZE, 0x000000, 0)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0xf2d16b);
      this.objects.push(rect);
      this.slotRects.push(rect);

      const label = this.scene.add.text(x, originY + SLOT_SIZE + 4, '', {
        fontSize: '12px',
        color: '#ffffff'
      });
      this.objects.push(label);
      this.slotTexts.push(label);

      const idx = i;
      const suRect = this.scene.add
        .rectangle(x, originY + SLOT_SIZE + 24, 88, 26, 0xc9924a)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0xf2d16b)
        .setInteractive();
      suRect.on('pointerdown', () => this.handleSpeedUp(idx));
      const suLabel = this.scene.add
        .text(x + 4, originY + SLOT_SIZE + 28, 'Speed Up', { fontSize: '12px', color: '#1a1008' });
      this.objects.push(suRect, suLabel);
      this.speedUpRects.push(suRect);
      this.speedUpLabels.push(suLabel);
    }

    this.refresh();
  }

  private text(x: number, y: number, value: string, fontSize: string, color: string): void {
    const t = this.scene.add.text(x, y, value, { fontSize, color });
    this.objects.push(t);
  }

  private button(
    x: number,
    y: number,
    w: number,
    h: number,
    caption: string,
    onClick: () => void
  ): void {
    const rect = this.scene.add
      .rectangle(x, y, w, h, 0xc9924a)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xf2d16b)
      .setInteractive();
    const label = this.scene.add.text(x + 8, y + 8, caption, { fontSize: '15px', color: '#1a1008' });
    rect.on('pointerdown', onClick);
    this.objects.push(rect, label);
  }

  private handleBuild(): void {
    const maxTier = getMaxTier('monuments');
    let target: { row: number; col: number } | null = null;
    for (let row = 0; row < this.board.getRows() && !target; row++) {
      for (let col = 0; col < this.board.getCols(); col++) {
        const item = this.board.getItem({ row, col });
        if (item && item.tier >= maxTier) {
          target = { row, col };
          break;
        }
      }
    }
    if (!target) return;

    const slots = this.construction.getSlots();
    const slotIndex = slots.findIndex(s => !s.isFilled());
    if (slotIndex === -1) return;

    const item = this.board.removeItem(target);
    if (!item) return;

    const now = Date.now();
    slots[slotIndex].fill(item, now);
    this.fillTimes[slotIndex] = now;
    this.analytics.track('monument_filled');
    this.onBoardChanged();
    this.refresh();
  }

  private async handleSpeedUp(index: number): Promise<void> {
    const slot = this.construction.getSlots()[index];
    if (!slot || !slot.isFilled() || slot.isComplete()) return;
    const result = await this.adService.showRewarded('speed_up');
    if (result === 'completed') {
      slot.speedUp();
      this.refresh();
    }
  }

  refresh(): void {
    if (this.destroyed) return;
    const now = Date.now();
    const slots = this.construction.getSlots();
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const rect = this.slotRects[i];
      const label = this.slotTexts[i];
      const suRect = this.speedUpRects[i];
      const suLabel = this.speedUpLabels[i];

      if (!slot.isFilled()) {
        rect.setFillStyle(0x000000, 0);
        label.setText('');
        suRect.setVisible(false);
        suLabel.setVisible(false);
      } else if (slot.isComplete(now)) {
        rect.setFillStyle(0x4caf50, 1);
        label.setText('Done');
        suRect.setVisible(false);
        suLabel.setVisible(false);
        if (!this.wasComplete[i]) {
          this.wasComplete[i] = true;
          this.analytics.track('monument_completed');
        }
      } else {
        rect.setFillStyle(0xc9924a, 1);
        const fillTime = this.fillTimes[i] ?? now;
        const remainingMs = Math.max(0, fillTime + BUILD_DURATION_MS - now);
        label.setText(`${Math.ceil(remainingMs / 1000)}s`);
        suRect.setVisible(true);
        suLabel.setVisible(true);
      }
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const obj of this.objects) obj.destroy();
    this.objects = [];
    this.slotRects = [];
    this.slotTexts = [];
    this.speedUpRects = [];
    this.speedUpLabels = [];
  }
}
