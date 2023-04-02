import { MockApiAnalytics } from './providers/mock-api-analytics';
import { DummyAnalytics } from './providers/dummy-analytics';
import { MParticleAnalytics } from './providers/mparticle-analytics';
import { AnalyticsService } from './service';
import { TriggerBinder } from './triggers';
import { DataLayerManager } from './data-layer-manager';
import { logger } from '../utils/logger';

export class WebAnalyticsFacade {
  async initialize(options?: Record<string, unknown>): Promise<AnalyticsService> {
    const mParticleAnalytics = new MParticleAnalytics({ shouldForceUpload: false });
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
    const dataLayerManager = new DataLayerManager(analyticsService);
    dataLayerManager.initialize();
    logger.info('Analytics initialized');
    return Promise.resolve(analyticsService);
  }
}
