/**
 * @file    health.controller.ts
 * @module  AmsApisModule
 *
 * @description
 * The health route. In plain words: lets the team and the load balancer ask "is the API running?".
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { Controller, Get } from '@nestjs/common';

/** Response of the health route. */
export interface HealthStatus {
  /** Always `ok` while the API is running. */
  status: 'ok';
  /** Time of the answer in ISO 8601 (UTC). */
  time: string;
}

/**
 * Health route of the API.
 *
 * In plain words: answers "ok" so that anyone can see the API is up.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   none (foundation work package)
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Controller('health')
export class HealthController {
  /**
   * Answers that the API is running.
   *
   * In plain words: no sign-in is needed; this route is open on purpose. The open-route mark (`@Public`) arrives with
   * US-ADM01-017; until then no guard exists, so the route is open.
   *
   * @epic      EPIC-ADM-01
   * @subtask   ST-ADM01-000-BE-01
   * @lld       LLD-EPIC-ADM-01 v0.5 section 6.0
   * @status    built
   *
   * @dependencies none
   *
   * @returns The status and the time of the answer
   */
  @Get()
  check(): HealthStatus {
    return { status: 'ok', time: new Date().toISOString() };
  }
}
