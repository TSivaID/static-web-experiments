import { BeeceptorAnalytics } from './providers/beeceptor-analytics';
import { DummyAnalytics } from './providers/dummy-analytics';
import { AnalyticsService } from './service';

export class WebAnalyticsFacade {
  async initialize(options?: Record<string, unknown>): Promise<void> {
    const beeceptorAnalytics = new BeeceptorAnalytics();
    const dummyAnalytics = new DummyAnalytics();
    const analyticsService = new AnalyticsService([beeceptorAnalytics, dummyAnalytics]);
    await analyticsService.initialize(options);
  }
}
