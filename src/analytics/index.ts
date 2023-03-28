import { MockApiAnalytics } from './providers/mock-api-analytics';
import { DummyAnalytics } from './providers/dummy-analytics';
import { MParticleAnalytics } from './providers/mparticle-analytics';
import { AnalyticsService } from './service';
import { TriggerBinder } from './triggers';

export class WebAnalyticsFacade {
  async initialize(options?: Record<string, unknown>): Promise<AnalyticsService> {
    const mParticleAnalytics = new MParticleAnalytics();
    const mockApiAnalyticsWithFetch = new MockApiAnalytics({ useSendBeacon: false });
    const mockApiAnalyticsWithSendBeacon = new MockApiAnalytics({ useSendBeacon: true });
    const dummyAnalytics = new DummyAnalytics();
    const analyticsService = new AnalyticsService([
      mParticleAnalytics,
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
