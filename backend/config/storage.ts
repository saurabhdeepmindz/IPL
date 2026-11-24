/**
 * @file    storage.ts
 * @module  Config
 *
 * @description
 * File storage settings. In plain words: the bucket where attachments are kept.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  bucket: process.env.S3_BUCKET ?? '',
  region: process.env.S3_REGION ?? 'ap-south-1',
}));
