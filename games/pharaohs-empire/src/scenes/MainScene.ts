import Phaser from 'phaser';
import { Wallet } from '../economy/Wallet';
import { IdleProducer } from '../economy/IdleProducer';
import { RegionManager } from '../prestige/RegionManager';
import { MergeBoard } from '../merge/MergeBoard';
import { SpawnController } from '../merge/SpawnController';
import { ResourceBar } from '../ui/ResourceBar';
import { MergeBoardView } from '../ui/MergeBoardView';
import { ResourceType } from '../data/ResourceTypes';

type Track = 'monuments' | 'treasury';
type Selection = { row: number; col: number } | null;

export class MainScene extends Phaser.Scene {
  private wallet = new Wallet();
  private idleProducer = new IdleProducer(4);
  private regionManager = new RegionManager();
  private monumentsBoard!: MergeBoard;
  private treasuryBoard!: MergeBoard;
  private monumentsSpawner!: SpawnController;
  private treasurySpawner!: SpawnController;
  private resourceBar!: ResourceBar;
  private monumentsView!: MergeBoardView;
  private treasuryView!: MergeBoardView;
  private selections: Record<Track, Selection> = {
    monuments: null,
    treasury: null
  };
  private lastTickAt = Date.now();

  constructor() {
    super('MainScene');
  }

  create(): void {
    const region = this.regionManager.getActiveRegion().definition;
    this.monumentsBoard = new MergeBoard('monuments', region.boardRows, region.boardCols);
    this.treasuryBoard = new MergeBoard('treasury', region.boardRows, region.boardCols);
    this.monumentsSpawner = new SpawnController(this.monumentsBoard, 'monuments');
    this.treasurySpawner = new SpawnController(this.treasuryBoard, 'treasury');

    this.resourceBar = new ResourceBar(this, this.wallet, 20, 20);
    this.monumentsView = new MergeBoardView(this, this.monumentsBoard, 40, 80, (row, col) =>
      this.handleCellTap(this.monumentsBoard, this.monumentsView, 'monuments', row, col)
    );
    this.treasuryView = new MergeBoardView(this, this.treasuryBoard, 400, 80, (row, col) =>
      this.handleCellTap(this.treasuryBoard, this.treasuryView, 'treasury', row, col)
    );
  }

  private handleCellTap(
    board: MergeBoard,
    view: MergeBoardView,
    track: Track,
    row: number,
    col: number
  ): void {
    const current = this.selections[track];
    if (!current) {
      this.selections[track] = { row, col };
      view.setHighlight(row, col, true);
      return;
    }
    view.setHighlight(current.row, current.col, false);
    if (current.row === row && current.col === col) {
      this.selections[track] = null;
      return;
    }
    board.attemptMerge(current, { row, col });
    this.selections[track] = null;
    view.refresh();
  }

  update(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastTickAt;
    if (elapsedMs < 1000) return;
    this.lastTickAt = now;

    this.wallet.add(ResourceType.Gold, this.regionManager.getProductionRate('gold'), 'idle_income');
    this.wallet.add(ResourceType.MonumentMaterials, this.regionManager.getProductionRate('monument_materials'), 'idle_income');
    this.wallet.add(ResourceType.RelicMaterials, this.regionManager.getProductionRate('relic_materials'), 'idle_income');

    const monumentMaterials = this.wallet.getBalance(ResourceType.MonumentMaterials);
    const spawnedMonuments = this.monumentsSpawner.spawnFromMaterials(monumentMaterials);
    if (spawnedMonuments > 0) this.wallet.spend(ResourceType.MonumentMaterials, spawnedMonuments, 'spawn_item');

    const relicMaterials = this.wallet.getBalance(ResourceType.RelicMaterials);
    const spawnedTreasury = this.treasurySpawner.spawnFromMaterials(relicMaterials);
    if (spawnedTreasury > 0) this.wallet.spend(ResourceType.RelicMaterials, spawnedTreasury, 'spawn_item');

    this.resourceBar.refresh();
    this.monumentsView.refresh();
    this.treasuryView.refresh();
  }
}
