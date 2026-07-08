# Pharaoh's Empire — Web Validation MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the playable web-validation MVP of Pharaoh's Empire — an idle+merge game with dual merge tracks (Monuments, Treasury), region-expansion prestige, capped offline earnings with two rewarded-ad hooks, and IAP-ready economy architecture — deployable as a static HTML5 bundle for portal validation (Poki/CrazyGames-style).

**Architecture:** A Phaser 3 scene (`MainScene`) renders two independent `MergeBoard` grids side by side, backed by plain TypeScript domain classes (`Wallet`, `IdleProducer`, `RegionManager`, `ConstructionManager`) that hold all game logic and are unit-tested independently of Phaser's rendering. `AdService` and `AnalyticsService` are interfaces with mock/console implementations for the MVP, designed to be swapped for real portal SDKs without touching game logic.

**Tech Stack:** TypeScript, Phaser 3 (rendering), Vite (dev server + build), Vitest + jsdom (unit tests), npm. Chosen over Construct/Godot specifically because it's plain, AI-editable source code with no proprietary GUI-only project format — a hard requirement given solo, AI-assisted, non-technical development.

## Global Constraints

- Monetization is ads-only at launch (rewarded video only) — no IAP UI in this MVP, but the economy must support it later without rework (dual currency, expandable boards, speed-ups, cosmetic skins, live-ops events) — per game spec §9–10.
- No hard paywalls, ever — every gate has a free path (time or optional ad) — per game spec §10.
- Prestige is region expansion, never a destructive reset — the prior region's board and progress are never wiped — per game spec §3.
- UI is a split-screen dual board (both Monuments and Treasury boards visible simultaneously) — per game spec §6.
- Offline earnings are capped (default 4 hours) with two separate rewarded-ad hooks: double the accrued earnings, or extend the cap for the next offline period — per game spec §4.
- Platform target for this plan is HTML5 web only (validation phase) — the later iOS/Android wrap via Capacitor is explicitly out of scope here, per company strategy §4.
- Art is out of scope for this plan. All visuals in this MVP are placeholder (colored rectangles + tier-number text labels) so gameplay logic can be validated before final Gemini-generated art is integrated — per game spec §5.

---

## File Structure

```
gaming-company/games/pharaohs-empire/
├── package.json, tsconfig.json, vite.config.ts, index.html
├── src/
│   ├── main.ts                          — Phaser bootstrap
│   ├── config/GameConfig.ts             — Phaser game config
│   ├── data/
│   │   ├── ResourceTypes.ts             — currency enum
│   │   ├── MergeItemDefinitions.ts      — tier chains per track
│   │   └── RegionDefinitions.ts         — region 1/2 data
│   ├── economy/
│   │   ├── Wallet.ts                    — balances + transaction ledger
│   │   ├── IdleProducer.ts              — offline accrual + cap
│   │   └── OfflineClaimController.ts    — claim/double/extend orchestration
│   ├── merge/
│   │   ├── MergeItem.ts                 — item value type
│   │   ├── MergeBoard.ts                — grid, merge, expansion
│   │   └── SpawnController.ts           — idle-material-driven spawning
│   ├── construction/
│   │   ├── MonumentSlot.ts              — build timer, speed-up, skin
│   │   └── ConstructionManager.ts       — region-completion tracking
│   ├── prestige/
│   │   ├── LegacyMultiplier.ts          — permanent prestige bonus
│   │   └── RegionManager.ts             — active region, expansion
│   ├── ads/
│   │   ├── AdService.ts                 — interface
│   │   └── MockAdService.ts             — dev/test implementation
│   ├── analytics/
│   │   ├── AnalyticsService.ts          — interface
│   │   └── ConsoleAnalyticsService.ts   — dev/test implementation
│   ├── liveops/EventScheduler.ts        — time-boxed event slot
│   ├── persistence/SaveManager.ts       — localStorage save/load
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   └── MainScene.ts                 — orchestrates everything above
│   └── ui/
│       ├── ResourceBar.ts
│       └── MergeBoardView.ts
└── tests/  (mirrors src/, one test file per non-rendering module)
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.ts`, `tests/sanity.test.ts`

