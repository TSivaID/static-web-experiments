import { AnalyticsService } from '../service';
import { logger } from '../../utils/logger';

// enum Triggers {
//     WINDOW_LOAD = 'load',
//     WINDOW_UNLOAD = 'unload',
//     DOM_READY = 'domReady',
//     PAGE_VIEW = 'pageView',
//     SCROLL = 'scroll',
//     CLICK = 'click',
//     CUSTOM = 'custom',
// }

interface ITrigger {
  name: string;
  selector: EventTarget | null;
  addEventListener: (event: string, callback: (event: Event) => void) => void;
  removeEventListener: (event: string, callback: (event: Event) => void) => void;
  handler: (event: Event) => void;
}

interface PageVars {
  vars: {
    [key: string]: unknown;
  };
}

interface CommonVars {
  [key: string]: unknown;
}

/*
{
  "name":"test_click_event",
  "vars": {
    "key1": "key1_value",
    "key2": "key2_value"
  },
  "providers": {
    "dummy_analytics": {
      "keys": [
        "key1",
        "key2"
      ],
      "extra_keys": [
        "page_var1",
        "page_var2"
      ],
      "exclude_keys": [
        "page_var3"
      ],
      "key_mapping": {
        "key1": "key1_name",
        "key2": "key2_name"
      }
    }
  }
}
*/
interface EventConf {
  name: string;
  vars?: Record<string, unknown>;
  providers: {
    // provider name
    [key: string]: {
      // Dedicated key names of event attributes for the provider. It can be from `vars` from the event.
      keys?: string[];
      // Additional Key names of event attributes for the provider. It can be one of keys added as page vars. (from json string of #page-vars selector in the page)
      extra_keys?: string[];
      // Key names of event attributes to be excluded for the provider. It can be one of keys added as common vars.
      exclude_keys?: string[];
      // Key names of event attributes to be renamed for the provider. If this is not provided,
      // the key name will be used as is available in the keys attribute of the provider.
      key_mapping?: Record<string, string>;
    };
  };
}

class TriggerVariablesParser {
  /**
   * Common variables that are available for all events from the Analytics module
   * @returns {CommonVars} Common variables that are available for all events
   */
  private getCommonVars(): CommonVars {
    return {
      event_timestamp: new Date().toISOString(),
      user_agent: window.navigator.userAgent,
      page_url: window.location.href,
    };
  }

  /**
   * Page variables that are available for all events from the web page
   * @returns {PageVars} Page variables that are available for all events
   */
  private getPageVars(): PageVars | undefined {
    const pageVars = document.querySelector('#page-vars');
    if (!pageVars) {
      logger.error('No page-vars found');
      return undefined;
    }
    try {
      const pageVarsObj = JSON.parse(pageVars.innerHTML);
      return pageVarsObj;
    } catch (error) {
      logger.error('Error parsing page-vars');
      return undefined;
    }
  }

  /**
   * Get variables for the event
   * @param {EventConf} eventConf Event configuration
   * @returns {Record<string, unknown>} Variables for the event
   */
  public getVars(eventConf: EventConf): Record<string, unknown> {
    const commonVars = this.getCommonVars();
    const pageVarsObj = this.getPageVars();
    const pageVars = pageVarsObj ? pageVarsObj.vars : {};
    const eventVars = eventConf.vars || {};

    const combinedVars: Record<string, unknown> = { ...pageVars, ...eventVars };

    const resultVars: Record<string, unknown> = {};

    for (const provider in eventConf.providers) {
      const providerConfig = eventConf.providers[provider];
      const providerVars: Record<string, unknown> = { ...commonVars };

      if (providerConfig.keys) {
        for (const key of providerConfig.keys) {
          if (Object.prototype.hasOwnProperty.call(combinedVars, key)) {
            providerVars[key] = combinedVars[key];
          }
        }
      }

      if (providerConfig.extra_keys) {
        for (const key of providerConfig.extra_keys) {
          if (Object.prototype.hasOwnProperty.call(combinedVars, key)) {
            providerVars[key] = combinedVars[key];
          }
        }
      }

      if (providerConfig.exclude_keys) {
        for (const key of providerConfig.exclude_keys) {
          if (Object.prototype.hasOwnProperty.call(providerVars, key)) {
            delete providerVars[key];
          }
        }
      }

      if (providerConfig.key_mapping) {
        for (const key in providerConfig.key_mapping) {
          if (Object.prototype.hasOwnProperty.call(providerVars, key)) {
            const newKey = providerConfig.key_mapping[key];
            providerVars[newKey] = providerVars[key];
            delete providerVars[key];
          }
        }
      }

      resultVars[provider] = providerVars;
    }

    return resultVars;
  }
}

