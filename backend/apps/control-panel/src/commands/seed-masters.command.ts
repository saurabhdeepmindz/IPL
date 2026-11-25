/**
 * @file    seed-masters.command.ts
 * @module  ControlPanel
 *
 * @description
 * Command seed:masters. In plain words: creates the companies, departments and designations the stories assume, until EPIC-ADM-02 builds the master screens.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-07
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { COMPANIES, DEPARTMENTS, DESIGNATIONS } from './seed-data';

/**
 * seed:masters.
 *
 * In plain words: safe to run again; existing rows are kept and only missing ones are added.
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
export class SeedMastersCommand {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Run the command.
   *
   * In plain words: adds the master rows that are missing.
   *
   * @returns Counts of the three master tables for the seeded codes
   * @dependencies PrismaService.raw
   */
  async run(): Promise<{ companies: number; departments: number; designations: number }> {
    const db = this.prisma.raw;
    for (const c of COMPANIES) await db.company.upsert({ where: { code: c.code }, update: {}, create: c });
    for (const d of DEPARTMENTS) await db.department.upsert({ where: { code: d.code }, update: {}, create: d });
    for (const d of DESIGNATIONS) await db.designation.upsert({ where: { code: d.code }, update: { isHighest: d.isHighest ?? false }, create: d });
    return { companies: COMPANIES.length, departments: DEPARTMENTS.length, designations: DESIGNATIONS.length };
  }
}
