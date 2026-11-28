/**
 * @file    sign-in.dto.ts
 * @module  AuthModule
 *
 * @description
 * Request shape of the password sign-in. In plain words: employee code and password with their validation.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-001
 * @subtask        ST-LGN01-001-BE-01
 * @contract       API-AUTH-01
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/apps/auth-apis/src/dtos/sign-in.dto.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * SignInDto.
 *
 * In plain words: the body of API-AUTH-01: a five-digit employee code and a password of up to 128 characters.
 */
export class SignInDto {
  @Matches(/^\d{5}$/, { message: 'Employee code must be 5 digits' })
  employeeCode!: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  @MaxLength(128, { message: 'Password is too long' })
  password!: string;
}
