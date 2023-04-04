import { AnalyticsService } from '../service';
import { logger } from '../../utils/logger';
import { EventConf } from '../events-variables-parser';
import { EventsVariablesParser } from '../events-variables-parser';

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

abstract class Trigger implements ITrigger {
  name: string;
  selector: EventTarget;
  analyticsService: AnalyticsService;
  eventVariablesParser: EventsVariablesParser;

  constructor(
    name: string,
    element: EventTarget,
    analyticsService: AnalyticsService,
    eventVariablesParser: EventsVariablesParser
  ) {
    this.name = name;
    this.selector = element;
    this.analyticsService = analyticsService;
    this.eventVariablesParser = eventVariablesParser;
  }

  abstract handler(event: Event | IntersectionObserverEntry): void;

  public addEventListener() {
    this.selector.addEventListener(this.name, this.handler.bind(this));
  }

  public removeEventListener() {
    this.selector.removeEventListener(this.name, this.handler.bind(this));
  }

  public parseEventConf(eventConf: string): EventConf | undefined {
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
  constructor(selector: EventTarget, analyticsService: AnalyticsService, eventVariablesParser: EventsVariablesParser) {
    super('click', selector, analyticsService, eventVariablesParser);
  }

  handler(event: Event): void {
    const eventConf = (event?.currentTarget as HTMLElement)?.dataset?.eventConf as string;
    const eventConfObj = this.parseEventConf(eventConf);
    if (!eventConfObj) {
      return;
    } else {
      const vars = this.eventVariablesParser.getVars(eventConfObj);
      this.analyticsService.trackEvent(eventConfObj.name, vars);
    }
  }
}

export class ElementVisibleTrigger extends Trigger {
  private observer: IntersectionObserver | null;

  constructor(element: Element, analyticsService: AnalyticsService, eventVariablesParser: EventsVariablesParser) {
    super('visibility', element, analyticsService, eventVariablesParser);
    this.observer = null;
  }

  handler(entry: IntersectionObserverEntry): void {
    const eventConf = (entry.target as HTMLElement).dataset.eventConf as string;
    const eventConfObj = this.parseEventConf(eventConf);
    if (!eventConfObj) {
      return;
    } else {
      const vars = this.eventVariablesParser.getVars(eventConfObj);
      this.analyticsService.trackEvent(eventConfObj.name, vars);

      // Stop observing the element once it's visible
      if (entry.intersectionRatio === 1.0 && this.observer) {
        this.observer.unobserve(entry.target);
        this.observer.disconnect();
      }
    }
  }

  public addEventListener(): void {
    if (!this.selector) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.handler(entry);
            if (this.observer) {
              this.observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 1.0,
      }
    );

    this.observer.observe(this.selector as Element);
  }

  public removeEventListener(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export class ScrollDepthTrigger extends Trigger {
  private maxDepth: number;
  protected shouldEnable: boolean;

  constructor(shouldEnable: boolean, analyticsService: AnalyticsService, eventVariablesParser: EventsVariablesParser) {
    super('scroll', window, analyticsService, eventVariablesParser);
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

  private eventConf(eventMethod: string) {
    const data = {
      name: 'scroll_depth',
      vars: { max_depth: this.maxDepth, event_method: eventMethod },
      // TODO: get target provider from config
      providers: {
        mock_api_analytics: { keys: ['max_depth', 'event_method'] },
        mparticle: { keys: ['max_depth', 'event_method'] },
      },
    };
    return data;
  }

  private trackPageLeave(handlePageLeave: () => void): void {
    // To track page leave, we need to send the event before the page is unloaded
    // Work with all browsers for click, form submit, and page leave scenarios
    // except for browser close or back/forward navigation
    // Didn't use pagevisibility API because we don't want to track when the page minimized.
    if ('onpagehide' in window) {
      window.addEventListener('pagehide', (event) => {
        // if (!event.persisted) {
        handlePageLeave();
        // }
      });
    } else {
      (window as Window).addEventListener('beforeunload', handlePageLeave);
    }
  }

  private trackUnload(): void {
    this.trackPageLeave(() => {
      this.analyticsService.trackEvent('scroll_depth', this.eventVariablesParser.getVars(this.eventConf('pageleave')));
    });
    window.addEventListener('pagehide', () => {
      this.analyticsService.trackEvent('scroll_depth', this.eventVariablesParser.getVars(this.eventConf('pagehide')));
    });
    window.addEventListener('beforeunload', () => {
      this.analyticsService.trackEvent(
        'scroll_depth',
        this.eventVariablesParser.getVars(this.eventConf('beforeunload'))
      );
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.analyticsService.trackEvent(
          'scroll_depth',
          this.eventVariablesParser.getVars(this.eventConf('visibilitychange'))
        );
      }
    });
  }
}

export class TriggerBinder {
  analyticsService: AnalyticsService;
  eventVariablesParser: EventsVariablesParser;

  constructor(analyticsService: AnalyticsService, eventVariablesParser: EventsVariablesParser) {
    this.analyticsService = analyticsService;
    this.eventVariablesParser = eventVariablesParser;
  }

  initialize() {
    this.bindClickTriggers();
    new ScrollDepthTrigger(true, this.analyticsService, this.eventVariablesParser).initialize();
    this.bindElementVisibleTriggers();
  }

  private bindClickTriggers() {
    const clickTriggerElements = document.querySelectorAll('[data-ae-trigger="click"]');
    const clickTriggers = Array.from(clickTriggerElements).map(
      (element) => new ClickTrigger(element, this.analyticsService, this.eventVariablesParser)
    );
    clickTriggers.forEach((trigger) => trigger.addEventListener());
  }

  private bindElementVisibleTriggers() {
    this.bindElementVisibleTriggersFor('[data-ae-trigger="visible"]');
    this.watchForNewElements(
      // document.body,
      '[data-ae-observer="once"]',
      '[data-ae-trigger="lazy-element-visible"]',
      this.bindElementVisibleTriggersFor.bind(this),
      true
    );
    this.watchForNewElements(
      // document.body,
      '[data-ae-observer="forever"]',
      '[data-ae-trigger="lazy-element-visible"]',
      this.bindElementVisibleTriggersFor.bind(this),
      false
    );
  }

  // To bind triggers to dynamically added elements
  private bindElementVisibleTriggersFor(selector: string | Element[]): void {
    const elementVisibleTriggerElements = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;

    const elementVisibleTriggers = Array.from(elementVisibleTriggerElements).map(
      (element) => new ElementVisibleTrigger(element, this.analyticsService, this.eventVariablesParser)
    );
    elementVisibleTriggers.forEach((trigger) => trigger.addEventListener());
  }

  // Method to set up a MutationObserver to watch for new elements
  private watchForNewElements(
    parentSelector: string | Element,
    lazySelector: string,
    bindTrigger: (matchingElements: Element[]) => void,
    disconnectAfterFirstMatch = true
  ): void {
    const observerCallback = (mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) {
              const matchingElements = node.matches(lazySelector)
                ? [node]
                : Array.from(node.querySelectorAll(lazySelector));

              if (matchingElements.length > 0) {
                bindTrigger(matchingElements);
                if (disconnectAfterFirstMatch) {
                  observer.disconnect(); // Disconnect the observer when the element is found
                  break;
                }
              }
            }
          }
        }
      }
    };
    const parent = typeof parentSelector === 'string' ? document.querySelector(parentSelector) : parentSelector;
    if (!parent) {
      logger.warn(`Could not find parent element for selector: ${parentSelector}`);
      return;
    }
    const observer = new MutationObserver(observerCallback);
    observer.observe(parent, { childList: true, subtree: true });
  }
}
