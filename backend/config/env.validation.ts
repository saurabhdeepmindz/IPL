/**
 * @file    env.validation.ts
 * @module  Config
 *
 * @description
 * Checks the environment values at start. In plain words: the application refuses to start when a setting is wrong.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

/**
 * Validates the values that are present. A value that is missing takes its default (see the config files).
 *
 * @param env - The raw environment
 * @returns The same environment when valid
 * @throws {Error} Lists every wrong value
 */
export function validateEnv(env: Record<string, unknown>): Record<string, unknown> {
  const problems: string[] = [];
  const port = env.APP_PORT;
  if (port !== undefined && (!Number.isInteger(Number(port)) || Number(port) < 1 || Number(port) > 65535)) {
    problems.push('APP_PORT must be a port number');
  }
  const appEnv = env.APP_ENV;
  if (appEnv !== undefined && !['dev', 'test', 'uat', 'prod'].includes(String(appEnv))) {
    problems.push('APP_ENV must be dev, test, uat or prod');
  }
  const transport = env.MAIL_TRANSPORT;
  if (transport !== undefined && !['ses', 'smtp', 'log'].includes(String(transport))) {
    problems.push('MAIL_TRANSPORT must be ses, smtp or log');
  } else if (transport === 'log' && appEnv === 'prod') {
    problems.push('MAIL_TRANSPORT log is not allowed when APP_ENV is prod');
  }
  const smtpPort = env.SMTP_PORT;
  if (smtpPort !== undefined && (!Number.isInteger(Number(smtpPort)) || Number(smtpPort) < 1 || Number(smtpPort) > 65535)) {
    problems.push('SMTP_PORT must be a port number');
  }
  if (problems.length) {
    throw new Error('Wrong environment values: ' + problems.join('; '));
  }
  return env;
}
