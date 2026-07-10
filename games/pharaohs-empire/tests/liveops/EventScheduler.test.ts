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
