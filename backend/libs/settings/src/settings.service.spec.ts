/**
 * @file    settings.service.spec.ts
 * @module  Tests
 *
 * @description
 * Jest cases of US-LGN01-004 (System serves the sign-in settings before sign-in). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-004
 * @subtask        ST-LGN01-004-BE-02
 * @lld            LLD-EPIC-LGN-01 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/settings/src/settings.service.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { ConfigService } from '@nestjs/config';
import { PublicConfigTransformer } from '@app/auth-apis/transformer/public-config.transformer';
import { SETTING_DEFAULTS } from './settings.defaults';
import { SettingsService } from './settings.service';

const svc = (env: Record<string, string> = {}) => new SettingsService(new ConfigService(env));

describe('System serves the sign-in settings before sign-in (US-LGN01-004)', () => {
  /** @tc TC-LGN01-004-J01 @story US-LGN01-004 @ac AC-US-LGN01-004-01 @subtask ST-LGN01-004-BE-02 */
  it('TC-LGN01-004-J01 the helpdesk phone, e-mail and hours come from the settings, with the placeholder flag', () => {
    const body = new PublicConfigTransformer().toBody(svc({ SETTING_HELPDESK_PHONE: '+91 11 2345 6789' }), 'stub', false);
    expect(body.helpdesk.phone).toBe('+91 11 2345 6789');
    expect(body.helpdesk.email).toBe(SETTING_DEFAULTS['helpdesk.email']);
    expect(body.helpdesk.hours).toBe(SETTING_DEFAULTS['helpdesk.hours']);
    expect(body.helpdesk.placeholder).toBe(true);
  });

  /** @tc TC-LGN01-004-J02 @story US-LGN01-004 @ac AC-US-LGN01-004-02 @subtask ST-LGN01-004-BE-02 */
  it('TC-LGN01-004-J02 the identity mode shows stub outside production and is left out in production', () => {
    const t = new PublicConfigTransformer();
    expect(t.toBody(svc(), 'stub', false).idpMode).toBe('stub');
    expect(t.toBody(svc(), 'stub', true)).not.toHaveProperty('idpMode');
    expect(t.toBody(svc(), 'saml', true).ssoAvailable).toBe(true);
  });

  it('a set value wins, an unset key gives its default, a non-number gives the default of a numeric key', () => {
    expect(svc({ SETTING_SESSION_IDLESECONDS: '600' }).getNumber('session.idleSeconds')).toBe(600);
    expect(svc().get('helpdesk.hours')).toBe(SETTING_DEFAULTS['helpdesk.hours']);
    expect(svc({ SETTING_SESSION_IDLESECONDS: 'abc' }).getNumber('session.idleSeconds')).toBe(1800);
  });
});
