/**
 * @file    index.ts
 * @module  IntegrationsModule
 *
 * @description
 * Public exports of the integrations library.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-002
 * @subtask        ST-LGN01-002-BE-03
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/integrations/src/index.ts
 * @lld-synced     v0.4
 * @status         built
 */

export * from './identity/identity-provider.port';
export * from './identity/test-identity-provider';
export * from './identity/saml-identity-provider';
export * from './identity/oidc-identity-provider';
export * from './identity/identity.module';
export * from './identity/identity-errors';
