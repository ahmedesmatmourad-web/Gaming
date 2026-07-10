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
