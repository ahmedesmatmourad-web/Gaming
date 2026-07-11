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

  private inBounds({ row, col }: CellCoord): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  isUnlocked(coord: CellCoord): boolean {
    if (!this.inBounds(coord)) return false;
    return this.unlockedCells[coord.row][coord.col];
  }

  getItem(coord: CellCoord): MergeItem | null {
    if (!this.inBounds(coord)) return null;
    return this.cells[coord.row][coord.col];
  }

  placeItem(coord: CellCoord, item: MergeItem): boolean {
    if (!this.inBounds(coord)) return false;
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
    // A "merge" onto the same cell would validate trivially (an item always
    // matches its own track/tier) and then the upgraded write to `to` would be
    // immediately clobbered by the `from` clear-out, silently deleting the
    // item. Reject same-cell merges outright.
    if (from.row === to.row && from.col === to.col) return false;
    const fromItem = this.getItem(from);
    const toItem = this.getItem(to);
    if (!fromItem || !toItem) return false;
    if (fromItem.track !== toItem.track || fromItem.tier !== toItem.tier) return false;
    // Use the item's own track for the max-tier check, not the board's
    // constructor-supplied track — a board can host items whose track differs
    // from `this.track`, and checking against the wrong chain's max tier
    // would allow (or wrongly refuse) merges based on the wrong tier ceiling.
    if (fromItem.tier >= getMaxTier(fromItem.track)) return false;
    this.cells[to.row][to.col] = { track: toItem.track, tier: toItem.tier + 1 };
    this.cells[from.row][from.col] = null;
    return true;
  }

  removeItem(coord: CellCoord): MergeItem | null {
    if (!this.inBounds(coord)) return null;
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
