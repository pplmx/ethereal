const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args: any[]) => isDev && console.debug('[Ethereal]', ...args),
  info: (...args: any[]) => console.info('[Ethereal]', ...args),
  warn: (...args: any[]) => console.warn('[Ethereal]', ...args),
  error: (...args: any[]) => console.error('[Ethereal]', ...args),
};
