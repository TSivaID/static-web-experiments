import { Logger, LogLevel, initializeLogger } from './logger';
import { setCookie, getCookie } from './cookie';

jest.mock('./cookie', () => ({
  setCookie: jest.fn(),
  getCookie: jest.fn(),
}));

describe('Logger', () => {
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {}); // eslint-disable-line
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {}); // eslint-disable-line
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {}); // eslint-disable-line
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // eslint-disable-line
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should log debug message when log level is set to DEBUG', () => {
    const logger = new Logger(LogLevel.DEBUG);
    logger.debug('Test debug message');
    expect(consoleDebugSpy).toHaveBeenCalledWith('Test debug message', {});
  });

  it('should log info message when log level is set to INFO', () => {
    const logger = new Logger(LogLevel.INFO);
    logger.info('Test info message');
    expect(consoleInfoSpy).toHaveBeenCalledWith('Test info message', {});
  });

  it('should log warning message when log level is set to WARN', () => {
    const logger = new Logger(LogLevel.WARN);
    logger.warn('Test warning message');
    expect(consoleWarnSpy).toHaveBeenCalledWith('Test warning message', {});
  });

  it('should log error message when log level is set to ERROR', () => {
    const logger = new Logger(LogLevel.ERROR);
    logger.error('Test error message');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Test error message', {});
  });

  it('should not log debug message when log level is set to INFO', () => {
    const logger = new Logger(LogLevel.INFO);
    logger.debug('Test debug message');
    expect(consoleInfoSpy).not.toHaveBeenCalled();
  });

  it('should log metadata when provided', () => {
    const logger = new Logger(LogLevel.DEBUG);
    const metadata = { key: 'value' };
    logger.debug('Test debug message', { metadata });
    expect(consoleDebugSpy).toHaveBeenCalledWith('Test debug message', { metadata });
  });

  it('should log thunk data when provided', () => {
    const logger = new Logger(LogLevel.DEBUG);
    const metadata = { key: 'value' };
    logger.debug('Test debug message', { thunk: () => metadata });
    expect(consoleDebugSpy).toHaveBeenCalledWith('Test debug message', { thunk: metadata });
  });

  it('should log both metadata and thunk data when provided', () => {
    const logger = new Logger(LogLevel.DEBUG);
    const metadata1 = { key1: 'value1' };
    const metadata2 = { key2: 'value2' };
    logger.debug('Test debug message', { metadata: metadata1, thunk: () => metadata2 });
    expect(consoleDebugSpy).toHaveBeenCalledWith('Test debug message', { metadata: metadata1, thunk: metadata2 });
  });
});

describe('initializeLogger', () => {
  afterEach(() => {
    (getCookie as jest.Mock).mockReset();
    (setCookie as jest.Mock).mockReset();
  });

  test('should initialize the logger with the default log level', () => {
    const logger = initializeLogger();
    expect(logger).toBeInstanceOf(Logger);
    expect(logger.getLogLevel()).toEqual(LogLevel.INFO);
  });

  test('should initialize the logger with the log level from URL query string', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?loglevel=debug',
      },
      writable: true,
    });

    const logger = initializeLogger();
    expect(logger).toBeInstanceOf(Logger);
    expect(logger.getLogLevel()).toEqual(LogLevel.DEBUG);
    expect(setCookie).toHaveBeenCalledWith('session_loglevel', LogLevel.DEBUG.toString(), expect.any(Object));
  });

  test.skip('should initialize the logger with the log level from session cookie', () => {
    (getCookie as jest.Mock).mockReturnValue(LogLevel.WARN.toString());

    const logger = initializeLogger();
    expect(logger).toBeInstanceOf(Logger);
    expect(logger.getLogLevel()).toEqual(LogLevel.WARN);
  });
});
