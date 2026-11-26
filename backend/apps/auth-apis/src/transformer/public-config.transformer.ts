/**
 * @file    public-config.transformer.ts
 * @module  AuthModule
 *
 * @description
 * Shapes the public settings. In plain words: builds the body of API-AUTH-05.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-004
 * @subtask        ST-LGN01-004-BE-01
 * @contract       API-AUTH-05
 * @lld            LLD-EPIC-LGN-01 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/apps/auth-apis/src/transformer/public-config.transformer.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import type { SettingsService } from '@libs/settings';

export interface PublicConfigBody {
  ssoAvailable: boolean;
  idpMode?: string;
  helpdesk: { phone: string; email: string; hours: string; placeholder: boolean };
}

/**
 * PublicConfigTransformer.
 *
 * In plain words: builds the body of API-AUTH-05: whether single sign-on is configured, the helpdesk details, and (outside production) the identity mode.
 */
@Injectable()
export class PublicConfigTransformer {
  /** @ac AC-US-LGN01-004-01, AC-US-LGN01-004-02 */
  toBody(settings: SettingsService, idpMode: string | undefined, production: boolean): PublicConfigBody {
    const body: PublicConfigBody = {
      ssoAvailable: Boolean(idpMode),
      helpdesk: {
        phone: settings.get('helpdesk.phone'),
        email: settings.get('helpdesk.email'),
        hours: settings.get('helpdesk.hours'),
        placeholder: settings.get('helpdesk.placeholder') === 'true',
      },
    };
    if (!production && idpMode) body.idpMode = idpMode;
    return body;
  }
}
