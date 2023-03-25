import { Logger, LogLevel } from './logger';

describe('Logger', () => {
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
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
