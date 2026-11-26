/**
 * @file    env.ts
 * @module  Lib
 *
 * @description
 * Checked environment values. In plain words: the app refuses to start when a setting is wrong.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Type-safe environment variables. Only NEXT_PUBLIC_ values reach the browser.
 * The front end holds no token secret: tokens are issued and checked by the back end (Standard section 9.5).
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  client: {
    NEXT_PUBLIC_APP_NAME: z.string().default('AMS'),
    NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3001'),
    NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    NEXT_PUBLIC_API_BASE_URL: z.url().default('http://localhost:3000/api/v1'),
    NEXT_PUBLIC_DEV_SIGN_IN: z.enum(['true', 'false']).default('false'),
    NEXT_PUBLIC_AUTH_API_BASE_URL: z.url().default('http://localhost:3200/api/v1'),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_DEV_SIGN_IN: process.env.NEXT_PUBLIC_DEV_SIGN_IN,
    NEXT_PUBLIC_AUTH_API_BASE_URL: process.env.NEXT_PUBLIC_AUTH_API_BASE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
