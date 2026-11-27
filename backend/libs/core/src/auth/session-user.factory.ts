/**
 * @file    session-user.factory.ts
 * @module  CoreModule
 *
 * @description
 * Builds the session user from token claims. In plain words: the single place that turns token claims into the SessionUser used by the guards.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-06
 */

import { Injectable } from '@nestjs/common';
import { AccessClaims } from './session-user.shape';
import { SessionUser } from '../authorization/session-user.interface';

/**
 * Session user factory.
 *
 * In plain words: the real sign-in epic replaces how the claims are made, not this shape.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Injectable()
export class SessionUserFactory {
  /**
   * Build the session user.
   *
   * In plain words: copies the claims into the four fields the guards read.
   *
   * @param claims The verified token claims
   * @returns The session user
   * @dependencies none
   */
  fromClaims(claims: AccessClaims): SessionUser {
    return { userId: claims.sub, employeeCode: claims.emp, companyCode: claims.company, departmentId: claims.dept ?? null, ...(claims.fy ? { financialYear: claims.fy } : {}) };
  }
}
