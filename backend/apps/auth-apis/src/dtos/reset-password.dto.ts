/**
 * @file    reset-password.dto.ts
 * @module  AuthModule
 *
 * @description
 * Request shape of API-PWD-03. In plain words: the link token and the new password.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-002
 * @subtask        ST-LGN02-002-BE-01
 * @contract       API-PWD-03
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/apps/auth-apis/src/dtos/reset-password.dto.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * ResetPasswordDto.
 *
 * In plain words: the body of API-PWD-03: the token of the link and the new password (the length and the character rules are judged by the password policy, which lists every rule that is not met).
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-002
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-002-02
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.0
 */
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'The link is not complete' })
  token!: string;

  @IsString()
  @MaxLength(128, { message: 'The password is too long' })
  newPassword!: string;
}
