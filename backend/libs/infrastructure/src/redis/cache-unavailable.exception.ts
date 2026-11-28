/**
 * @file    cache-unavailable.exception.ts
 * @module  CoreModule
 *
 * @description
 * Raised when Redis cannot be reached. In plain words: the cache is down; the caller decides whether to carry on without it.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-05
 */

import { AppException } from '@libs/common';

/**
 * CacheUnavailableException.
 *
 * In plain words: a typed error for a Redis fault, with the original error kept as the cause.
 *
 * HTTP code: 503. Trigger: connection refused, timeout or any Redis command error. Example: `throw new CacheUnavailableException(err)`.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
export class CacheUnavailableException extends AppException {
  constructor(readonly originalError?: unknown) {
    super(503, 'CACHE_UNAVAILABLE', 'The cache is not available');
  }
}
