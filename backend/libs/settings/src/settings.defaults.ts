/**
 * @file    settings.defaults.ts
 * @module  SettingsModule
 *
 * @description
 * Default setting values. In plain words: the helpdesk placeholders, the idle and warning times and the landing order, so no setting is ever empty.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-000, US-LGN01-004
 * @subtask        ST-LGN01-000-BE-02
 * @lld            LLD-EPIC-LGN-01 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/settings/src/settings.defaults.ts
 * @lld-synced     v0.3
 * @status         built
 */

export const SETTING_DEFAULTS = {
  'helpdesk.phone': '+91 00000 00000',
  'helpdesk.email': 'helpdesk@ipl.example',
  'helpdesk.hours': 'Mon-Sat, 9:00-18:00',
  'helpdesk.placeholder': 'true',
  'session.idleSeconds': '1800',
  'session.warnSeconds': '300',
  'signin.limitPerAddress': '10',
  'signin.limitPerCode': '5',
  'signin.windowSeconds': '60',
  'landing.order': 'ADMINISTRATOR,FINANCE,INITIATOR,PROCESSOR,AUDITOR,REPORT_VIEWER',
} as const;
