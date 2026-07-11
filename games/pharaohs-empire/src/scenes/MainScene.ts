import Phaser from 'phaser';
import { Wallet } from '../economy/Wallet';
import { IdleProducer } from '../economy/IdleProducer';
import { RegionManager } from '../prestige/RegionManager';
import { MergeBoard } from '../merge/MergeBoard';
import { SpawnController } from '../merge/SpawnController';
import { ResourceBar } from '../ui/ResourceBar';
import { MergeBoardView } from '../ui/MergeBoardView';
import { ResourceType } from '../data/ResourceTypes';
import { SaveManager, SaveData } from '../persistence/SaveManager';
import { MockAdService } from '../ads/MockAdService';
import { AdService } from '../ads/AdService';
import { OfflineClaimController } from '../economy/OfflineClaimController';
import { ConsoleAnalyticsService } from '../analytics/ConsoleAnalyticsService';
import { AnalyticsService } from '../analytics/AnalyticsService';
import { OfflineClaimPanel } from '../ui/OfflineClaimPanel';
import { MonumentPanel } from '../ui/MonumentPanel';
import { TreasuryPanel } from '../ui/TreasuryPanel';

type Track = 'monuments' | 'treasury';
type Selection = { row: number; col: number } | null;

const CELL_SIZE = 64;
const BOARD_ORIGIN_X = 40;
const BOARD_ORIGIN_Y = 80;
const OFFLINE_THRESHOLD_MS = 60_000;

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
  private monumentPanel!: MonumentPanel;
  private treasuryPanel!: TreasuryPanel;

  private saveManager!: SaveManager;
  private adService!: AdService;
  private analytics!: AnalyticsService;
  private offlineController!: OfflineClaimController;
  private offlinePanel?: OfflineClaimPanel;
  private advanceButton?: { rect: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text };

  private selections: Record<Track, Selection> = {
    monuments: null,
    treasury: null
  };
  private lastTickAt = Date.now();
  private boundSave = () => this.saveGame();

  constructor() {
    super('MainScene');
  }

  create(): void {
    this.saveManager = new SaveManager();
    this.adService = new MockAdService();
    this.analytics = new ConsoleAnalyticsService();

    // Load persistence before anything reads the wallet, so a restored wallet
    // becomes the single instance every downstream system references.
    let save = this.saveManager.load();
    if (save) {
      // Restore is deliberately all-or-nothing: any failure (corrupted wallet,
      // out-of-range activeRegionIndex, etc.) discards the save and starts a
      // fresh game rather than crashing on boot. Losing a rare corrupted save
      // is far better for a returning player than a blank/broken screen. Reset
      // every restored field back to a clean default in the catch, because
      // restoreState() mutates RegionManager in place and may have thrown
      // partway through, leaving it half-initialized.
      try {
        this.wallet = Wallet.deserialize(save.wallet);
        // Restore prestige progress before buildBoards() reads the active region to
        // size the boards, so a returning player lands in the correct region at the
        // correct legacy multiplier (and offline accrual uses the right rates).
        this.regionManager.restoreState(save.activeRegionIndex, save.legacyMultiplier);
        this.idleProducer.setCapMs(save.offlineCapMs);
      } catch (err) {
        console.warn('Failed to restore save; starting a fresh game.', err);
        this.wallet = new Wallet();
        this.regionManager = new RegionManager();
        this.idleProducer = new IdleProducer(4);
        save = null;
      }
    }
    this.offlineController = new OfflineClaimController(this.wallet, this.idleProducer, this.adService);
    this.analytics.track('session_start', { hadSave: !!save });

    this.resourceBar = new ResourceBar(this, this.wallet, 20, 20);
    this.buildBoards();
    this.setupPersistence();

    // Only a returning player with a genuine elapsed gap sees the offline panel.
    // A true first-ever session (save === null) drops straight into the board.
    if (save) {
      const elapsedMs = Date.now() - save.lastActiveTimestamp;
      if (elapsedMs >= OFFLINE_THRESHOLD_MS) {
        this.showOfflinePanel(elapsedMs);
      }
    }
  }

  private buildBoards(): void {
    const region = this.regionManager.getActiveRegion().definition;
    this.monumentsBoard = new MergeBoard('monuments', region.boardRows, region.boardCols);
    this.treasuryBoard = new MergeBoard('treasury', region.boardRows, region.boardCols);
    this.monumentsSpawner = new SpawnController(this.monumentsBoard, 'monuments');
    this.treasurySpawner = new SpawnController(this.treasuryBoard, 'treasury');

    const treasuryX = BOARD_ORIGIN_X + region.boardCols * CELL_SIZE + 40;
    this.monumentsView = new MergeBoardView(this, this.monumentsBoard, BOARD_ORIGIN_X, BOARD_ORIGIN_Y, (row, col) =>
      this.handleCellTap(this.monumentsBoard, this.monumentsView, 'monuments', row, col)
    );
    this.treasuryView = new MergeBoardView(this, this.treasuryBoard, treasuryX, BOARD_ORIGIN_Y, (row, col) =>
      this.handleCellTap(this.treasuryBoard, this.treasuryView, 'treasury', row, col)
    );

    const panelY = BOARD_ORIGIN_Y + region.boardRows * CELL_SIZE + 60;
    this.monumentPanel = new MonumentPanel(
      this,
      this.monumentsBoard,
      this.regionManager.getActiveRegion().construction,
      this.adService,
      this.analytics,
      BOARD_ORIGIN_X,
      panelY,
      () => this.monumentsView.refresh()
    );

    this.treasuryPanel = new TreasuryPanel(
      this,
      this.treasuryBoard,
      this.wallet,
      this.analytics,
      treasuryX,
      panelY,
      () => {
        this.treasuryView.refresh();
        this.resourceBar.refresh();
      }
    );
  }

  private setupPersistence(): void {
    window.addEventListener('beforeunload', this.boundSave);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('beforeunload', this.boundSave);
    });
    this.time.addEvent({ delay: 30_000, loop: true, callback: () => this.saveGame() });
  }

  private saveGame(): void {
    const regions = this.regionManager.getAllRegions();
    const activeRegionIndex = regions.indexOf(this.regionManager.getActiveRegion());
    const data: SaveData = {
      version: 1,
      wallet: this.wallet.serialize(),
      lastActiveTimestamp: Date.now(),
      legacyMultiplier: this.regionManager.getLegacyMultiplier().getValue(),
      activeRegionIndex,
      offlineCapMs: this.idleProducer.getCapMs()
    };
    this.saveManager.save(data);
  }

  private currentRegionRates(): Record<string, number> {
    return {
      gold: this.regionManager.getProductionRate('gold'),
      monument_materials: this.regionManager.getProductionRate('monument_materials'),
      relic_materials: this.regionManager.getProductionRate('relic_materials')
    };
  }

  private showOfflinePanel(elapsedMs: number): void {
    // Bind the recompute to the ORIGINAL offline gap: after the player watches an
    // ad to extend the cap, the accrual for the SAME elapsed window is recomputed
    // against the now-larger cap, so an extension that unclamps the current session
    // pays off immediately (not just next time).
    const recomputeAccrued = () => this.offlineController.computeAccrual(this.currentRegionRates(), elapsedMs);
    const accrued = recomputeAccrued();
    this.offlinePanel = new OfflineClaimPanel(
      this,
      this.offlineController,
      this.analytics,
      accrued,
      recomputeAccrued,
      () => {
        this.offlinePanel = undefined;
        this.resourceBar.refresh();
      }
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

  private updateAdvanceButton(): void {
    const canExpand = this.regionManager.canExpand();
    if (canExpand && !this.advanceButton) {
      const y = this.scale.height - 80;
      const rect = this.add
        .rectangle(BOARD_ORIGIN_X, y, 300, 48, 0x2e7d32)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0xf2d16b)
        .setInteractive();
      const label = this.add.text(BOARD_ORIGIN_X + 12, y + 14, 'Advance to Next Region', {
        fontSize: '18px',
        color: '#ffffff'
      });
      rect.on('pointerdown', () => this.handleAdvance());
      this.advanceButton = { rect, label };
    } else if (!canExpand && this.advanceButton) {
      this.destroyAdvanceButton();
    }
  }

  private destroyAdvanceButton(): void {
    if (!this.advanceButton) return;
    this.advanceButton.rect.destroy();
    this.advanceButton.label.destroy();
    this.advanceButton = undefined;
  }

  private handleAdvance(): void {
    if (!this.regionManager.expandToNextRegion()) return;
    this.analytics.track('region_expanded', {
      newRegionId: this.regionManager.getActiveRegion().definition.id
    });
    this.destroyAdvanceButton();
    this.rebuildForActiveRegion();
  }

  private rebuildForActiveRegion(): void {
    // Tear down the old region's Phaser view objects and build fresh boards
    // sized to the new region. The old region's RegionState + ConstructionManager
    // remain intact inside RegionManager regardless of whether it's still drawn.
    this.monumentsView.destroy();
    this.treasuryView.destroy();
    this.monumentPanel.destroy();
    this.treasuryPanel.destroy();
    this.selections = { monuments: null, treasury: null };
    this.buildBoards();
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
    this.monumentPanel.refresh();
    this.updateAdvanceButton();
  }
}
