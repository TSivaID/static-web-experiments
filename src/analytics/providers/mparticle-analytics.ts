import { IAnalyticsProvider } from './ianalytics-provider';
import { logger } from '../../utils/logger';

interface IWindow extends Window {
  mParticle: {
    config: {
      rq: unknown[];
      appVersion: string;
      customFlags: Record<string, unknown>;
      identifyRequest: {
        userIdentities: {
          customerid: string;
          email: string;
        };
      };
      identityCallback: (f: unknown) => void;
      isDebug: boolean;
      isDevelopmentMode: boolean;
      isSandbox: boolean;
      sessionTimeout: number;
      useCookieStorage: boolean;
      useNativeSdk: boolean;
      ready: (f: unknown) => void;
    };
    logEvent: (
      eventName: string,
      eventType: number,
      eventInfo: Record<string, unknown>,
      customFlags: Record<string, unknown>
    ) => void;
    upload: () => void;
  };
}

declare let window: IWindow;

export class MParticleAnalytics implements IAnalyticsProvider {
  public readonly name = 'MParticleAnalytics';
  private shouldForceUpload: boolean;

  constructor(options: Record<string, unknown>) {
    this.shouldForceUpload = options?.shouldForceUpload === true ? true : false;
  }

  initialize(): void {
    window.mParticle = {
      config: {
        rq: [],
        appVersion: '1.0.0',
        customFlags: {},
        identifyRequest: {
          userIdentities: {
            customerid: '',
            email: '',
          },
        },
        identityCallback: function () {}, // eslint-disable-line @typescript-eslint/no-empty-function
        isDebug: true,
        isDevelopmentMode: true,
        isSandbox: true,
        sessionTimeout: 30,
        useCookieStorage: true,
        useNativeSdk: false,
        ready: function (f: unknown) {
          window.mParticle.config.rq.push(f);
        },
      },
    } as unknown as typeof window.mParticle;

    const el = document.createElement('script');
    el.async = true;
    el.src = 'https://jssdkcdns.mparticle.com/js/v2/us1-a9588c0ddc27594cabd152e47ffe27ee/mparticle.js';
    document.head.appendChild(el);
    logger.info('MParticleAnalytics initialized');
  }

  async trackEvent(eventName: string, data?: Record<string, unknown>): Promise<void> {
    if (data?.mparticle) {
      logger.info(
        `MParticleAnalytics sending event: ${eventName} with data: ${JSON.stringify(data.mparticle_analytics)}`
      );
      const eventData = { ...data.mparticle, shouldForceUpload: this.shouldForceUpload };
      window.mParticle.logEvent(eventName, 1, eventData, {});
      if (this.shouldForceUpload) window.mParticle.upload();
    }
    return Promise.resolve();
  }
}
