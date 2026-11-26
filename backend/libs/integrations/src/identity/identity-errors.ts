/**
 * @file    identity-errors.ts
 * @module  IntegrationsModule
 *
 * @description
 * Errors of the identity provider. In plain words: the three ways a single sign-on round trip can end without a person.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-002
 * @subtask        ST-LGN01-002-BE-03
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/integrations/src/identity/identity-errors.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { AppException } from '@libs/common';

/** 503 IDP_UNAVAILABLE: the identity provider cannot be reached, or is not configured yet. @story US-LGN01-002 @ac AC-US-LGN01-002-05 */
export class IdentityProviderUnavailableException extends AppException {
  constructor(reason = 'The identity provider did not answer') {
    super(503, 'IDP_UNAVAILABLE', reason);
  }
}

/** The provider confirmed a person who has no AMS user. @story US-LGN01-002 @ac AC-US-LGN01-002-06 */
export class NoAmsAccountException extends AppException {
  constructor() {
    super(403, 'NO_AMS_ACCOUNT', 'There is no active AMS user for this person');
  }
}

/** The user stopped at the provider. @story US-LGN01-002 @ac AC-US-LGN01-002-07 */
export class SignInCancelledException extends AppException {
  constructor() {
    super(400, 'SIGN_IN_CANCELLED', 'The sign-in was cancelled');
  }
}
