import Phaser from 'phaser';
import { Wallet } from '../economy/Wallet';
import { ResourceType } from '../data/ResourceTypes';

export class ResourceBar {
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, private wallet: Wallet, x: number, y: number) {
    this.text = scene.add.text(x, y, '', { fontSize: '20px', color: '#ffffff' });
    this.refresh();
  }

  refresh(): void {
    const gold = Math.floor(this.wallet.getBalance(ResourceType.Gold));
    const gems = Math.floor(this.wallet.getBalance(ResourceType.AnkhGems));
    this.text.setText(`Gold: ${gold}   Gems: ${gems}`);
  }
}
