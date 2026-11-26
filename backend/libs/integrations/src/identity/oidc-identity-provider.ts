/**
 * @file    oidc-identity-provider.ts
 * @module  IntegrationsModule
 *
 * @description
 * OIDC adapter. In plain words: talks to IPL's provider over OpenID Connect if IPL chooses it.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-002
 * @subtask        ST-LGN01-002-BE-03
 * @contract       API-AUTH-02, API-AUTH-03
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/integrations/src/identity/oidc-identity-provider.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { IdentityProviderPort } from './identity-provider.port';
import { ConfigService } from '@nestjs/config';
import { IdentityProviderUnavailableException } from './identity-errors';

/**
 * OidcIdentityProvider.
 *
 * In plain words: OIDC implementation of IdentityProviderPort
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-002
   *   workflows: UF-01
   *   contracts: API-AUTH-02, API-AUTH-03
   *   ac:        AC-US-LGN01-002-01, AC-US-LGN01-002-03
   *   lld:       LLD-EPIC-LGN-01 v0.4 section 6.2
 */
@Injectable()
export class OidcIdentityProvider extends IdentityProviderPort {
  constructor(private readonly config: ConfigService) {
    super();
  }

  /**
   * start.
   *
   * In plain words: builds the authorization request
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-002
   * @subtask   ST-LGN01-002-BE-03
   * @workflow  UF-01
   * @contract  API-AUTH-02, API-AUTH-03
   * @ac        AC-US-LGN01-002-01, AC-US-LGN01-002-03
   * @lld       LLD-EPIC-LGN-01 v0.4 §6.2
   * @status    built
   *
   * @returns Promise<string>
   */
  async start(state: string): Promise<string> {
    const base = this.config.get<string>('OIDC_AUTHORIZE_URL');
    const client = this.config.get<string>('OIDC_CLIENT_ID');
    const redirect = this.config.get<string>('OIDC_REDIRECT_URI');
    if (!base || !client || !redirect) throw new IdentityProviderUnavailableException('OIDC is not configured yet (IPL provider details, open point OP-L2)');
    const q = new URLSearchParams({ response_type: 'code', client_id: client, redirect_uri: redirect, scope: 'openid profile', state });
    return base + '?' + q.toString();
  }

  /**
   * complete.
   *
   * In plain words: exchanges the code and reads the identity
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-002
   * @subtask   ST-LGN01-002-BE-03
   * @workflow  UF-01
   * @contract  API-AUTH-02, API-AUTH-03
   * @ac        AC-US-LGN01-002-01, AC-US-LGN01-002-03
   * @lld       LLD-EPIC-LGN-01 v0.4 §6.2
   * @status    built
   *
   * @returns Promise<{ employeeCode: string }>
   */
  async complete(_response: Record<string, string>): Promise<{ employeeCode: string }> {
    throw new IdentityProviderUnavailableException('OIDC token validation waits for the IPL provider details (open point OP-L2)');
  }
}
