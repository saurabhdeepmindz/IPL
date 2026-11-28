/**
 * @file    financial-year.service.ts
 * @module  OrganisationModule
 *
 * @description
 * Financial years. In plain words: lists the financial years (April to March) and marks the current one.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN03-001, US-LGN03-002
 * @subtask        ST-LGN03-001-BE-02
 * @contract       API-ME-01
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/libs/organisation/src/services/financial-year.service.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { Injectable } from '@nestjs/common';

/**
 * FinancialYearService.
 *
 * In plain words: the year list
 *
 * @rtm
   *   epics:     EPIC-LGN-03
   *   stories:   US-LGN03-001, US-LGN03-002
   *   workflows: UF-03
   *   contracts: API-ME-01
   *   ac:        AC-US-LGN03-001-03
   *   lld:       LLD-EPIC-LGN-03 v0.4 section 6.0
 */
@Injectable()
export class FinancialYearService {
  /**
   * list.
   *
   * In plain words: returns the current year and the two before it, with the current one marked (a year runs April to March by the Indian date)
   *
   * @epic      EPIC-LGN-03
   * @story     US-LGN03-001
   * @subtask   ST-LGN03-001-BE-02
   * @workflow  UF-03
   * @contract  API-ME-01
   * @ac        AC-US-LGN03-001-03
   * @lld       LLD-EPIC-LGN-03 v0.4 §6.0
   * @status    built
   *
   * @returns { label: string; current: boolean }[]
   */
  list(now: Date): { label: string; current: boolean }[] {
    const start = this.startYear(now);
    return [start, start - 1, start - 2].map((y, i) => ({ label: this.label(y), current: i === 0 }));
  }

  /**
   * isValid.
   *
   * In plain words: says whether a label is in the list
   *
   * @epic      EPIC-LGN-03
   * @story     US-LGN03-002
   * @subtask   ST-LGN03-002-BE-02
   * @workflow  UF-03
   * @contract  API-ME-01
   * @ac        AC-US-LGN03-001-03
   * @lld       LLD-EPIC-LGN-03 v0.4 §6.0
   * @status    built
   *
   * @returns boolean
   */
  isValid(label: string, now: Date): boolean {
    return this.list(now).some((y) => y.label === label);
  }

  /** The calendar year in which the financial year of `now` starts; April starts a new year, by the Indian date (UTC plus 5 hours 30 minutes). */
  private startYear(now: Date): number {
    const india = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return india.getUTCMonth() >= 3 ? india.getUTCFullYear() : india.getUTCFullYear() - 1;
  }

  /** The label of the year that starts in `start`, for example 2026 gives 2026-27. */
  private label(start: number): string {
    return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
  }
}
