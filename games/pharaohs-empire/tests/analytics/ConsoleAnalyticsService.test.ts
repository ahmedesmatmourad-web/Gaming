import { describe, it, expect } from 'vitest';
import { ConsoleAnalyticsService } from '../../src/analytics/ConsoleAnalyticsService';

describe('ConsoleAnalyticsService', () => {
  it('records a tracked event with its properties', () => {
    const analytics = new ConsoleAnalyticsService();
    analytics.track('region_expanded', { regionId: 'valley_of_the_kings' });
    const events = analytics.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ event: 'region_expanded', props: { regionId: 'valley_of_the_kings' } });
  });

  it('records multiple events in order', () => {
    const analytics = new ConsoleAnalyticsService();
    analytics.track('monument_completed');
    analytics.track('ad_watched', { placement: 'offline_double' });
    expect(analytics.getEvents().map(e => e.event)).toEqual(['monument_completed', 'ad_watched']);
  });
});
