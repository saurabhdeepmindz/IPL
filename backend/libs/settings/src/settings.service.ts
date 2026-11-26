/**
 * @file    settings.service.ts
 * @module  SettingsModule
 *
 * @description
 * Reads named settings. In plain words: gives a setting value from configuration, or its default; Admin A2 later reads them from a table.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-000, US-LGN01-004
 * @subtask        ST-LGN01-000-BE-02
 * @lld            LLD-EPIC-LGN-01 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/settings/src/settings.service.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SETTING_DEFAULTS } from './settings.defaults';

/**
 * SettingsService.
 *
 * In plain words: reads settings with defaults
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-000, US-LGN01-004
   *   workflows: UF-01
   *   lld:       LLD-EPIC-LGN-01 v0.3 section 6.0
 */
@Injectable()
export class SettingsService {
  constructor(
    private readonly config: ConfigService,
  ) {}

  /**
   * get.
   *
   * In plain words: returns the value of a setting or its default
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-000
   * @subtask   ST-LGN01-000-BE-02
   * @workflow  UF-01
   * @lld       LLD-EPIC-LGN-01 v0.3 §6.0
   * @status    built
   *
   * @dependencies ConfigService, SETTING_DEFAULTS
   *
   * @returns string
   */
  get(key: keyof typeof SETTING_DEFAULTS): string {
    const fromEnv = this.config.get<string>('SETTING_' + key.toUpperCase().replace(/[^A-Z0-9]/g, '_'));
    return fromEnv !== undefined && fromEnv !== '' ? fromEnv : SETTING_DEFAULTS[key];
  }

  /**
   * getNumber.
   *
   * In plain words: returns a numeric setting
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-000
   * @subtask   ST-LGN01-000-BE-02
   * @workflow  UF-01
   * @lld       LLD-EPIC-LGN-01 v0.3 §6.0
   * @status    built
   *
   * @dependencies SettingsService.get
   *
   * @returns number
   */
  getNumber(key: keyof typeof SETTING_DEFAULTS): number {
    const n = Number(this.get(key));
    return Number.isInteger(n) && n >= 0 ? n : Number(SETTING_DEFAULTS[key]);
  }
}
