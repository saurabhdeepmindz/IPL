/**
 * @file    index.ts
 * @module  CoreModule
 *
 * @description
 * Exports of the auth helpers. In plain words: one import line.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-06
 */

export * from './session-user.shape';
export * from './session-user.factory';
export * from './dev-sign-in.service';
export * from './jwt-auth.guard';
export * from './auth-core.module';
export * from './sign-in.types';
export * from './account-lock.policy';
export * from './token.service';
export * from './session.service';
export * from './sign-in-audit.writer';
export * from './sso-state.store';
export * from './sso-sign-in.service';
export * from './local-sign-in.service';
export * from './sign-in.module';
export * from './errors/auth-errors';
export * from './errors/password-errors';
export * from './password-policy.service';
export * from './password-reset-request.service';
export * from './password-reset.service';
export * from './temporary-password-change.service';
export * from './repositories/password-history/contract';
export * from './repositories/password-reset-token/contract';
