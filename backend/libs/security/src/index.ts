/**
 * @file    index.ts
 * @module  SecurityModule
 *
 * @description
 * Public exports of the security library.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-000
 * @subtask        ST-LGN01-000-BE-03
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/security/src/index.ts
 * @lld-synced     v0.5
 * @status         built
 */

export * from './rate-limit/rate-limiter.service';
export * from './module';
