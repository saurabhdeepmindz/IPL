/**
 * @file    auth.ts
 * @module  Config
 *
 * @description
 * Sign-in and token settings. In plain words: token lives, cookie and lock-out rules.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET ?? '',
  accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  refreshTtl: process.env.JWT_REFRESH_TTL ?? '8h',
  cookieDomain: process.env.COOKIE_DOMAIN ?? 'localhost',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  localEnabled: process.env.AUTH_LOCAL_ENABLED !== 'false',
  lockoutAttempts: Number(process.env.AUTH_LOCKOUT_ATTEMPTS ?? 5),
  lockoutMinutes: Number(process.env.AUTH_LOCKOUT_MINUTES ?? 30),
}));
