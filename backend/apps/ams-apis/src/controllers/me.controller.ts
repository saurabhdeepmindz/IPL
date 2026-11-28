/**
 * @file    me.controller.ts
 * @module  AmsApis
 *
 * @description
 * The session context routes. In plain words: thin routes for reading my companies and years and for choosing the company and year of the session.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN03-001, US-LGN03-002
 * @subtask        ST-LGN03-001-BE-01
 * @subtask        ST-LGN03-002-BE-01
 * @contract       API-ME-01, API-ME-02
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/apps/ams-apis/src/controllers/me.controller.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { okResponse } from '@libs/common';
import { CompanySelectionService, SessionRoute, SessionUser } from '@libs/core';
import { SelectContextDto } from '../dtos/me/select-context.dto';
import { MeProfileTransformer } from '../transformer/me-profile.transformer';

/**
 * MeController.
 *
 * In plain words: the /me family of routes
 *
 * @rtm
   *   epics:     EPIC-LGN-03
   *   stories:   US-LGN03-001, US-LGN03-002
   *   workflows: UF-03
   *   frd:       FR-040.1, FR-040.2, FR-040.4, FR-040.5, FR-040.6
   *   contracts: API-ME-01, API-ME-02
   *   ac:        AC-US-LGN03-001-01, AC-US-LGN03-001-02, AC-US-LGN03-001-03, AC-US-LGN03-001-04, AC-US-LGN03-002-01, AC-US-LGN03-002-02, AC-US-LGN03-002-03, AC-US-LGN03-002-04, AC-US-LGN03-002-05, AC-US-LGN03-002-06
   *   lld:       LLD-EPIC-LGN-03 v0.4 section 6.0
 */
@Controller('me')
export class MeController {
  constructor(
    private readonly selection: CompanySelectionService,
    private readonly profiles: MeProfileTransformer,
  ) {}

  /**
   * profile.
   *
   * In plain words: reads my profile, companies, roles, years and context
   *
   * @epic      EPIC-LGN-03
   * @story     US-LGN03-001
   * @subtask   ST-LGN03-001-BE-01
   * @frd       FR-040.1, FR-040.2, FR-040.4, FR-040.5, FR-040.6
   * @workflow  UF-03
   * @contract  API-ME-01
   * @ac        AC-US-LGN03-001-01, AC-US-LGN03-001-02, AC-US-LGN03-001-03, AC-US-LGN03-001-04
   * @lld       LLD-EPIC-LGN-03 v0.4 §6.0
   * @status    built
   *
   * @dependencies CompanySelectionService.profile, MeProfileTransformer.toBody
   *
   * @returns Promise<MeProfile>
   */
  @SessionRoute()
  @ApiOperation({ summary: 'My profile, companies, roles, years and context (API-ME-01)' })
  @Get()
  async profile(@Req() req: { user: SessionUser }): Promise<unknown> {
    const input = await this.selection.profile(req.user);
    return okResponse(this.profiles.toBody(input));
  }

  /**
   * selectContext.
   *
   * In plain words: chooses the company and financial year of the session and returns the landing page and a new access token.
   *
   * @epic      EPIC-LGN-03
   * @story     US-LGN03-002
   * @subtask   ST-LGN03-002-BE-01
   * @frd       FR-040.1, FR-040.2, FR-040.4, FR-040.5, FR-040.6
   * @workflow  UF-03
   * @contract  API-ME-02
   * @ac        AC-US-LGN03-002-01, AC-US-LGN03-002-02, AC-US-LGN03-002-03, AC-US-LGN03-002-04, AC-US-LGN03-002-05, AC-US-LGN03-002-06
   * @lld       LLD-EPIC-LGN-03 v0.4 §6.0
   * @status    built
   *
   * @dependencies CompanySelectionService.select
   *
   * @param dto The company code and financial year chosen
   * @param req The request with the signed-in user
   * @returns The context, the landing page and the new access token
   */
  @SessionRoute()
  @ApiOperation({ summary: 'Choose the company and financial year of the session (API-ME-02)' })
  @Put('context')
  async selectContext(@Body() dto: SelectContextDto, @Req() req: { user: SessionUser }): Promise<unknown> {
    return okResponse(await this.selection.select(dto, req.user));
  }
}
