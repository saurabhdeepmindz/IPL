/**
 * @file    env.ts
 * @module  Config
 *
 * @description
 * Environment reader. In plain words: the one place outside the typed settings that reads the process environment, for code that runs before the settings are loaded (a dynamic module, a command, the database adapter).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R18-S35
 * @status  built
 */

/** The value of an environment variable, or the fallback (undefined when there is none). */
export function readEnv(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

/** The whole environment, for a command that is handed it as a parameter. */
export function processEnv(): NodeJS.ProcessEnv {
  return process.env;
}
