export interface AnalyticsService {
  track(event: string, props?: Record<string, unknown>): void;
}
