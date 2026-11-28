/**
 * @file    forgot-password.dto.ts
 * @module  AuthModule
 *
 * @description
 * Request shape of API-PWD-01. In plain words: employee code and official e-mail with their validation.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-001
 * @subtask        ST-LGN02-001-BE-01
 * @contract       API-PWD-01
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/apps/auth-apis/src/dtos/forgot-password.dto.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { IsEmail, Matches } from 'class-validator';

/**
 * ForgotPasswordDto.
 *
 * In plain words: the body of API-PWD-01: a five-digit employee code and the official e-mail.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-001
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-001-01
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
export class ForgotPasswordDto {
  @Matches(/^\d{5}$/, { message: 'Employee code must be 5 digits' })
  employeeCode!: string;

  @IsEmail({}, { message: 'Enter a valid e-mail address' })
  email!: string;
}
