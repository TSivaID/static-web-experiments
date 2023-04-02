import { AnalyticsService } from './service';
import { TriggerVariablesParser } from './triggers';
import { EventConf } from './triggers';

interface IWindow extends Window {
  analyticsDataLayer: DataLayer;
}

interface DataLayer {
  [index: number]: Record<string, unknown>;
  length: number;
  push: (...args: Array<Record<string, unknown>>) => void;
}

declare let window: IWindow;

// Save the original push method of the dataLayer
const originalPush = Array.prototype.push;

export class DataLayerManager {
  protected analyticsService: AnalyticsService;

  constructor(analyticsService: AnalyticsService) {
    this.analyticsService = analyticsService;
  }

  public initialize(): void {
    // Initialize the data layer
    window.analyticsDataLayer = window.analyticsDataLayer || ([] as unknown as DataLayer);

    this.resetPush();

    // Process existing events in the data layer
    (window.analyticsDataLayer as Array<Record<string, unknown>>).forEach((eventData: Record<string, unknown>) => {
      const { name, ...data } = eventData;
      const triggerVariableParser = new TriggerVariablesParser();
      this.analyticsService.trackEvent(name as string, triggerVariableParser.getVars(data as unknown as EventConf));
    });

    // Listen for new events in the data layer
    window.addEventListener('analytics-data-layer-update', ((event: CustomEvent) => {
      const { name, ...data } = event.detail;
      const triggerVariableParser = new TriggerVariablesParser();
      this.analyticsService.trackEvent(name as string, triggerVariableParser.getVars(data));
    }) as EventListener);
  }

  private resetPush(): void {
    // Override the push method
    window.analyticsDataLayer.push = function (...args) {
      // Call the original push method with the provided arguments
      originalPush.apply(this, args);

      // Emit a 'datalayer-update' event with the pushed data
      const updateEvent = new CustomEvent('analytics-data-layer-update', { detail: args[0] });
      window.dispatchEvent(updateEvent);
    };
  }
}