**Interfaces:**
- Produces: a working `npm test`, `npm run dev`, `npm run build` toolchain that every later task relies on.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "pharaohs-empire",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.0.0",
    "jsdom": "^25.0.0"
  },
  "dependencies": {
    "phaser": "^3.80.0"
  }
}
```

- [ ] **Step 2: Run `npm install`**

Run: `npm install` (from `gaming-company/games/pharaohs-empire/`)
Expected: completes without error, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist-tsc"
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    outDir: 'dist'
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Pharaoh's Empire (Dev Build)</title>
  </head>
  <body style="margin:0;background:#111;">
    <div id="game"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Create placeholder `src/main.ts`**

```ts
console.log("Pharaoh's Empire booting...");
export {};
```

- [ ] **Step 7: Create `tests/sanity.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('toolchain sanity', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 8: Run the test suite**

Run: `npm test`
Expected: PASS (1 test)

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src/main.ts tests/sanity.test.ts
git commit -m "chore: scaffold Phaser+TS+Vite+Vitest project"
```

---

### Task 2: Wallet (Dual-Currency Economy Core)

**Files:**
- Create: `src/data/ResourceTypes.ts`, `src/economy/Wallet.ts`
- Test: `tests/economy/Wallet.test.ts`

**Interfaces:**
- Consumes: nothing (foundational).
- Produces: `ResourceType` enum (`Gold`, `MonumentMaterials`, `RelicMaterials`, `AnkhGems`), `Wallet` class with `getBalance(resource)`, `add(resource, amount, reason)`, `spend(resource, amount, reason): boolean`, `getLedger()`, `serialize()`, `Wallet.deserialize(data)`.

- [ ] **Step 1: Create `src/data/ResourceTypes.ts`**

```ts
export enum ResourceType {
  Gold = 'gold',
  MonumentMaterials = 'monument_materials',
  RelicMaterials = 'relic_materials',
  AnkhGems = 'ankh_gems'
}
```

- [ ] **Step 2: Write the failing test**

```ts
// tests/economy/Wallet.test.ts
import { describe, it, expect } from 'vitest';
import { Wallet } from '../../src/economy/Wallet';
import { ResourceType } from '../../src/data/ResourceTypes';

describe('Wallet', () => {
  it('starts every resource at zero', () => {
    const wallet = new Wallet();
    expect(wallet.getBalance(ResourceType.Gold)).toBe(0);
  });

  it('adds to a balance and records a ledger entry', () => {
    const wallet = new Wallet();
    wallet.add(ResourceType.Gold, 50, 'idle_income');
    expect(wallet.getBalance(ResourceType.Gold)).toBe(50);
    expect(wallet.getLedger()).toHaveLength(1);
    expect(wallet.getLedger()[0]).toMatchObject({ resource: ResourceType.Gold, amount: 50, reason: 'idle_income' });
  });

  it('spends when sufficient balance exists', () => {
    const wallet = new Wallet();
    wallet.add(ResourceType.Gold, 100, 'idle_income');
    expect(wallet.spend(ResourceType.Gold, 40, 'speed_up')).toBe(true);
    expect(wallet.getBalance(ResourceType.Gold)).toBe(60);
  });

  it('refuses to spend more than the current balance', () => {
    const wallet = new Wallet();
    wallet.add(ResourceType.Gold, 10, 'idle_income');
    expect(wallet.spend(ResourceType.Gold, 40, 'speed_up')).toBe(false);
    expect(wallet.getBalance(ResourceType.Gold)).toBe(10);
  });

  it('round-trips through serialize/deserialize', () => {
    const wallet = new Wallet();
    wallet.add(ResourceType.AnkhGems, 5, 'reward');
    const restored = Wallet.deserialize(wallet.serialize());
    expect(restored.getBalance(ResourceType.AnkhGems)).toBe(5);
  });
});
```

- [ ] **Step 3: Run test, verify it fails**

Run: `npm test -- Wallet`
Expected: FAIL — `Cannot find module '../../src/economy/Wallet'`

- [ ] **Step 4: Implement `src/economy/Wallet.ts`**

```ts
import { ResourceType } from '../data/ResourceTypes';

export interface LedgerEntry {
  resource: ResourceType;
  amount: number;
  reason: string;
  timestamp: number;
}

export class Wallet {
  private balances: Map<ResourceType, number> = new Map();
  private ledger: LedgerEntry[] = [];

  getBalance(resource: ResourceType): number {
    return this.balances.get(resource) ?? 0;
  }

  add(resource: ResourceType, amount: number, reason: string): void {
    if (amount <= 0) return;
    this.balances.set(resource, this.getBalance(resource) + amount);
    this.ledger.push({ resource, amount, reason, timestamp: Date.now() });
  }

  spend(resource: ResourceType, amount: number, reason: string): boolean {
    if (amount <= 0) return false;
    const current = this.getBalance(resource);
    if (current < amount) return false;
    this.balances.set(resource, current - amount);
    this.ledger.push({ resource, amount: -amount, reason, timestamp: Date.now() });
    return true;
  }

  getLedger(): ReadonlyArray<LedgerEntry> {
    return this.ledger;
  }

  serialize(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const [key, value] of this.balances.entries()) {
      out[key] = value;
    }
    return out;
  }

  static deserialize(data: Record<string, number>): Wallet {
    const wallet = new Wallet();
    for (const [key, value] of Object.entries(data)) {
      wallet.balances.set(key as ResourceType, value);
    }
    return wallet;
  }
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `npm test -- Wallet`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add src/data/ResourceTypes.ts src/economy/Wallet.ts tests/economy/Wallet.test.ts
git commit -m "feat: add Wallet with dual-currency ledger"
```

---

### Task 3: IdleProducer (Offline Accrual + Cap)

**Files:**
- Create: `src/economy/IdleProducer.ts`
- Test: `tests/economy/IdleProducer.test.ts`

**Interfaces:**
- Consumes: nothing directly (pure calculation class).
- Produces: `IdleProducer` with `computeAccrual(ratesPerSecond: Record<string, number>, elapsedMs: number): Record<string, number>`, `getCapMs(): number`, `extendCapHours(hours: number): void`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/economy/IdleProducer.test.ts
import { describe, it, expect } from 'vitest';
import { IdleProducer } from '../../src/economy/IdleProducer';

describe('IdleProducer', () => {
  it('accrues linearly within the cap', () => {
    const producer = new IdleProducer(4);
    const result = producer.computeAccrual({ gold: 2 }, 10_000);
    expect(result.gold).toBe(20);
  });

  it('clamps elapsed time to the cap', () => {
    const producer = new IdleProducer(1);
    const twoHoursMs = 2 * 60 * 60 * 1000;
    const result = producer.computeAccrual({ gold: 1 }, twoHoursMs);
    expect(result.gold).toBe(60 * 60);
  });

  it('extends the cap for future accrual', () => {
    const producer = new IdleProducer(1);
    producer.extendCapHours(4);
    expect(producer.getCapMs()).toBe(5 * 60 * 60 * 1000);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- IdleProducer`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/economy/IdleProducer.ts`**

```ts
export class IdleProducer {
  private capMs: number;

  constructor(initialCapHours: number = 4) {
    this.capMs = initialCapHours * 60 * 60 * 1000;
  }

  getCapMs(): number {
    return this.capMs;
  }

  extendCapHours(additionalHours: number): void {
    this.capMs += additionalHours * 60 * 60 * 1000;
  }

  computeAccrual(ratesPerSecond: Record<string, number>, elapsedMs: number): Record<string, number> {
    const cappedMs = Math.min(elapsedMs, this.capMs);
    const seconds = cappedMs / 1000;
    const result: Record<string, number> = {};
    for (const [resource, rate] of Object.entries(ratesPerSecond)) {
      result[resource] = rate * seconds;
    }
    return result;
  }
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test -- IdleProducer`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/economy/IdleProducer.ts tests/economy/IdleProducer.test.ts
git commit -m "feat: add IdleProducer with capped offline accrual"
```

---

### Task 4: MergeItemDefinitions + MergeBoard (Grid, Merge, Expansion)

**Files:**
- Create: `src/data/MergeItemDefinitions.ts`, `src/merge/MergeItem.ts`, `src/merge/MergeBoard.ts`
- Test: `tests/merge/MergeBoard.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `TrackId = 'monuments' | 'treasury'`, `getMaxTier(track)`, `getTierName(track, tier)`, `MergeItem { track, tier }`, `MergeBoard` with `getRows()`, `getCols()`, `isUnlocked(coord)`, `getItem(coord)`, `placeItem(coord, item): boolean`, `findEmptyUnlockedCells(): CellCoord[]`, `attemptMerge(from, to): boolean`, `removeItem(coord)`, `expandBoard(newRows, newCols)`.

- [ ] **Step 1: Create `src/data/MergeItemDefinitions.ts`**

```ts
export type TrackId = 'monuments' | 'treasury';

export interface TierDefinition {
  tier: number;
  name: string;
}

const MONUMENTS_CHAIN: TierDefinition[] = [
  { tier: 1, name: 'Sand' },
  { tier: 2, name: 'Bricks' },
  { tier: 3, name: 'Limestone Block' },
  { tier: 4, name: 'Obelisk Piece' },
  { tier: 5, name: 'Monument-Ready Stone' }
];

const TREASURY_CHAIN: TierDefinition[] = [
  { tier: 1, name: 'Pottery Shard' },
  { tier: 2, name: 'Vase' },
  { tier: 3, name: 'Golden Relic' },
  { tier: 4, name: 'Treasury-Ready Artifact' }
];

const CHAINS: Record<TrackId, TierDefinition[]> = {
  monuments: MONUMENTS_CHAIN,
  treasury: TREASURY_CHAIN
};

export function getMaxTier(track: TrackId): number {
  return CHAINS[track].length;
}

export function getTierName(track: TrackId, tier: number): string {
  const def = CHAINS[track].find(t => t.tier === tier);
  if (!def) throw new Error(`Unknown tier ${tier} for track ${track}`);
  return def.name;
}
```

- [ ] **Step 2: Create `src/merge/MergeItem.ts`**

```ts
import { TrackId } from '../data/MergeItemDefinitions';

export interface MergeItem {
  track: TrackId;
  tier: number;
}
```

- [ ] **Step 3: Write the failing test**

```ts
// tests/merge/MergeBoard.test.ts
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
```

- [ ] **Step 4: Run test, verify it fails**

Run: `npm test -- MergeBoard`
Expected: FAIL — module not found

- [ ] **Step 5: Implement `src/merge/MergeBoard.ts`**

```ts
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
```

- [ ] **Step 6: Run test, verify it passes**

Run: `npm test -- MergeBoard`
Expected: PASS (7 tests)

- [ ] **Step 7: Commit**

```bash
git add src/data/MergeItemDefinitions.ts src/merge/MergeItem.ts src/merge/MergeBoard.ts tests/merge/MergeBoard.test.ts
git commit -m "feat: add MergeBoard with grid, merge, and expansion logic"
```

---

### Task 5: SpawnController (Idle-Material-Driven Spawning)

**Files:**
- Create: `src/merge/SpawnController.ts`
- Test: `tests/merge/SpawnController.test.ts`

**Interfaces:**
- Consumes: `MergeBoard` (Task 4).
- Produces: `SpawnController` with `spawnFromMaterials(availableMaterials: number): number`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/merge/SpawnController.test.ts
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
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- SpawnController`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/merge/SpawnController.ts`**

```ts
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
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test -- SpawnController`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/merge/SpawnController.ts tests/merge/SpawnController.test.ts
git commit -m "feat: add SpawnController for idle-material-driven item spawning"
```

---

### Task 6: MonumentSlot + ConstructionManager (Build Timer, Speed-Up, Skins)

**Files:**
- Create: `src/construction/MonumentSlot.ts`, `src/construction/ConstructionManager.ts`
- Test: `tests/construction/ConstructionManager.test.ts`

**Interfaces:**
- Consumes: `MergeItem` (Task 4).
- Produces: `MonumentSlot` with `isFilled()`, `fill(item, now?)`, `isComplete(now?)`, `speedUp()`, `applySkin(skinId)`, `getSkinId()`. `ConstructionManager` with `getSlots()`, `isRegionComplete(now?)`, `completedCount(now?)`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/construction/ConstructionManager.test.ts
import { describe, it, expect } from 'vitest';
import { MonumentSlot } from '../../src/construction/MonumentSlot';
import { ConstructionManager } from '../../src/construction/ConstructionManager';

describe('MonumentSlot', () => {
  it('is not complete immediately after filling', () => {
    const slot = new MonumentSlot(60_000);
    slot.fill({ track: 'monuments', tier: 5 }, 1_000);
    expect(slot.isComplete(1_500)).toBe(false);
  });

  it('completes once the build duration has elapsed', () => {
    const slot = new MonumentSlot(60_000);
    slot.fill({ track: 'monuments', tier: 5 }, 1_000);
    expect(slot.isComplete(61_000)).toBe(true);
  });

  it('completes instantly when sped up', () => {
    const slot = new MonumentSlot(60_000);
    slot.fill({ track: 'monuments', tier: 5 }, 1_000);
    slot.speedUp();
    expect(slot.isComplete(1_001)).toBe(true);
  });

  it('stores an applied cosmetic skin', () => {
    const slot = new MonumentSlot();
    slot.applySkin('golden_finish');
    expect(slot.getSkinId()).toBe('golden_finish');
  });
});

describe('ConstructionManager', () => {
  it('is not region-complete until every slot is complete', () => {
    const manager = new ConstructionManager(2, 60_000);
    const slots = manager.getSlots();
    slots[0].fill({ track: 'monuments', tier: 5 }, 0);
    slots[0].speedUp();
    expect(manager.isRegionComplete(1)).toBe(false);
    expect(manager.completedCount(1)).toBe(1);
  });

  it('is region-complete once every slot is complete', () => {
    const manager = new ConstructionManager(2, 60_000);
    for (const slot of manager.getSlots()) {
      slot.fill({ track: 'monuments', tier: 5 }, 0);
      slot.speedUp();
    }
    expect(manager.isRegionComplete(1)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- ConstructionManager`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/construction/MonumentSlot.ts`**

```ts
import { MergeItem } from '../merge/MergeItem';

export class MonumentSlot {
  private filledItem: MergeItem | null = null;
  private buildStartedAt: number | null = null;
  private skinId: string | null = null;

  constructor(private buildDurationMs: number = 60_000) {}

  isFilled(): boolean {
    return this.filledItem !== null;
  }

  fill(item: MergeItem, now: number = Date.now()): void {
    if (this.isFilled()) throw new Error('Monument slot already filled');
    this.filledItem = item;
    this.buildStartedAt = now;
  }

  isComplete(now: number = Date.now()): boolean {
    if (!this.isFilled() || this.buildStartedAt === null) return false;
    return now - this.buildStartedAt >= this.buildDurationMs;
  }

  speedUp(): void {
    if (!this.isFilled()) return;
    this.buildStartedAt = 0;
  }

  applySkin(skinId: string): void {
    this.skinId = skinId;
  }

  getSkinId(): string | null {
    return this.skinId;
  }
}
```

- [ ] **Step 4: Implement `src/construction/ConstructionManager.ts`**

```ts
import { MonumentSlot } from './MonumentSlot';

export class ConstructionManager {
  private slots: MonumentSlot[];

  constructor(slotCount: number, buildDurationMs: number = 60_000) {
    this.slots = Array.from({ length: slotCount }, () => new MonumentSlot(buildDurationMs));
  }

  getSlots(): ReadonlyArray<MonumentSlot> {
    return this.slots;
  }

  isRegionComplete(now: number = Date.now()): boolean {
    return this.slots.every(slot => slot.isComplete(now));
  }

  completedCount(now: number = Date.now()): number {
    return this.slots.filter(slot => slot.isComplete(now)).length;
  }
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `npm test -- ConstructionManager`
Expected: PASS (6 tests)

- [ ] **Step 6: Commit**

```bash
git add src/construction/MonumentSlot.ts src/construction/ConstructionManager.ts tests/construction/ConstructionManager.test.ts
git commit -m "feat: add MonumentSlot build timer with speed-up and skin support"
```

---

### Task 7: RegionDefinitions + LegacyMultiplier + RegionManager (Prestige)

**Files:**
- Create: `src/data/RegionDefinitions.ts`, `src/prestige/LegacyMultiplier.ts`, `src/prestige/RegionManager.ts`
- Test: `tests/prestige/RegionManager.test.ts`

**Interfaces:**
- Consumes: `ConstructionManager` (Task 6).
- Produces: `RegionManager` with `getActiveRegion()`, `getLegacyMultiplier()`, `getProductionRate(resource)`, `canExpand(now?)`, `expandToNextRegion(now?): boolean`, `getAllRegions()`.

- [ ] **Step 1: Create `src/data/RegionDefinitions.ts`**

```ts
export interface RegionDefinition {
  id: string;
  name: string;
  boardRows: number;
  boardCols: number;
  monumentSlotCount: number;
  baseProductionPerSecond: { gold: number; monument_materials: number; relic_materials: number };
  legacyMultiplierGain: number;
}

export const REGIONS: RegionDefinition[] = [
  {
    id: 'nile_delta',
    name: 'Nile Delta',
    boardRows: 4,
    boardCols: 4,
    monumentSlotCount: 3,
    baseProductionPerSecond: { gold: 1, monument_materials: 0.5, relic_materials: 0.3 },
    legacyMultiplierGain: 0.5
  },
  {
    id: 'valley_of_the_kings',
    name: 'Valley of the Kings',
    boardRows: 5,
    boardCols: 5,
    monumentSlotCount: 4,
    baseProductionPerSecond: { gold: 2, monument_materials: 1, relic_materials: 0.6 },
    legacyMultiplierGain: 0.75
  }
];
```

- [ ] **Step 2: Create `src/prestige/LegacyMultiplier.ts`**

```ts
export class LegacyMultiplier {
  private value: number = 1;

  getValue(): number {
    return this.value;
  }

  increaseBy(amount: number): void {
    this.value += amount;
  }

  applyTo(baseRate: number): number {
    return baseRate * this.value;
  }
}
```

- [ ] **Step 3: Write the failing test**

```ts
// tests/prestige/RegionManager.test.ts
import { describe, it, expect } from 'vitest';
import { RegionManager } from '../../src/prestige/RegionManager';

describe('RegionManager', () => {
  it('starts on the first region', () => {
    const manager = new RegionManager();
    expect(manager.getActiveRegion().definition.id).toBe('nile_delta');
  });

  it('refuses to expand until the region is complete', () => {
    const manager = new RegionManager();
    expect(manager.canExpand()).toBe(false);
    expect(manager.expandToNextRegion()).toBe(false);
  });

  it('expands to the next region once complete, keeping the old region as passive', () => {
    const manager = new RegionManager();
    for (const slot of manager.getActiveRegion().construction.getSlots()) {
      slot.fill({ track: 'monuments', tier: 5 }, 0);
      slot.speedUp();
    }
    expect(manager.expandToNextRegion(1)).toBe(true);
    expect(manager.getActiveRegion().definition.id).toBe('valley_of_the_kings');
    expect(manager.getAllRegions()[0].passiveOnly).toBe(true);
  });

  it('applies the legacy multiplier to production rates after expanding', () => {
    const manager = new RegionManager();
    for (const slot of manager.getActiveRegion().construction.getSlots()) {
      slot.fill({ track: 'monuments', tier: 5 }, 0);
      slot.speedUp();
    }
    manager.expandToNextRegion(1);
    // valley_of_the_kings base gold rate is 2, legacy gain from nile_delta is 0.5 -> multiplier 1.5
    expect(manager.getProductionRate('gold')).toBe(3);
  });
});
```

- [ ] **Step 4: Run test, verify it fails**

Run: `npm test -- RegionManager`
Expected: FAIL — module not found

- [ ] **Step 5: Implement `src/prestige/RegionManager.ts`**

```ts
import { REGIONS, RegionDefinition } from '../data/RegionDefinitions';
import { LegacyMultiplier } from './LegacyMultiplier';
import { ConstructionManager } from '../construction/ConstructionManager';

export interface RegionState {
  definition: RegionDefinition;
  construction: ConstructionManager;
  passiveOnly: boolean;
}

export class RegionManager {
  private regions: RegionState[] = [];
  private activeIndex: number = 0;
  private legacy: LegacyMultiplier = new LegacyMultiplier();

  constructor() {
    this.activateRegion(0);
  }

  private activateRegion(index: number): void {
    const definition = REGIONS[index];
    this.regions[index] = {
      definition,
      construction: new ConstructionManager(definition.monumentSlotCount),
      passiveOnly: false
    };
  }

  getActiveRegion(): RegionState {
    return this.regions[this.activeIndex];
  }

  getLegacyMultiplier(): LegacyMultiplier {
    return this.legacy;
  }

  getProductionRate(resource: 'gold' | 'monument_materials' | 'relic_materials'): number {
    const base = this.getActiveRegion().definition.baseProductionPerSecond[resource];
    return this.legacy.applyTo(base);
  }

  canExpand(now: number = Date.now()): boolean {
    if (this.activeIndex >= REGIONS.length - 1) return false;
    return this.getActiveRegion().construction.isRegionComplete(now);
  }

  expandToNextRegion(now: number = Date.now()): boolean {
    if (!this.canExpand(now)) return false;
    this.regions[this.activeIndex].passiveOnly = true;
    this.legacy.increaseBy(this.getActiveRegion().definition.legacyMultiplierGain);
    this.activeIndex += 1;
    this.activateRegion(this.activeIndex);
    return true;
  }

  getAllRegions(): ReadonlyArray<RegionState> {
    return this.regions;
  }
}
```

- [ ] **Step 6: Run test, verify it passes**

Run: `npm test -- RegionManager`
Expected: PASS (4 tests)

- [ ] **Step 7: Commit**

```bash
git add src/data/RegionDefinitions.ts src/prestige/LegacyMultiplier.ts src/prestige/RegionManager.ts tests/prestige/RegionManager.test.ts
git commit -m "feat: add RegionManager with region-expansion prestige"
```

---

### Task 8: AdService + MockAdService

**Files:**
- Create: `src/ads/AdService.ts`, `src/ads/MockAdService.ts`
- Test: `tests/ads/MockAdService.test.ts`

**Interfaces:**
- Produces: `AdResult = 'completed' | 'skipped'`, `AdService.showRewarded(placementId): Promise<AdResult>`, `MockAdService` implementing it with `setOutcome(outcome)`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/ads/MockAdService.test.ts
import { describe, it, expect } from 'vitest';
import { MockAdService } from '../../src/ads/MockAdService';

describe('MockAdService', () => {
  it('resolves completed by default', async () => {
    const ads = new MockAdService();
    expect(await ads.showRewarded('offline_double')).toBe('completed');
  });

  it('can be configured to resolve skipped', async () => {
    const ads = new MockAdService('skipped');
    expect(await ads.showRewarded('offline_double')).toBe('skipped');
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- MockAdService`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/ads/AdService.ts`**

```ts
export type AdResult = 'completed' | 'skipped';

export interface AdService {
  showRewarded(placementId: string): Promise<AdResult>;
}
```

- [ ] **Step 4: Implement `src/ads/MockAdService.ts`**

```ts
import { AdService, AdResult } from './AdService';

export class MockAdService implements AdService {
  constructor(private outcome: AdResult = 'completed', private delayMs: number = 0) {}

  setOutcome(outcome: AdResult): void {
    this.outcome = outcome;
  }

  async showRewarded(_placementId: string): Promise<AdResult> {
    if (this.delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delayMs));
    }
    return this.outcome;
  }
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `npm test -- MockAdService`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add src/ads/AdService.ts src/ads/MockAdService.ts tests/ads/MockAdService.test.ts
git commit -m "feat: add AdService interface with mock implementation"
```

---

### Task 9: OfflineClaimController (Double Earnings / Extend Cap)

**Files:**
- Create: `src/economy/OfflineClaimController.ts`
- Test: `tests/economy/OfflineClaimController.test.ts`

**Interfaces:**
- Consumes: `Wallet` (Task 2), `IdleProducer` (Task 3), `AdService` (Task 8).
- Produces: `OfflineClaimController` with `computeAccrual(rates, elapsedMs)`, `claim(accrued)`, `claimDoubled(accrued): Promise<{accrued, doubled}>`, `extendCap(hours): Promise<boolean>`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/economy/OfflineClaimController.test.ts
import { describe, it, expect } from 'vitest';
import { Wallet } from '../../src/economy/Wallet';
import { IdleProducer } from '../../src/economy/IdleProducer';
import { MockAdService } from '../../src/ads/MockAdService';
import { OfflineClaimController } from '../../src/economy/OfflineClaimController';
import { ResourceType } from '../../src/data/ResourceTypes';

describe('OfflineClaimController', () => {
  it('applies the base accrual on a plain claim', () => {
    const wallet = new Wallet();
    const controller = new OfflineClaimController(wallet, new IdleProducer(4), new MockAdService());
    controller.claim({ [ResourceType.Gold]: 100 });
    expect(wallet.getBalance(ResourceType.Gold)).toBe(100);
  });

  it('doubles the accrual when the ad completes', async () => {
    const wallet = new Wallet();
    const controller = new OfflineClaimController(wallet, new IdleProducer(4), new MockAdService('completed'));
    const result = await controller.claimDoubled({ [ResourceType.Gold]: 100 });
    expect(result.doubled).toBe(true);
    expect(wallet.getBalance(ResourceType.Gold)).toBe(200);
  });

  it('falls back to the base accrual when the ad is skipped', async () => {
    const wallet = new Wallet();
    const controller = new OfflineClaimController(wallet, new IdleProducer(4), new MockAdService('skipped'));
    const result = await controller.claimDoubled({ [ResourceType.Gold]: 100 });
    expect(result.doubled).toBe(false);
    expect(wallet.getBalance(ResourceType.Gold)).toBe(100);
  });

  it('extends the offline cap only when the ad completes', async () => {
    const idleProducer = new IdleProducer(4);
    const controller = new OfflineClaimController(new Wallet(), idleProducer, new MockAdService('completed'));
    expect(await controller.extendCap(4)).toBe(true);
    expect(idleProducer.getCapMs()).toBe(8 * 60 * 60 * 1000);
  });

  it('does not extend the cap when the ad is skipped', async () => {
    const idleProducer = new IdleProducer(4);
    const controller = new OfflineClaimController(new Wallet(), idleProducer, new MockAdService('skipped'));
    expect(await controller.extendCap(4)).toBe(false);
    expect(idleProducer.getCapMs()).toBe(4 * 60 * 60 * 1000);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- OfflineClaimController`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/economy/OfflineClaimController.ts`**

```ts
import { Wallet } from './Wallet';
import { IdleProducer } from './IdleProducer';
import { AdService } from '../ads/AdService';
import { ResourceType } from '../data/ResourceTypes';

export interface OfflineClaimResult {
  accrued: Record<string, number>;
  doubled: boolean;
}

export class OfflineClaimController {
  constructor(
    private wallet: Wallet,
    private idleProducer: IdleProducer,
    private adService: AdService
  ) {}

  computeAccrual(ratesPerSecond: Record<string, number>, elapsedMs: number): Record<string, number> {
    return this.idleProducer.computeAccrual(ratesPerSecond, elapsedMs);
  }

  claim(accrued: Record<string, number>): void {
    for (const [resource, amount] of Object.entries(accrued)) {
      this.wallet.add(resource as ResourceType, amount, 'offline_claim');
    }
  }

  async claimDoubled(accrued: Record<string, number>): Promise<OfflineClaimResult> {
    const result = await this.adService.showRewarded('offline_double');
    const multiplier = result === 'completed' ? 2 : 1;
    const finalAccrued: Record<string, number> = {};
    for (const [resource, amount] of Object.entries(accrued)) {
      finalAccrued[resource] = amount * multiplier;
    }
    this.claim(finalAccrued);
    return { accrued: finalAccrued, doubled: multiplier === 2 };
  }

  async extendCap(additionalHours: number): Promise<boolean> {
    const result = await this.adService.showRewarded('offline_extend');
    if (result === 'completed') {
      this.idleProducer.extendCapHours(additionalHours);
      return true;
    }
    return false;
  }
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test -- OfflineClaimController`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/economy/OfflineClaimController.ts tests/economy/OfflineClaimController.test.ts
git commit -m "feat: add OfflineClaimController with double-earnings and extend-cap ad hooks"
```

---

### Task 10: AnalyticsService + ConsoleAnalyticsService

**Files:**
- Create: `src/analytics/AnalyticsService.ts`, `src/analytics/ConsoleAnalyticsService.ts`
- Test: `tests/analytics/ConsoleAnalyticsService.test.ts`

**Interfaces:**
- Produces: `AnalyticsService.track(event, props?)`, `ConsoleAnalyticsService` implementing it with `getEvents(): RecordedEvent[]`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/analytics/ConsoleAnalyticsService.test.ts
import { describe, it, expect } from 'vitest';
import { ConsoleAnalyticsService } from '../../src/analytics/ConsoleAnalyticsService';

describe('ConsoleAnalyticsService', () => {
  it('records a tracked event with its properties', () => {
    const analytics = new ConsoleAnalyticsService();
    analytics.track('region_expanded', { regionId: 'valley_of_the_kings' });
    const events = analytics.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ event: 'region_expanded', props: { regionId: 'valley_of_the_kings' } });
  });

  it('records multiple events in order', () => {
    const analytics = new ConsoleAnalyticsService();
    analytics.track('monument_completed');
    analytics.track('ad_watched', { placement: 'offline_double' });
    expect(analytics.getEvents().map(e => e.event)).toEqual(['monument_completed', 'ad_watched']);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- ConsoleAnalyticsService`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/analytics/AnalyticsService.ts`**

```ts
export interface AnalyticsService {
  track(event: string, props?: Record<string, unknown>): void;
}
```

- [ ] **Step 4: Implement `src/analytics/ConsoleAnalyticsService.ts`**

```ts
import { AnalyticsService } from './AnalyticsService';

export interface RecordedEvent {
  event: string;
  props: Record<string, unknown>;
  timestamp: number;
}

export class ConsoleAnalyticsService implements AnalyticsService {
  private events: RecordedEvent[] = [];

  track(event: string, props: Record<string, unknown> = {}): void {
    const entry: RecordedEvent = { event, props, timestamp: Date.now() };
    this.events.push(entry);
    console.log(`[analytics] ${event}`, props);
  }

  getEvents(): ReadonlyArray<RecordedEvent> {
    return this.events;
  }
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `npm test -- ConsoleAnalyticsService`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add src/analytics/AnalyticsService.ts src/analytics/ConsoleAnalyticsService.ts tests/analytics/ConsoleAnalyticsService.test.ts
git commit -m "feat: add AnalyticsService interface with console/dev implementation"
```

---

### Task 11: EventScheduler (Live-Ops Event Slot)

**Files:**
- Create: `src/liveops/EventScheduler.ts`
- Test: `tests/liveops/EventScheduler.test.ts`

**Interfaces:**
- Produces: `LiveEvent { id, name, startTime, endTime, bonusMultiplier, cosmeticSkinId? }`, `EventScheduler.getActiveEvent(now?): LiveEvent | null`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/liveops/EventScheduler.test.ts
import { describe, it, expect } from 'vitest';
import { EventScheduler } from '../../src/liveops/EventScheduler';

describe('EventScheduler', () => {
  it('returns the event when now falls within its window', () => {
    const scheduler = new EventScheduler([
      { id: 'test_event', name: 'Test', startTime: 1000, endTime: 2000, bonusMultiplier: 2 }
    ]);
    expect(scheduler.getActiveEvent(1500)?.id).toBe('test_event');
  });

  it('returns null when now falls outside every event window', () => {
    const scheduler = new EventScheduler([
      { id: 'test_event', name: 'Test', startTime: 1000, endTime: 2000, bonusMultiplier: 2 }
    ]);
    expect(scheduler.getActiveEvent(500)).toBeNull();
    expect(scheduler.getActiveEvent(2000)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- EventScheduler`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/liveops/EventScheduler.ts`**

```ts
export interface LiveEvent {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  bonusMultiplier: number;
  cosmeticSkinId?: string;
}

export const SAMPLE_EVENTS: LiveEvent[] = [
  {
    id: 'nile_festival',
    name: 'Nile Festival',
    startTime: 0,
    endTime: 0,
    bonusMultiplier: 1.5,
    cosmeticSkinId: 'festival_banner'
  }
];

export class EventScheduler {
  constructor(private events: LiveEvent[] = SAMPLE_EVENTS) {}

  getActiveEvent(now: number = Date.now()): LiveEvent | null {
    return this.events.find(event => now >= event.startTime && now < event.endTime) ?? null;
  }
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test -- EventScheduler`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/liveops/EventScheduler.ts tests/liveops/EventScheduler.test.ts
git commit -m "feat: add EventScheduler live-ops event slot scaffold"
```

---

### Task 12: SaveManager (localStorage Persistence)

**Files:**
- Create: `src/persistence/SaveManager.ts`
- Test: `tests/persistence/SaveManager.test.ts`

**Interfaces:**
- Produces: `SaveData { version, wallet, lastActiveTimestamp, legacyMultiplier, activeRegionIndex }`, `SaveManager.save(data)`, `load(): SaveData | null`, `clear()`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/persistence/SaveManager.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '../../src/persistence/SaveManager';

describe('SaveManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when nothing has been saved', () => {
    expect(new SaveManager().load()).toBeNull();
  });

  it('round-trips a save through localStorage', () => {
    const manager = new SaveManager();
    const data = {
      version: 1,
      wallet: { gold: 120 },
      lastActiveTimestamp: 123456,
      legacyMultiplier: 1.5,
      activeRegionIndex: 1
    };
    manager.save(data);
    expect(manager.load()).toEqual(data);
  });

  it('rejects data saved under a different version', () => {
    localStorage.setItem('pharaohs_empire_save_v1', JSON.stringify({ version: 2 }));
    expect(new SaveManager().load()).toBeNull();
  });

  it('clears the save', () => {
    const manager = new SaveManager();
    manager.save({ version: 1, wallet: {}, lastActiveTimestamp: 0, legacyMultiplier: 1, activeRegionIndex: 0 });
    manager.clear();
    expect(manager.load()).toBeNull();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- SaveManager`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/persistence/SaveManager.ts`**

```ts
const SAVE_KEY = 'pharaohs_empire_save_v1';

export interface SaveData {
  version: number;
  wallet: Record<string, number>;
  lastActiveTimestamp: number;
  legacyMultiplier: number;
  activeRegionIndex: number;
}

export class SaveManager {
  save(data: SaveData): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  load(): SaveData | null {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as SaveData;
      if (parsed.version !== 1) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(SAVE_KEY);
  }
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test -- SaveManager`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/persistence/SaveManager.ts tests/persistence/SaveManager.test.ts
git commit -m "feat: add SaveManager for versioned localStorage persistence"
```

---

### Task 13: Phaser Scenes & UI Wiring (Split-Screen Dual Board)

**Files:**
- Create: `src/config/GameConfig.ts`, `src/scenes/BootScene.ts`, `src/scenes/MainScene.ts`, `src/ui/ResourceBar.ts`, `src/ui/MergeBoardView.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: `Wallet`, `RegionManager`, `MergeBoard`, `SpawnController`, `ResourceType` (all prior tasks).
- Produces: a running game in the browser. No new consumable interfaces for later tasks — this is the top-level integration point.

This task is UI/rendering glue that Phaser needs a real browser context to exercise, so its acceptance test is **manual verification in the browser**, not Vitest assertions — every other task in this plan has automated tests; this is the one exception, and it's the last one before the build/deploy task.

- [ ] **Step 1: Implement `src/ui/ResourceBar.ts`**

```ts
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
```

- [ ] **Step 2: Implement `src/ui/MergeBoardView.ts`**

```ts
import Phaser from 'phaser';
import { MergeBoard } from '../merge/MergeBoard';

const CELL_SIZE = 64;

export class MergeBoardView {
  private cellSprites: Phaser.GameObjects.Rectangle[][] = [];
  private labels: Phaser.GameObjects.Text[][] = [];
  private selected: { row: number; col: number } | null = null;

  constructor(
    scene: Phaser.Scene,
    private board: MergeBoard,
    originX: number,
    originY: number,
    private onCellTapped: (row: number, col: number) => void
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
}
```

- [ ] **Step 3: Implement `src/scenes/BootScene.ts`**

```ts
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.scene.start('MainScene');
  }
}
```

- [ ] **Step 4: Implement `src/scenes/MainScene.ts`**

```ts
import Phaser from 'phaser';
import { Wallet } from '../economy/Wallet';
import { IdleProducer } from '../economy/IdleProducer';
import { RegionManager } from '../prestige/RegionManager';
import { MergeBoard } from '../merge/MergeBoard';
import { SpawnController } from '../merge/SpawnController';
import { ResourceBar } from '../ui/ResourceBar';
import { MergeBoardView } from '../ui/MergeBoardView';
import { ResourceType } from '../data/ResourceTypes';

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
  private monumentsSelection: { row: number; col: number } | null = null;
  private treasurySelection: { row: number; col: number } | null = null;
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
    track: 'monuments' | 'treasury',
    row: number,
    col: number
  ): void {
    const selectionKey = track === 'monuments' ? 'monumentsSelection' : 'treasurySelection';
    const current = this[selectionKey];
    if (!current) {
      this[selectionKey] = { row, col };
      view.setHighlight(row, col, true);
      return;
    }
    view.setHighlight(current.row, current.col, false);
    if (current.row === row && current.col === col) {
      this[selectionKey] = null;
      return;
    }
    board.attemptMerge(current, { row, col });
    this[selectionKey] = null;
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
```

- [ ] **Step 5: Implement `src/config/GameConfig.ts`**

```ts
import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { MainScene } from '../scenes/MainScene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  backgroundColor: '#c9924a',
  parent: 'game',
  scene: [BootScene, MainScene]
};
```

- [ ] **Step 6: Replace `src/main.ts`**

```ts
import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';

new Phaser.Game(GameConfig);
```

- [ ] **Step 7: Run the full test suite to confirm nothing broke**

Run: `npm test`
Expected: PASS (all prior tests, ~35 total)

- [ ] **Step 8: Manually verify in the browser**

Run: `npm run dev`, open the printed localhost URL.
Verify:
- Two merge boards render side by side (Monuments left, Treasury right), each roughly 4x4 grid of tiles.
- The resource bar at the top shows "Gold: 0   Gems: 0" and the Gold number increases roughly once per second.
- Tiles begin appearing on both boards as materials accrue.
- Tapping two adjacent same-tier tiles on the same board merges them into the next tier (label changes, e.g. "T1" + "T1" → one cell shows "T2", the other clears).

- [ ] **Step 9: Commit**

```bash
git add src/config/GameConfig.ts src/scenes/BootScene.ts src/scenes/MainScene.ts src/ui/ResourceBar.ts src/ui/MergeBoardView.ts src/main.ts
git commit -m "feat: wire Phaser scenes into a playable split-screen dual-board MVP"
```

---

### Task 14: Build & Web-Validation Packaging

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: the full built game (all prior tasks).
- Produces: a deployable `dist/` static bundle.

- [ ] **Step 1: Run the production build**

Run: `npm run build`
Expected: completes without error, produces a `dist/` directory containing `index.html` and bundled JS/assets.

- [ ] **Step 2: Verify the built bundle runs**

Run: `npm run preview`, open the printed localhost URL.
Verify: the same split-screen dual-board gameplay from Task 13 works identically from the built bundle (not just the dev server).

- [ ] **Step 3: Create `README.md`**

```markdown
# Pharaoh's Empire — Web Validation MVP

## Setup
```
npm install
```

## Development
```
npm run dev
```

## Tests
```
npm test
```

## Production build
```
npm run build
npm run preview   # verify the built bundle locally before uploading
```

## Deploying for web validation
Zip the contents of `dist/` and upload according to the target portal's submission process (e.g., Poki, CrazyGames). Before submitting to a real portal:
- Replace `MockAdService` with the portal's actual rewarded-ad SDK (implements the same `AdService` interface — no game-logic changes needed).
- Replace `ConsoleAnalyticsService` with the portal's analytics SDK, or a real analytics backend (implements the same `AnalyticsService` interface).
- Swap placeholder graphics (colored rectangles + tier-number labels) for final Gemini-generated art.
```

- [ ] **Step 4: Commit**

```bash
git add README.md dist/.gitkeep
git commit -m "docs: add setup, build, and web-portal deployment instructions"
```

---

## Self-Review Notes

- **Spec coverage:** every game-spec section (§2 core loop, §3 prestige, §4 offline+ads, §6 UI, §9 monetization, §10 IAP-readiness principles except cultural theming/LTO *content*, which is intentionally left as a data-driven scaffold rather than actual event content — appropriate for an MVP) maps to a task above. Art (§5) and naming (§11) are explicitly out of scope per the Global Constraints.
- **Placeholder scan:** no TBD/TODO markers; every step has complete, runnable code.
- **Type consistency:** `ResourceType` string values match the string keys used in `RegionDefinition.baseProductionPerSecond` and `OfflineClaimController`; `MergeBoard`/`MergeItem`/`SpawnController` share the same `TrackId` and `CellCoord` types throughout; `RegionManager.getProductionRate` signature matches its call site in `MainScene`.
