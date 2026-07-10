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
