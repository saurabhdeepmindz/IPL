/**
 * @file    index.ts
 * @module  AuthCoreModule
 *
 * @description
 * Exports. In plain words: one import line for the exceptions of the sign-in, context and password flows.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R18-S35
 * @status  built
 */

export * from './account-inactive.exception';
export * from './account-locked.exception';
export * from './company-not-allowed.exception';
export * from './invalid-credentials.exception';
export * from './invalid-state.exception';
export * from './invalid-year.exception';
export * from './link-expired.exception';
export * from './not-required.exception';
export * from './password-policy.exception';
export * from './password-reused.exception';
export * from './rate-limited.exception';
export * from './same-as-temporary.exception';
export * from './session-ended.exception';

/** The exceptions of the identity provider are re-exported here (they were part of the sign-in errors). */
export { IdentityProviderUnavailableException, NoAmsAccountException, SignInCancelledException } from '@libs/integrations';
