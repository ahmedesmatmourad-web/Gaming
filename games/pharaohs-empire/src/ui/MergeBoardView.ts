import Phaser from 'phaser';
import { MergeBoard } from '../merge/MergeBoard';

const CELL_SIZE = 64;

export class MergeBoardView {
  private cellSprites: Phaser.GameObjects.Rectangle[][] = [];
  private labels: Phaser.GameObjects.Text[][] = [];

  constructor(
    scene: Phaser.Scene,
    private board: MergeBoard,
    originX: number,
    originY: number,
    onCellTapped: (row: number, col: number) => void
  ) {
    for (let row = 0; row < board.getRows(); row++) {
      this.cellSprites[row] = [];
      this.labels[row] = [];
      for (let col = 0; col < board.getCols(); col++) {
        const x = originX + col * CELL_SIZE;
        const y = originY + row * CELL_SIZE;
        const rect = scene.add.rectangle(x, y, CELL_SIZE - 4, CELL_SIZE - 4, 0x8a5a2b).setInteractive();
        rect.on('pointerdown', () => onCellTapped(row, col));
        const label = scene.add.text(x - 10, y - 10, '', { fontSize: '14px', color: '#ffffff' });
        this.cellSprites[row][col] = rect;
        this.labels[row][col] = label;
      }
    }
    this.refresh();
  }

  setHighlight(row: number, col: number, on: boolean): void {
    this.cellSprites[row][col].setStrokeStyle(on ? 4 : 0, 0xffffff);
  }

  refresh(): void {
    for (let row = 0; row < this.board.getRows(); row++) {
      for (let col = 0; col < this.board.getCols(); col++) {
        const item = this.board.getItem({ row, col });
        this.labels[row][col].setText(item ? `T${item.tier}` : '');
      }
    }
  }

  destroy(): void {
    for (const row of this.cellSprites) {
      for (const rect of row) rect.destroy();
    }
    for (const row of this.labels) {
      for (const label of row) label.destroy();
    }
    this.cellSprites = [];
    this.labels = [];
  }
}
