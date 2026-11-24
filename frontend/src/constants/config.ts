/**
 * @file    config.ts
 * @module  Constants
 *
 * @description
 * Application-wide settings. In plain words: name, address and paging defaults.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
/**
 * Application-wide configuration constants.
 */
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? 'IPL Frontend',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  env: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  isDev: process.env.NEXT_PUBLIC_APP_ENV === 'development',
  isProd: process.env.NEXT_PUBLIC_APP_ENV === 'production',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

export const DATE_FORMAT = {
  DISPLAY: 'dd MMM yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'dd MMM yyyy, hh:mm a',
} as const;
