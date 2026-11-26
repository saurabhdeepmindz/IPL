/**
 * @file    mail.ts
 * @module  Config
 *
 * @description
 * E-mail settings. In plain words: how and from where e-mail is sent.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  transport: process.env.MAIL_TRANSPORT ?? 'smtp',
  from: process.env.MAIL_FROM ?? 'ams@example.invalid',
  smtpHost: process.env.SMTP_HOST ?? 'localhost',
  smtpPort: Number(process.env.SMTP_PORT ?? 1025),
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPassword: process.env.SMTP_PASSWORD ?? '',
  sesRegion: process.env.AWS_SES_REGION ?? 'ap-south-1',
  /** Waits before the second and third try after a failure (decision S-2 of US-LGN02-005: 1, 5 and 15 minutes). */
  retryDelaysMs: (process.env.MAIL_RETRY_DELAYS_MS ?? '60000,300000,900000').split(',').map(Number),
}));
