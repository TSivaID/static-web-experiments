import { MockApiAnalytics } from './providers/beeceptor-analytics';
import { DummyAnalytics } from './providers/dummy-analytics';
import { AnalyticsService } from './service';
import { TriggerBinder } from './triggers';

export class WebAnalyticsFacade {
  async initialize(options?: Record<string, unknown>): Promise<AnalyticsService> {
    const mockApiAnalyticsWithFetch = new MockApiAnalytics({ useSendBeacon: false });
    const mockApiAnalyticsWithSendBeacon = new MockApiAnalytics({ useSendBeacon: true });
    const dummyAnalytics = new DummyAnalytics();
    const analyticsService = new AnalyticsService([
      mockApiAnalyticsWithFetch,
      mockApiAnalyticsWithSendBeacon,
      dummyAnalytics,
    ]);
    await analyticsService.initialize(options);
    const triggerBinder = new TriggerBinder(analyticsService);
    triggerBinder.initialize();
    return Promise.resolve(analyticsService);
  }
}
