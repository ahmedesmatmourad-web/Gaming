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
