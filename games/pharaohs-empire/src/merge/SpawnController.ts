import { MergeBoard } from './MergeBoard';
import { TrackId } from '../data/MergeItemDefinitions';

export class SpawnController {
  constructor(private board: MergeBoard, private track: TrackId) {}

  spawnFromMaterials(availableMaterials: number): number {
    const emptyCells = this.board.findEmptyUnlockedCells();
    const spawnCount = Math.min(Math.floor(availableMaterials), emptyCells.length);
    for (let i = 0; i < spawnCount; i++) {
      this.board.placeItem(emptyCells[i], { track: this.track, tier: 1 });
    }
    return spawnCount;
  }
}
