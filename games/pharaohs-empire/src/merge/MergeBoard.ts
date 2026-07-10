import { MergeItem } from './MergeItem';
import { getMaxTier, TrackId } from '../data/MergeItemDefinitions';

export interface CellCoord {
  row: number;
  col: number;
}

export class MergeBoard {
  private cells: (MergeItem | null)[][];
  private unlockedCells: boolean[][];

  constructor(private track: TrackId, private rows: number, private cols: number) {
    this.cells = Array.from({ length: rows }, () => Array(cols).fill(null));
    this.unlockedCells = Array.from({ length: rows }, () => Array(cols).fill(true));
  }

  getRows(): number { return this.rows; }
  getCols(): number { return this.cols; }

  isUnlocked({ row, col }: CellCoord): boolean {
    return this.unlockedCells[row][col];
  }

  getItem({ row, col }: CellCoord): MergeItem | null {
    return this.cells[row][col];
  }

  placeItem(coord: CellCoord, item: MergeItem): boolean {
    if (!this.isUnlocked(coord)) return false;
    if (this.cells[coord.row][coord.col] !== null) return false;
    this.cells[coord.row][coord.col] = item;
    return true;
  }

  findEmptyUnlockedCells(): CellCoord[] {
    const empty: CellCoord[] = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.unlockedCells[row][col] && this.cells[row][col] === null) {
          empty.push({ row, col });
        }
      }
    }
    return empty;
  }

  attemptMerge(from: CellCoord, to: CellCoord): boolean {
    const fromItem = this.getItem(from);
    const toItem = this.getItem(to);
    if (!fromItem || !toItem) return false;
    if (fromItem.track !== toItem.track || fromItem.tier !== toItem.tier) return false;
    if (fromItem.tier >= getMaxTier(this.track)) return false;
    this.cells[to.row][to.col] = { track: toItem.track, tier: toItem.tier + 1 };
    this.cells[from.row][from.col] = null;
    return true;
  }

  removeItem(coord: CellCoord): MergeItem | null {
    const item = this.cells[coord.row][coord.col];
    this.cells[coord.row][coord.col] = null;
    return item;
  }

  expandBoard(newRows: number, newCols: number): void {
    for (let row = 0; row < newRows; row++) {
      if (!this.cells[row]) {
        this.cells[row] = Array(newCols).fill(null);
        this.unlockedCells[row] = Array(newCols).fill(true);
      } else {
        for (let col = this.cols; col < newCols; col++) {
          this.cells[row][col] = null;
          this.unlockedCells[row][col] = true;
        }
      }
    }
    this.rows = Math.max(this.rows, newRows);
    this.cols = Math.max(this.cols, newCols);
  }
}
