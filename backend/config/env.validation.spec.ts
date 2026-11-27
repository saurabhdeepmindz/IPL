/**
 * @file    env.validation.spec.ts
 * @module  EPIC-LGN-02
 *
 * @description
 * Checks the mail values of the environment check. In plain words: a mail transport must be one of three and the log transport must never run in production.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-27
 *
 * @story          US-LGN02-000
 * @subtask        ST-LGN02-000-BE-03
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/config/env.validation.spec.ts
 * @lld-synced     v0.5
 * @status         built
 */
import { validateEnv } from './env.validation';

describe('Mail settings of the environment check (US-LGN02-000)', () => {
  it('TC-LGN02-000-U01 accepts ses, smtp and log outside production', () => {
    for (const t of ['ses', 'smtp', 'log']) {
      expect(() => validateEnv({ APP_ENV: 'dev', MAIL_TRANSPORT: t })).not.toThrow();
    }
  });

  it('TC-LGN02-000-U02 refuses log in production (decision L-03)', () => {
    expect(() => validateEnv({ APP_ENV: 'prod', MAIL_TRANSPORT: 'log' })).toThrow(/MAIL_TRANSPORT/);
    expect(() => validateEnv({ APP_ENV: 'prod', MAIL_TRANSPORT: 'ses' })).not.toThrow();
  });

  it('TC-LGN02-000-U03 refuses an unknown transport and a wrong SMTP port', () => {
    expect(() => validateEnv({ APP_ENV: 'dev', MAIL_TRANSPORT: 'carrier-pigeon' })).toThrow(/MAIL_TRANSPORT/);
    expect(() => validateEnv({ APP_ENV: 'dev', SMTP_PORT: '99999' })).toThrow(/SMTP_PORT/);
  });

  it('TC-LGN02-000-U04 uses a safe default when nothing is set', () => {
    expect(() => validateEnv({})).not.toThrow();
  });
});
