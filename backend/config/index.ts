/**
 * @file    index.ts
 * @module  Config
 *
 * @description
 * Registers every typed configuration. In plain words: one list of all settings for the application.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import app from './app';
import http from './http';
import auth from './auth';
import cache from './cache';
import database from './database';
import mail from './mail';
import storage from './storage';

export { readEnv, processEnv } from './env';

export const configurations = [app, http, auth, cache, database, mail, storage];
