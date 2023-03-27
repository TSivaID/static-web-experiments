import { IAnalyticsProvider } from './ianalytics-provider';
import { logger } from '../../utils/logger';

/**
 * DummyAnalytics is a simple Mock analytics provider that just logs to the console.
 * This is useful for testing analytics in a development environment.
 */
export class DummyAnalytics implements IAnalyticsProvider {
  public readonly name = 'DummyAnalytics';

  initialize(): void {
    logger.info('DummyAnalytics initialized');
  }

  async trackEvent(eventName: string, data?: Record<string, unknown>): Promise<void> {
    if (data?.dummy_analytics) {
      logger.info(`DummyAnalytics tracked event: ${eventName} with data: ${JSON.stringify(data)}`);
    }
    return Promise.resolve();
  }
}
