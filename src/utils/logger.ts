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

import { getCookie, setCookie } from './cookie';

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
   * Gets the current log level.
   * @returns {LogLevel} The current log level.
   */
  public getLogLevel(): LogLevel {
    return this.logLevel;
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
        const metaData = options?.metadata ? { metadata: { ...options.metadata } } : undefined;
        const thunkData = options?.thunk ? { thunk: { ...options.thunk() } } : undefined;
        logMetadata = metaData || thunkData ? { ...(metaData || {}), ...(thunkData || {}) } : undefined;
      } catch (error) {
        console.error('Error while logging message', error);
      }
      if (logMetadata) {
        console[cleanedLogLevel](message, logMetadata);
      } else {
        console[cleanedLogLevel](message);
      }
    }
  }
}

/**
 * Returns the log level from the URL query string.
 * @returns {LogLevel} The log level.
 */
function getLogLevelFromUrl(): LogLevel | undefined {
  const urlParams = new URLSearchParams(window.location.search);
  const logLevelParam = urlParams.get('loglevel');

  if (logLevelParam) {
    const logLevel = logLevelParam.toLowerCase();
    if (logLevel === 'debug') return LogLevel.DEBUG;
    if (logLevel === 'info') return LogLevel.INFO;
    if (logLevel === 'warn') return LogLevel.WARN;
    if (logLevel === 'error') return LogLevel.ERROR;
  }

  return undefined;
}

/**
 * Saves the log level to a session cookie.
 * @param {LogLevel} logLevel - The log level.
 */
function saveLogLevelToSessionCookie(logLevel: LogLevel) {
  setCookie('session_loglevel', logLevel.toString(), { path: '/', sameSite: 'strict' });
}

/**
 * Returns the log level from the session cookie.
 * @returns {LogLevel} The log level.
 * @returns {undefined} If the log level is not found in the session cookie.
 */
function getLogLevelFromSessionCookie(): LogLevel | undefined {
  const logLevelStr = getCookie('session_loglevel');

  if (logLevelStr) {
    const logLevel = parseInt(logLevelStr);
    if (LogLevel[logLevel]) {
      return logLevel;
    }
  }

  return undefined;
}

/**
 * Initializes the logger.
 * @returns {Logger} The logger.
 * @returns {undefined} If the log level is not found in the session cookie.
 */
export function initializeLogger(): Logger {
  let logLevel: LogLevel = LogLevel.INFO; // Default log level

  const urlLogLevel = getLogLevelFromUrl();
  if (urlLogLevel !== undefined) {
    logLevel = urlLogLevel;
    saveLogLevelToSessionCookie(logLevel);
  } else {
    const sessionLogLevel = getLogLevelFromSessionCookie();
    if (sessionLogLevel !== undefined) {
      logLevel = sessionLogLevel;
    }
  }

  return new Logger(logLevel);
}

export const logger = initializeLogger();
