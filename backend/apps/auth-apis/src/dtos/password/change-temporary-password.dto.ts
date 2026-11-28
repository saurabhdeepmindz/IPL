/**
 * @file    change-temporary-password.dto.ts
 * @module  AuthModule
 *
 * @description
 * Request shape of API-PWD-04. In plain words: the temporary and the new password.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-004
 * @subtask        ST-LGN02-004-BE-01
 * @contract       API-PWD-04
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/apps/auth-apis/src/dtos/change-temporary-password.dto.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * ChangeTemporaryPasswordDto.
 *
 * In plain words: the body of API-PWD-04: the temporary password and the new password.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-004
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-004-02
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
export class ChangeTemporaryPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Enter the temporary password' })
  @MaxLength(128)
  temporaryPassword!: string;

  @IsString()
  @MaxLength(128, { message: 'The password is too long' })
  newPassword!: string;
}
