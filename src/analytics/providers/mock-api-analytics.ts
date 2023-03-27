import { IAnalyticsProvider } from './ianalytics-provider';
import { logger } from '../../utils/logger';

interface MockApiAnalyticsConfig {
  useSendBeacon?: boolean;
}

/**
 * MockApiAnalytics is a simple Mock analytics provider that sends events to a
 * Mock API endpoint. This is useful for testing analytics in a development environment.
 */
export class MockApiAnalytics implements IAnalyticsProvider {
  public readonly name = 'MockApiAnalytics';
  private readonly endpoint: string = 'https://static-web-experiments.free.beeceptor.com/events/';
  private readonly useSendBeacon: boolean;

  constructor(config?: MockApiAnalyticsConfig) {
    this.useSendBeacon = config?.useSendBeacon === true ? true : false;
  }

  initialize(): void {
    logger.info('MockApiAnalytics initialized');
  }

  async trackEvent(eventName: string, data?: Record<string, unknown>): Promise<void> {
    if (!data?.mock_api_analytics) return Promise.resolve();
    const providerData = { ...data.mock_api_analytics, useSendBeacon: this.useSendBeacon };

    if (this.useSendBeacon && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ eventName, data: providerData })], { type: 'text/plain' });

      const success = navigator.sendBeacon(`${this.endpoint}`, blob);

      if (success) {
        logger.info(
          `MockApiAnalytics sent event using sendBeacon: ${eventName} with data: ${JSON.stringify(providerData)}`
        );
      } else {
        logger.error(`MockApiAnalytics failed to send event using sendBeacon: ${eventName}`);
      }

      return Promise.resolve();
    } else {
      try {
        logger.info(`MockApiAnalytics sending event: ${eventName} with data: ${JSON.stringify(providerData)}`);
        const response = await fetch(`${this.endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventName, data: providerData }),
          // keepalive: true,
        });
        if (!response.ok) {
          logger.error(`MockApiAnalytics failed to track event: ${response.statusText}`);
          return Promise.resolve();
        }
      } catch (error) {
        logger.error(`MockApiAnalytics failed to track event: ${(error as Error).message}`);
        return Promise.resolve();
      }
    }
  }
}
