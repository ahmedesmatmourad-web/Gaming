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
