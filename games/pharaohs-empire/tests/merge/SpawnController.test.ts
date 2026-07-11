import { describe, it, expect } from 'vitest';
import { MergeBoard } from '../../src/merge/MergeBoard';
import { SpawnController } from '../../src/merge/SpawnController';

describe('SpawnController', () => {
  it('spawns one base item per available material, up to empty cells', () => {
    const board = new MergeBoard('monuments', 2, 2);
    const spawner = new SpawnController(board, 'monuments');
    expect(spawner.spawnFromMaterials(2.9)).toBe(2);
    expect(board.findEmptyUnlockedCells()).toHaveLength(2);
  });

  it('never spawns more than the number of empty cells', () => {
    const board = new MergeBoard('monuments', 1, 1);
    const spawner = new SpawnController(board, 'monuments');
    expect(spawner.spawnFromMaterials(10)).toBe(1);
  });
});
