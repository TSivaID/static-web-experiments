export interface IAnalyticsProvider {
  name: string;
  initialize(options?: Record<string, unknown>): void;
  trackEvent(eventName: string, data?: Record<string, unknown>): Promise<void>;
}
