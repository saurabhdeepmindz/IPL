/**
 * @file    identity-provider.port.ts
 * @module  IntegrationsModule
 *
 * @description
 * The identity provider port. In plain words: the interface AMS uses to reach IPL's identity provider; the protocol behind it can be SAML, OIDC or the test stub.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-002
 * @subtask        ST-LGN01-002-BE-03
 * @contract       API-AUTH-02, API-AUTH-03
 * @lld            LLD-EPIC-LGN-01 v0.3 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/integrations/src/identity/identity-provider.port.ts
 * @lld-synced     v0.3
 * @status         built
 */

/**
 * IdentityProviderPort.
 *
 * In plain words: start and complete one single sign-on round trip
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-002
   *   workflows: UF-01
   *   contracts: API-AUTH-02, API-AUTH-03
   *   ac:        AC-US-LGN01-002-01, AC-US-LGN01-002-05, AC-US-LGN01-002-06, AC-US-LGN01-002-07
   *   lld:       LLD-EPIC-LGN-01 v0.3 section 6.2
 */
export abstract class IdentityProviderPort {
  /**
   * start.
   *
   * In plain words: returns the address of the provider where the browser must go
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-002
   * @subtask   ST-LGN01-002-BE-03
   * @workflow  UF-01
   * @contract  API-AUTH-02, API-AUTH-03
   * @ac        AC-US-LGN01-002-01
   * @lld       LLD-EPIC-LGN-01 v0.3 §6.2
   * @status    built
   *
   * @returns Promise<string>
   */
  abstract start(state: string): Promise<string>;

  /**
   * complete.
   *
   * In plain words: checks the provider's answer and returns the employee code
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-002
   * @subtask   ST-LGN01-002-BE-03
   * @workflow  UF-01
   * @contract  API-AUTH-02, API-AUTH-03
   * @ac        AC-US-LGN01-002-01, AC-US-LGN01-002-05, AC-US-LGN01-002-06, AC-US-LGN01-002-07
   * @lld       LLD-EPIC-LGN-01 v0.3 §6.2
   * @status    built
   *
   * @returns Promise<{ employeeCode: string }>
   */
  abstract complete(response: Record<string, string>): Promise<{ employeeCode: string }>;
}
