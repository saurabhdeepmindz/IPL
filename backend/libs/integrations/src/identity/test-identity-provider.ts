/**
 * @file    test-identity-provider.ts
 * @module  IntegrationsModule
 *
 * @description
 * The stub identity provider. In plain words: signs in configured test accounts and can pretend to fail, so every single sign-on screen can be tried before IPL gives the provider details.
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
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/integrations/src/identity/test-identity-provider.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { IdentityProviderPort } from './identity-provider.port';
import { ConfigService } from '@nestjs/config';
import { IdentityProviderUnavailableException, NoAmsAccountException, SignInCancelledException } from './identity-errors';

/**
 * TestIdentityProvider.
 *
 * In plain words: the stub of IdentityProviderPort (`IDP_MODE=stub`, never in production)
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-002
   *   workflows: UF-01
   *   contracts: API-AUTH-02, API-AUTH-03
   *   ac:        AC-US-LGN01-002-08
   *   lld:       LLD-EPIC-LGN-01 v0.5 section 6.2
 */
@Injectable()
export class TestIdentityProvider extends IdentityProviderPort {
  constructor(private readonly config: ConfigService) {
    super();
  }

  /**
   * start.
   *
   * In plain words: returns a local address that finishes the round trip
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-002
   * @subtask   ST-LGN01-002-BE-03
   * @workflow  UF-01
   * @contract  API-AUTH-02, API-AUTH-03
   * @ac        AC-US-LGN01-002-08
   * @lld       LLD-EPIC-LGN-01 v0.5 §6.2
   * @status    built
   *
   * @returns Promise<string>
   */
  async start(state: string): Promise<string> {
    const account = this.config.get<string>('IDP_STUB_ACCOUNT') ?? 'ok-10002';
    return '/api/v1/auth/sso/callback?state=' + encodeURIComponent(state) + '&account=' + encodeURIComponent(account);
  }

  /**
   * complete.
   *
   * In plain words: answers by the account named in the address
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-002
   * @subtask   ST-LGN01-002-BE-03
   * @workflow  UF-01
   * @contract  API-AUTH-02, API-AUTH-03
   * @ac        AC-US-LGN01-002-08
   * @lld       LLD-EPIC-LGN-01 v0.5 §6.2
   * @status    built
   *
   * @returns Promise<{ employeeCode: string }>
   */
  async complete(response: Record<string, string>): Promise<{ employeeCode: string }> {
    const account = response.account ?? '';
    if (account === 'fail') throw new IdentityProviderUnavailableException('The test provider did not answer');
    if (account === 'noaccount') throw new NoAmsAccountException('s.krishnan@ipl.example');
    if (account === 'cancel') throw new SignInCancelledException();
    const m = /^ok-(\d{5})$/.exec(account);
    if (!m) throw new IdentityProviderUnavailableException('The test account is not known');
    return { employeeCode: m[1] };
  }
}
