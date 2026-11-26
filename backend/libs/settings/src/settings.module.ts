/**
 * @file    settings.module.ts
 * @module  SettingsModule
 *
 * @description
 * Exports the settings service. In plain words: the Nest module of the settings library.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-000
 * @subtask        ST-LGN01-000-BE-02
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/settings/src/settings.module.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';

/**
 * SettingsModule.
 *
 * In plain words: module of the settings library
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-000
   *   workflows: UF-01
   *   lld:       LLD-EPIC-LGN-01 v0.5 section 6.0
 */
@Module({ providers: [SettingsService], exports: [SettingsService] })
export class SettingsModule {
}
