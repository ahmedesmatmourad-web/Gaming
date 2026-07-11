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
