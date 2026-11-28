/**
 * @file    module.ts
 * @module  IntegrationsModule
 *
 * @description
 * Chooses the identity provider. In plain words: picks the stub, SAML or OIDC adapter by `IDP_MODE` and refuses the stub in production.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-002
 * @subtask        ST-LGN01-002-BE-03
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/integrations/src/identity/identity.module.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IdentityProviderPort } from './identity/identity-provider.port';
import { OidcIdentityProvider } from './identity/oidc-identity-provider';
import { SamlIdentityProvider } from './identity/saml-identity-provider';
import { TestIdentityProvider } from './identity/test-identity-provider';

/**
 * Picks the identity provider.
 *
 * In plain words: `IDP_MODE` is saml, oidc or stub; the stub is refused when `APP_ENV` is prod (decision L-05).
 */
export function chooseProvider(config: ConfigService, appEnv: string): IdentityProviderPort {
  const mode = config.get<string>('IDP_MODE') ?? (appEnv === 'prod' ? undefined : 'stub');
  if (mode === 'saml') return new SamlIdentityProvider(config);
  if (mode === 'oidc') return new OidcIdentityProvider(config);
  if (mode === 'stub') {
    if (appEnv === 'prod') throw new Error('IDP_MODE=stub is refused in production');
    return new TestIdentityProvider(config);
  }
  throw new Error('IDP_MODE must be SAML (saml) or OIDC (oidc); the stub is allowed outside production only');
}

/**
 * IdentityModule.
 *
 * In plain words: provides IdentityProviderPort by configuration
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-002
   *   workflows: UF-01
   *   ac:        AC-US-LGN01-002-03, AC-US-LGN01-002-08
   *   lld:       LLD-EPIC-LGN-01 v0.5 section 6.2
 */
@Module({
  providers: [{ provide: IdentityProviderPort, useFactory: (config: ConfigService) => chooseProvider(config, config.get<string>('APP_ENV') ?? 'dev'), inject: [ConfigService] }],
  exports: [IdentityProviderPort],
})
export class IdentityModule {
}
