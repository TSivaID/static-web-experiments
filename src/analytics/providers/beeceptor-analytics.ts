import { IAnalyticsProvider } from './ianalytics-provider';
import { logger } from '../../utils/logger';

interface BeeceptorAnalyticsConfig {
  useSendBeacon?: boolean;
}

/**
 * BeeceptorAnalytics is a simple Mock analytics provider that sends events to a
 * Beeceptor endpoint. This is useful for testing analytics in a development environment.
 */
export class BeeceptorAnalytics implements IAnalyticsProvider {
  public readonly name = 'BeeceptorAnalytics';
  private readonly endpoint: string = 'https://static-web-experiments.free.beeceptor.com/events/';
  private readonly useSendBeacon: boolean;

  constructor(config?: BeeceptorAnalyticsConfig) {
    this.useSendBeacon = config?.useSendBeacon === true ? true : false;
  }

  initialize(): void {
    logger.info('BeeceptorAnalytics initialized');
  }

  async trackEvent(eventName: string, data?: Record<string, unknown>): Promise<void> {
    if (!data?.beeceptor_analytics) return Promise.resolve();
    const providerData = { ...data.beeceptor_analytics, useSendBeacon: this.useSendBeacon };

    if (this.useSendBeacon && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ eventName, data: providerData })], { type: 'text/plain' });

      const success = navigator.sendBeacon(`${this.endpoint}`, blob);

      if (success) {
        logger.info(
          `BeeceptorAnalytics sent event using sendBeacon: ${eventName} with data: ${JSON.stringify(providerData)}`
        );
      } else {
        logger.error(`BeeceptorAnalytics failed to send event using sendBeacon: ${eventName}`);
      }

      return Promise.resolve();
    } else {
      try {
        logger.info(`BeeceptorAnalytics sending event: ${eventName} with data: ${JSON.stringify(providerData)}`);
        const response = await fetch(`${this.endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventName, data: providerData }),
          // keepalive: true,
        });
        if (!response.ok) {
          logger.error(`BeeceptorAnalytics failed to track event: ${response.statusText}`);
          return Promise.resolve();
        }
      } catch (error) {
        logger.error(`BeeceptorAnalytics failed to track event: ${(error as Error).message}`);
        return Promise.resolve();
      }
    }
  }
}
