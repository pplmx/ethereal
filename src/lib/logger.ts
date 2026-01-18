const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args: unknown[]) => isDev && console.debug('[Ethereal]', ...args),
  info: (...args: unknown[]) => console.info('[Ethereal]', ...args),
  warn: (...args: unknown[]) => console.warn('[Ethereal]', ...args),
  error: (...args: unknown[]) => console.error('[Ethereal]', ...args),
};
