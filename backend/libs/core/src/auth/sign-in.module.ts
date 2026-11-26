/**
 * @file    sign-in.module.ts
 * @module  AuthCoreModule
 *
 * @description
 * Nest module of the sign-in services. In plain words: the Auth API imports this one module.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-001
 * @subtask        ST-LGN01-001-BE-02
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/sign-in.module.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Module } from '@nestjs/common';
import { AuditModule } from '@libs/audit';
import { IdentityModule } from '@libs/integrations';
import { RateLimitModule } from '@libs/security';
import { SettingsModule } from '@libs/settings';
import { UsersModule } from '@libs/users';
import { RedisModule } from '../redis';
import { AccountLockPolicy } from './account-lock.policy';
import { AuthCoreModule } from './auth-core.module';
import { LocalSignInService } from './local-sign-in.service';
import { SessionService } from './session.service';
import { SignInAuditWriter } from './sign-in-audit.writer';
import { SsoSignInService } from './sso-sign-in.service';
import { SsoStateStore } from './sso-state.store';
import { TokenService } from './token.service';

/**
 * SignInModule.
 *
 * In plain words: gathers the sign-in services (password, single sign-on, session) so the Auth API imports one module.
 */
@Module({
  imports: [AuthCoreModule, UsersModule, AuditModule, RedisModule, RateLimitModule, IdentityModule, SettingsModule],
  providers: [AccountLockPolicy, TokenService, SignInAuditWriter, SessionService, SsoStateStore, LocalSignInService, SsoSignInService],
  exports: [LocalSignInService, SsoSignInService, SessionService, TokenService],
})
export class SignInModule {}
