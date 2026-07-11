import { AnalyticsService } from './AnalyticsService';

export interface RecordedEvent {
  event: string;
  props: Record<string, unknown>;
  timestamp: number;
}

export class ConsoleAnalyticsService implements AnalyticsService {
  private events: RecordedEvent[] = [];

  track(event: string, props: Record<string, unknown> = {}): void {
    const entry: RecordedEvent = { event, props, timestamp: Date.now() };
    this.events.push(entry);
    console.log(`[analytics] ${event}`, props);
  }

  getEvents(): ReadonlyArray<RecordedEvent> {
    return this.events;
  }
}
