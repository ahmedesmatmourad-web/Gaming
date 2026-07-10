import { describe, it, expect } from 'vitest';
import { MergeBoard } from '../../src/merge/MergeBoard';

describe('MergeBoard', () => {
  it('places an item into an empty unlocked cell', () => {
    const board = new MergeBoard('monuments', 3, 3);
    expect(board.placeItem({ row: 0, col: 0 }, { track: 'monuments', tier: 1 })).toBe(true);
    expect(board.getItem({ row: 0, col: 0 })).toEqual({ track: 'monuments', tier: 1 });
  });

  it('refuses to place into an occupied cell', () => {
    const board = new MergeBoard('monuments', 3, 3);
    board.placeItem({ row: 0, col: 0 }, { track: 'monuments', tier: 1 });
    expect(board.placeItem({ row: 0, col: 0 }, { track: 'monuments', tier: 1 })).toBe(false);
  });

  it('merges two same-tier items into the next tier and clears the source', () => {
    const board = new MergeBoard('monuments', 3, 3);
    board.placeItem({ row: 0, col: 0 }, { track: 'monuments', tier: 1 });
    board.placeItem({ row: 0, col: 1 }, { track: 'monuments', tier: 1 });
    expect(board.attemptMerge({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true);
    expect(board.getItem({ row: 0, col: 0 })).toBeNull();
    expect(board.getItem({ row: 0, col: 1 })).toEqual({ track: 'monuments', tier: 2 });
  });

  it('refuses to merge items of different tiers', () => {
    const board = new MergeBoard('monuments', 3, 3);
    board.placeItem({ row: 0, col: 0 }, { track: 'monuments', tier: 1 });
    board.placeItem({ row: 0, col: 1 }, { track: 'monuments', tier: 2 });
    expect(board.attemptMerge({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(false);
  });

  it('refuses to merge past the max tier', () => {
    const board = new MergeBoard('monuments', 3, 3);
    board.placeItem({ row: 0, col: 0 }, { track: 'monuments', tier: 5 });
    board.placeItem({ row: 0, col: 1 }, { track: 'monuments', tier: 5 });
    expect(board.attemptMerge({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(false);
  });

  it('expands the board and unlocks new cells', () => {
    const board = new MergeBoard('monuments', 2, 2);
    board.expandBoard(3, 3);
    expect(board.getRows()).toBe(3);
    expect(board.getCols()).toBe(3);
    expect(board.isUnlocked({ row: 2, col: 2 })).toBe(true);
  });

  it('lists empty unlocked cells', () => {
    const board = new MergeBoard('monuments', 2, 2);
    board.placeItem({ row: 0, col: 0 }, { track: 'monuments', tier: 1 });
    expect(board.findEmptyUnlockedCells()).toHaveLength(3);
  });
});
