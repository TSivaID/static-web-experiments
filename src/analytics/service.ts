import { IAnalyticsProvider } from './providers/ianalytics-provider';
import { logger } from '../utils/logger';

export class AnalyticsService {
  private analyticsProviders: Array<IAnalyticsProvider>;
  protected isInitialized = false;

  constructor(providers: Array<IAnalyticsProvider>) {
    this.analyticsProviders = providers;
  }

  async initialize(options?: Record<string, unknown>): Promise<void> {
    if (this.isInitialized) {
      logger.warn('AnalyticsService already initialized');
      return;
    }
    await Promise.all(
      this.analyticsProviders.map((provider: IAnalyticsProvider) => {
        provider.initialize(options);
        logger.info(`AnalyticsService: ${provider.name} initialized`);
      })
    );
    this.isInitialized = true;
  }

  async trackEvent(eventName: string, data?: Record<string, unknown>): Promise<void> {
    logger.info(`AnalyticsService.track called with eventName=${eventName} data=${JSON.stringify(data)}`);
    await Promise.all(
      this.analyticsProviders.map((provider: IAnalyticsProvider) => provider.trackEvent(eventName, data))
    );
  }
}
