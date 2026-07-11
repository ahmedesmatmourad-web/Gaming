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

  it('sets the cap to an exact value via setCapMs', () => {
    const producer = new IdleProducer(4);
    const restored = 7 * 60 * 60 * 1000;
    producer.setCapMs(restored);
    expect(producer.getCapMs()).toBe(restored);
  });

  it('extends correctly on top of a restored cap', () => {
    const producer = new IdleProducer(4);
    producer.setCapMs(5 * 60 * 60 * 1000);
    producer.extendCapHours(2);
    expect(producer.getCapMs()).toBe(7 * 60 * 60 * 1000);
  });

  it('returns zero accrual with zero elapsed time', () => {
    const producer = new IdleProducer(4);
    const result = producer.computeAccrual({ gold: 100 }, 0);
    expect(result.gold).toBe(0);
  });

  it('returns zero accrual with zero rate', () => {
    const producer = new IdleProducer(4);
    const result = producer.computeAccrual({ gold: 0 }, 10_000);
    expect(result.gold).toBe(0);
  });

  it('computes accrual for multiple resources correctly', () => {
    const producer = new IdleProducer(4);
    const result = producer.computeAccrual({ gold: 2, wood: 3, stone: 1 }, 10_000);
    expect(result.gold).toBe(20);
    expect(result.wood).toBe(30);
    expect(result.stone).toBe(10);
  });

  it('does not further reduce accrual at exactly the cap boundary', () => {
    const producer = new IdleProducer(1);
    const capMs = producer.getCapMs();
    const result = producer.computeAccrual({ gold: 1 }, capMs);
    expect(result.gold).toBe(60 * 60); // 1 second/rate * 3600 seconds
  });
});
