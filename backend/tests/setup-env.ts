/**
 * @file    setup-env.ts
 * @module  Tooling
 *
 * @description
 * Loads the local .env file before every Jest run. In plain words: tests that need the database or Redis find the same settings the application uses.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-BE-02
 */
import 'dotenv/config';
