/**
 * @file    saml-identity-provider.ts
 * @module  IntegrationsModule
 *
 * @description
 * SAML 2.0 adapter. In plain words: talks to IPL's provider over SAML 2.0 once IPL gives the metadata.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-002
 * @subtask        ST-LGN01-002-BE-03
 * @contract       API-AUTH-02, API-AUTH-03
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/integrations/src/identity/saml-identity-provider.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { IdentityProviderPort } from './identity-provider.port';
import { ConfigService } from '@nestjs/config';
import { IdentityProviderUnavailableException } from './identity-errors';

/**
 * SamlIdentityProvider.
 *
 * In plain words: SAML implementation of IdentityProviderPort
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-002
   *   workflows: UF-01
   *   contracts: API-AUTH-02, API-AUTH-03
   *   ac:        AC-US-LGN01-002-01, AC-US-LGN01-002-03
   *   lld:       LLD-EPIC-LGN-01 v0.5 section 6.2
 */
@Injectable()
export class SamlIdentityProvider extends IdentityProviderPort {
  constructor(private readonly config: ConfigService) {
    super();
  }

  /**
   * start.
   *
   * In plain words: builds the SAML request
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-002
   * @subtask   ST-LGN01-002-BE-03
   * @workflow  UF-01
   * @contract  API-AUTH-02, API-AUTH-03
   * @ac        AC-US-LGN01-002-01, AC-US-LGN01-002-03
   * @lld       LLD-EPIC-LGN-01 v0.5 §6.2
   * @status    built
   *
   * @returns Promise<string>
   */
  async start(state: string): Promise<string> {
    const url = this.config.get<string>('SAML_SSO_URL');
    if (!url) throw new IdentityProviderUnavailableException('SAML is not configured yet (IPL provider details, open point OP-L2)');
    return url + (url.includes('?') ? '&' : '?') + 'RelayState=' + encodeURIComponent(state);
  }

  /**
   * complete.
   *
   * In plain words: validates the SAML response
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-002
   * @subtask   ST-LGN01-002-BE-03
   * @workflow  UF-01
   * @contract  API-AUTH-02, API-AUTH-03
   * @ac        AC-US-LGN01-002-01, AC-US-LGN01-002-03
   * @lld       LLD-EPIC-LGN-01 v0.5 §6.2
   * @status    built
   *
   * @returns Promise<{ employeeCode: string }>
   */
  async complete(_response: Record<string, string>): Promise<{ employeeCode: string }> {
    throw new IdentityProviderUnavailableException('SAML response validation waits for the IPL provider details (open point OP-L2)');
  }
}
