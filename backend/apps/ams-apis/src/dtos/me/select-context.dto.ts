/**
 * @file    select-context.dto.ts
 * @module  AuthModule
 *
 * @description
 * Request shape of API-ME-02. In plain words: company code and financial year.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN03-002
 * @subtask        ST-LGN03-002-BE-01
 * @contract       API-ME-02
 * @lld            LLD-EPIC-LGN-03 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/apps/ams-apis/src/dtos/me/select-context.dto.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { IsString, Length, Matches } from 'class-validator';

/**
 * SelectContextDto.
 *
 * In plain words: body of API-ME-02: the company code and the financial year (for example 2026-27) the user chooses.
 *
 * @rtm
 *   epics:     EPIC-LGN-03
 *   stories:   US-LGN03-002
 *   workflows: UF-03
 *   contracts: API-ME-02
 *   ac:        AC-US-LGN03-002-01
 *   lld:       LLD-EPIC-LGN-03 v0.3 section 6.0
 */
export class SelectContextDto {
  /** The company, for example IPL (at most 10 characters, as in the company table). */
  @IsString()
  @Length(1, 10)
  companyCode!: string;

  /** The financial year, written as 2026-27. */
  @Matches(/^\d{4}-\d{2}$/, { message: 'Write the financial year as 2026-27' })
  financialYear!: string;
}
