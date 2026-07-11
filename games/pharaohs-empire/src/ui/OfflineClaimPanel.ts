import Phaser from 'phaser';
import { OfflineClaimController } from '../economy/OfflineClaimController';
import { AnalyticsService } from '../analytics/AnalyticsService';

/**
 * Overlay shown on boot when a returning player has accrued offline resources.
 * Sits above the boards at a high depth with a full-screen interactive backdrop
 * that absorbs taps (Phaser input is top-only), so the boards underneath stay
 * inert while the panel is visible.
 */
export class OfflineClaimPanel {
  private objects: Phaser.GameObjects.GameObject[] = [];
  private destroyed = false;
  private accruedText!: Phaser.GameObjects.Text;

  constructor(
    private scene: Phaser.Scene,
    private controller: OfflineClaimController,
    private analytics: AnalyticsService,
    private accrued: Record<string, number>,
    private recomputeAccrued: () => Record<string, number>,
    private onClosed: () => void
  ) {
    const width = scene.scale.width;
    const height = scene.scale.height;

    const backdrop = scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setDepth(1000)
      .setInteractive();
    this.objects.push(backdrop);

    const panel = scene.add
      .rectangle(width / 2, height / 2, 480, 420, 0x3b2412)
      .setDepth(1001)
      .setStrokeStyle(3, 0xd9a441);
    this.objects.push(panel);

    const top = height / 2 - 180;
    this.text(width / 2, top, 'Welcome Back, Pharaoh!', '24px', '#f2d16b', 0.5);

    this.accruedText = this.text(width / 2, top + 50, this.accruedLines(), '18px', '#ffffff', 0.5);

    this.button(width / 2, top + 200, 'Claim', () => this.handleClaim());
    this.button(width / 2, top + 260, 'Watch Ad: Double', () => this.handleDouble());
    this.button(width / 2, top + 320, 'Watch Ad: Extend Cap (+4h)', () => this.handleExtend());
  }

  private accruedLines(): string {
    const lines = ['While you were away you gathered:'];
    for (const [resource, amount] of Object.entries(this.accrued)) {
      lines.push(`  ${this.label(resource)}: ${Math.floor(amount)}`);
    }
    return lines.join('\n');
  }

  private label(resource: string): string {
    switch (resource) {
      case 'gold':
        return 'Gold';
      case 'monument_materials':
        return 'Monument Materials';
      case 'relic_materials':
        return 'Relic Materials';
      default:
        return resource;
    }
  }

  private text(
    x: number,
    y: number,
    value: string,
    fontSize: string,
    color: string,
    originX: number
  ): Phaser.GameObjects.Text {
    const t = this.scene.add
      .text(x, y, value, { fontSize, color, align: 'center' })
      .setOrigin(originX, 0)
      .setDepth(1002);
    this.objects.push(t);
    return t;
  }

  private button(x: number, y: number, caption: string, onClick: () => void): void {
    const rect = this.scene.add
      .rectangle(x, y, 380, 46, 0xc9924a)
      .setDepth(1002)
      .setStrokeStyle(2, 0xf2d16b)
      .setInteractive();
    const label = this.scene.add
      .text(x, y, caption, { fontSize: '18px', color: '#1a1008' })
      .setOrigin(0.5, 0.5)
      .setDepth(1003);
    rect.on('pointerdown', onClick);
    this.objects.push(rect, label);
  }

  private handleClaim(): void {
    this.controller.claim(this.accrued);
    this.analytics.track('offline_claim', { doubled: false });
    this.close();
  }

  private async handleDouble(): Promise<void> {
    const result = await this.controller.claimDoubled(this.accrued);
    this.analytics.track('offline_claim', { doubled: result.doubled });
    this.close();
  }

  private async handleExtend(): Promise<void> {
    // Extending the cap is a separate action; it does NOT close the panel so the
    // player can still choose Claim or Double afterward.
    const success = await this.controller.extendCap(4);
    if (success && !this.destroyed) {
      // Recompute the SAME offline window against the now-larger cap so that, if
      // accrual was previously clamped, the extra resources are reflected right
      // now — both in the displayed totals and in what Claim/Double will credit.
      this.accrued = this.recomputeAccrued();
      this.accruedText.setText(this.accruedLines());
    }
    this.analytics.track('cap_extended', { success });
  }

  private close(): void {
    if (this.destroyed) return;
    this.destroy();
    this.onClosed();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const obj of this.objects) obj.destroy();
    this.objects = [];
  }
}
