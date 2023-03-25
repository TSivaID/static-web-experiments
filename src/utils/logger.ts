/**
 * @module logger
 * @version 0.1.0
 * @author T. Siva <t.siva AT outlook.com>
 * @license MIT
 * @description
 * A simple, flexible, and performant logger for use in the browser.
 *
 * The logger provides a way to output messages with different log levels (DEBUG, INFO, WARN, and ERROR)
 * and allows you to include metadata and a thunk function for lazy evaluation of additional information.
 *
 * Thunk functions are useful in scenarios where computing additional information is computationally
 * expensive or time-consuming. By passing a thunk function, the additional information will only be
 * computed when the log level condition is met, avoiding unnecessary computation and improving
 * performance.
 *
 * Usage example:
 * ```
 * import { Logger, LogLevel } from './utils/logger';
 *
 * const logger = new Logger(LogLevel.DEBUG);
 *
 * logger.debug('Debug message');
 * logger.info('Info message', { metadata: { user: 'John Doe' } });
 * logger.warn('Warning message', { metadata: { errorCode: 123 } });
 * logger.error('Error message', { metadata: { error: new Error('Something went wrong') }, thunk: () => ({ additionalInfo: 'lazy evaluated info' }) });
 * ```
 *
 * Usage example with only thunk (without metadata):
 * ```
 * logger.info('Info message', { thunk: () => ({ user: 'John Doe', action: 'lazy evaluated info' }) });
 * ```
 */

/**
 * LogLevel represents the available logging levels.
 */
export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

/**
 * Logger class for handling logging messages.
 */
export class Logger {
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel) {
    this.logLevel = logLevel;
  }

  /**
   * Logs a debug message.
   * @param {string} message - The message to log.
   * @param {object} [options] - Optional object containing metadata and thunk properties.
   * @param {object} [options.metadata] - Optional metadata to include with the log.
   * @param {() => object} [options.thunk] - Optional function that returns additional metadata.
   */
  public debug(message: string, options?: { metadata?: object; thunk?: () => object }) {
    this.log(LogLevel.DEBUG, message, options);
  }

  /**
   * Logs an info message.
   * @param {string} message - The message to log.
   * @param {object} [options] - Optional object containing metadata and thunk properties.
   * @param {object} [options.metadata] - Optional metadata to include with the log.
   * @param {() => object} [options.thunk] - Optional function that returns additional metadata.
   */
  public info(message: string, options?: { metadata?: object; thunk?: () => object }) {
    this.log(LogLevel.INFO, message, options);
  }

  /**
   * Logs a warning message.
   * @param {string} message - The message to log.
   * @param {object} [options] - Optional object containing metadata and thunk properties.
   * @param {object} [options.metadata] - Optional metadata to include with the log.
   * @param {() => object} [options.thunk] - Optional function that returns additional metadata.
   */
  public warn(message: string, options?: { metadata?: object; thunk?: () => object }) {
    this.log(LogLevel.WARN, message, options);
  }

  /**
   * Logs an error message.
   * @param {string} message - The message to log.
   * @param {object} [options] - Optional object containing metadata and thunk properties.
   * @param {object} [options.metadata] - Optional metadata to include with the log.
   * @param {() => object} [options.thunk] - Optional function that returns additional metadata.
   */
  public error(message: string, options?: { metadata?: object; thunk?: () => object }) {
    this.log(LogLevel.ERROR, message, options);
  }

  /**
   * Logs a message with the specified log level.
   * @param {LogLevel} level - The log level.
   * @param {string} message - The message to log.
   * @param {object} [options] - Optional object containing metadata and thunk properties.
   * @param {object} [options.metadata] - Optional metadata to include with the log.
   * @param {() => object} [options.thunk] - Optional function that returns additional metadata.
   */
  private log(level: LogLevel, message: string, options?: { metadata?: object; thunk?: () => object }) {
    if (level >= this.logLevel) {
      let logMetadata;
      const cleanedLogLevel =
        level === LogLevel.DEBUG
          ? 'debug'
          : level === LogLevel.INFO
          ? 'info'
          : level === LogLevel.WARN
          ? 'warn'
          : level === LogLevel.ERROR
          ? 'error'
          : 'info';
      try {
        logMetadata = { ...({ metadata: options?.metadata } || {}), ...(options?.thunk ? { thunk: options.thunk() } : {}) };
      } catch (error) {
        console.error('Error while logging message', error);
      }
      console[cleanedLogLevel](message, logMetadata);
    }
  }
}
