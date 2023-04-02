import { MockApiAnalytics } from './providers/mock-api-analytics';
import { DummyAnalytics } from './providers/dummy-analytics';
import { MParticleAnalytics } from './providers/mparticle-analytics';
import { AnalyticsService } from './service';
import { TriggerBinder } from './triggers';
import { DataLayerManager } from './data-layer-manager';
import { EventsVariablesParser } from './events-variables-parser';
import { logger } from '../utils/logger';

export class WebAnalyticsFacade {
  async initialize(options?: Record<string, unknown>): Promise<AnalyticsService> {
    // Initialize analytics providers
    const mParticleAnalytics = new MParticleAnalytics({ shouldForceUpload: false });
    const mockApiAnalyticsWithFetch = new MockApiAnalytics({ useSendBeacon: false });
    const mockApiAnalyticsWithSendBeacon = new MockApiAnalytics({ useSendBeacon: true });
    const dummyAnalytics = new DummyAnalytics();

    // Initialize analytics service
    const analyticsService = new AnalyticsService([
      mParticleAnalytics,
      mockApiAnalyticsWithFetch,
      mockApiAnalyticsWithSendBeacon,
      dummyAnalytics,
    ]);
    await analyticsService.initialize(options);

    // Initialize events variables parser
    const eventVariablesParser = new EventsVariablesParser();

    // Initialize triggers and data layer manager
    const triggerBinder = new TriggerBinder(analyticsService, eventVariablesParser);
    triggerBinder.initialize();
    const dataLayerManager = new DataLayerManager(analyticsService, eventVariablesParser);
    dataLayerManager.initialize();

    logger.info('Analytics initialized');
    return Promise.resolve(analyticsService);
  }
}
