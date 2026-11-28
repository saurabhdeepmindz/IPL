/**
 * @file    me-profile.transformer.ts
 * @module  AmsApis
 *
 * @description
 * Shapes the profile answer. In plain words: builds the body of API-ME-01 with companies, years, context and the helpdesk values.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN03-001
 * @subtask        ST-LGN03-001-BE-01
 * @contract       API-ME-01
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/apps/ams-apis/src/transformer/me-profile.transformer.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { MeProfile, ProfileInput } from '@libs/core';

/**
 * MeProfileTransformer.
 *
 * In plain words: builds the profile body
 *
 * @rtm
   *   epics:     EPIC-LGN-03
   *   stories:   US-LGN03-001
   *   workflows: UF-03
   *   contracts: API-ME-01
   *   ac:        AC-US-LGN03-001-01, AC-US-LGN03-001-02, AC-US-LGN03-001-03
   *   lld:       LLD-EPIC-LGN-03 v0.4 section 6.0
 */
@Injectable()
export class MeProfileTransformer {
  /**
   * toBody.
   *
   * In plain words: builds `{employeeCode, name, companies, financialYears, context, helpdesk}`
   *
   * @epic      EPIC-LGN-03
   * @story     US-LGN03-001
   * @subtask   ST-LGN03-001-BE-01
   * @workflow  UF-03
   * @contract  API-ME-01
   * @ac        AC-US-LGN03-001-01, AC-US-LGN03-001-02, AC-US-LGN03-001-03
   * @lld       LLD-EPIC-LGN-03 v0.4 §6.0
   * @status    built
   *
   * @returns MeProfile
   */
  toBody(input: ProfileInput): MeProfile {
    return {
      employeeCode: input.user.employeeCode,
      name: input.user.fullName,
      companies: input.companies,
      financialYears: input.years,
      context: input.context,
      helpdesk: input.helpdesk,
    };
  }
}
