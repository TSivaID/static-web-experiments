import { getCookie } from '../utils/cookie';
import { logger } from '../utils/logger';

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
export interface EventConf {
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

export class EventsVariablesParser {
  private pageVars: PageVars | undefined;
  constructor() {
    this.pageVars = this.getPageVars();
  }
  /**
   * Common variables that are available for all events from the Analytics module
   * @returns {CommonVars} Common variables that are available for all events
   */
  private getCommonVars(): CommonVars {
    return {
      event_timestamp: new Date().toISOString(),
      user_agent: window.navigator.userAgent,
      page_url: window.location.href,
      page_title: document.title,
      page_referrer: document.referrer,
      anonynmous_user_id: getCookie('anonymous_user_id'),
      session_id: getCookie('session_id'),
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
    const pageVarsObj = this.pageVars;
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
