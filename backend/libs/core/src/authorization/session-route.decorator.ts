/**
 * @file    session-route.decorator.ts
 * @module  AuthorizationModule
 *
 * @description
 * The tag for a route that a signed-in user opens before a company is chosen. In plain words: right after sign-in the session has no company yet, so `GET /me` and `PUT /me/context` carry this tag; they need a good token but no permission and no company check.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-001
 * @subtask        ST-LGN03-001-BE-01
 * @lld            LLD-EPIC-LGN-03 v0.2 §6.0 (change recorded in the next LLD version)
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.2.md
 * @status         built
 */

import { SetMetadata } from '@nestjs/common';
import { SESSION_ROUTE_KEY } from './session-user.interface';

/**
 * Marks a route as a session route.
 *
 * In plain words: only the company-choice routes use it. A token with no company opens these and no other route.
 *
 * @rtm
 *   epics:     EPIC-LGN-03
 *   stories:   US-LGN03-001, US-LGN03-002
 *   workflows: UF-03
 *   contracts: API-ME-01, API-ME-02
 *   ac:        AC-US-LGN03-001-01
 *   lld:       LLD-EPIC-LGN-03 v0.2 section 6.0
 */
export const SessionRoute = (): MethodDecorator & ClassDecorator => {
  return SetMetadata(SESSION_ROUTE_KEY, true);
};
