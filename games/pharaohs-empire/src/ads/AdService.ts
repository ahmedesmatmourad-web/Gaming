export type AdResult = 'completed' | 'skipped';

export interface AdService {
  showRewarded(placementId: string): Promise<AdResult>;
}
