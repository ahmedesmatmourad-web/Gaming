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
