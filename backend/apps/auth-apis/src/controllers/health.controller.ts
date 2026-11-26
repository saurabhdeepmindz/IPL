/**
 * @file    health.controller.ts
 * @module  AuthApis
 *
 * @description
 * Health route of the Auth API. In plain words: answers without a token so the application can be checked.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-000
 * @subtask        ST-LGN01-000-BE-01
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/apps/auth-apis/src/controllers/health.controller.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Controller, Get } from '@nestjs/common';

/**
 * HealthController.
 *
 * In plain words: answers `GET /api/v1/health` without a token, so the load balancer and the smoke test can see the Auth API is up.
 */
@Controller('health')
export class HealthController {
  @Get()
  check(): { status: 'ok'; time: string } {
    return { status: 'ok', time: new Date().toISOString() };
  }
}