abstract class Trigger implements ITrigger {
  name: string;
  selector: EventTarget;
  analyticsService: AnalyticsService;
  triggerVariableParser = new TriggerVariablesParser();

  constructor(name: string, element: EventTarget, analyticsService: AnalyticsService) {
    this.name = name;
    this.selector = element;
    this.analyticsService = analyticsService;
  }

  abstract handler(event: Event): void;

  public addEventListener() {
    this.selector.addEventListener(this.name, this.handler.bind(this));
  }

  public removeEventListener() {
    this.selector.removeEventListener(this.name, this.handler.bind(this));
  }

  public getEventConf(eventConf: string): EventConf | undefined {
    if (!eventConf) {
      logger.error(`No eventConf found for ${this.name} trigger`);
      return undefined;
    } else {
      try {
        const eventConfObj: EventConf = JSON.parse(eventConf);
        return eventConfObj;
      } catch (error) {
        logger.error(`Error parsing eventConf for ${this.name} trigger`);
        return undefined;
      }
    }
  }
}

export class ClickTrigger extends Trigger {
  constructor(selector: EventTarget, analyticsService: AnalyticsService) {
    super('click', selector, analyticsService);
  }

  handler(event: Event): void {
    const eventConf = (event?.currentTarget as HTMLElement)?.dataset?.eventConf as string;
    const eventConfObj = this.getEventConf(eventConf);
    if (!eventConfObj) {
      return;
    } else {
      const vars = this.triggerVariableParser.getVars(eventConfObj);
      this.analyticsService.trackEvent(eventConfObj.name, vars);
    }
  }
}

export class ScrollDepthTrigger extends Trigger {
  private maxDepth: number;
  protected shouldEnable: boolean;

  constructor(shouldEnable: boolean, analyticsService: AnalyticsService) {
    super('scroll', window, analyticsService);
    this.maxDepth = 0;
    this.shouldEnable = shouldEnable;
  }

  initialize() {
    if (this.shouldEnable) {
      this.addEventListener();
      this.trackUnload();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handler(event: Event): void {
    const currentDepth = window.scrollY;
    if (currentDepth > this.maxDepth) {
      this.maxDepth = currentDepth;
    }
  }

  private trackUnload(): void {
    window.addEventListener('beforeunload', () => {
      if (this.maxDepth > 0) {
        this.analyticsService.trackEvent('scroll_depth', {
          // TODO: get target provider from config
          mock_api_analytics: { maxDepth: this.maxDepth },
        });
      }
    });
  }
}

export class TriggerBinder {
  analyticsService: AnalyticsService;

  constructor(analyticsService: AnalyticsService) {
    this.analyticsService = analyticsService;
  }

  initialize() {
    this.bindClickTriggers();
    new ScrollDepthTrigger(true, this.analyticsService).initialize();
  }

  private bindClickTriggers() {
    const clickTriggerElements = document.querySelectorAll('[data-ae-trigger="click"]');
    const clickTriggers = Array.from(clickTriggerElements).map(
      (element) => new ClickTrigger(element, this.analyticsService)
    );
    clickTriggers.forEach((trigger) => trigger.addEventListener());
  }
}
