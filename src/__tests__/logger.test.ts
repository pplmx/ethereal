import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../lib/logger';

describe('Logger', () => {
  const originalConsole = { ...console };
  const mockConsole = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  afterEach(() => {
    vi.restoreAllMocks();
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  it('logs info messages', () => {
    console.info = mockConsole.info;
    logger.info('Test info');
    expect(mockConsole.info).toHaveBeenCalledWith('[Ethereal]', 'Test info');
  });

  it('logs warn messages', () => {
    console.warn = mockConsole.warn;
    logger.warn('Test warn');
    expect(mockConsole.warn).toHaveBeenCalledWith('[Ethereal]', 'Test warn');
  });

  it('logs error messages', () => {
    console.error = mockConsole.error;
    logger.error('Test error');
    expect(mockConsole.error).toHaveBeenCalledWith('[Ethereal]', 'Test error');
  });
});
