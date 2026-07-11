import Phaser from 'phaser';
import { MergeBoard } from '../merge/MergeBoard';
import { Wallet } from '../economy/Wallet';
import { AnalyticsService } from '../analytics/AnalyticsService';
import { ResourceType } from '../data/ResourceTypes';
import { getMaxTier } from '../data/MergeItemDefinitions';

// Reward for banking one max-tier Treasury artifact. Instant payout (no build
// timer, no slots) — narratively you found the treasure and bank it immediately.
const TREASURE_GOLD_REWARD = 50;
const TREASURE_ANKH_GEMS_REWARD = 1;

/**
 * UI below the Treasury board: a single "Collect Treasure" button. On click it
 * scans the board for a max-tier ("Treasury-Ready Artifact") item, removes it,
 * and banks a fixed Gold + Ankh Gems reward directly to the wallet. Structurally
 * mirrors MonumentPanel but simpler — collecting is instant, so there are no
 * construction slots or build timers. Disposable — rebuilt for each region.
 */
export class TreasuryPanel {
  private objects: Phaser.GameObjects.GameObject[] = [];
  private destroyed = false;

  constructor(
    private scene: Phaser.Scene,
    private board: MergeBoard,
    private wallet: Wallet,
    private analytics: AnalyticsService,
    private originX: number,
    private originY: number,
    private onBoardChanged: () => void
  ) {
    this.text(originX, originY - 34, 'Treasury', '18px', '#f2d16b');
    this.button(originX + 200, originY - 34, 200, 36, 'Collect Treasure', () => this.handleCollect());
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

  private handleCollect(): void {
    const maxTier = getMaxTier('treasury');
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

    const item = this.board.removeItem(target);
    if (!item) return;

    this.wallet.add(ResourceType.Gold, TREASURE_GOLD_REWARD, 'treasure_collected');
    this.wallet.add(ResourceType.AnkhGems, TREASURE_ANKH_GEMS_REWARD, 'treasure_collected');
    this.analytics.track('treasure_collected');
    this.onBoardChanged();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const obj of this.objects) obj.destroy();
    this.objects = [];
  }
}
