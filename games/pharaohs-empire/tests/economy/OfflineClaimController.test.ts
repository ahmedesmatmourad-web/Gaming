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
