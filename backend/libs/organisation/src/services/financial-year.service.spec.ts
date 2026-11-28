/**
 * @file    financial-year.service.spec.ts
 * @module  OrganisationModule
 *
 * @description
 * Jest cases of the financial year list (TC-LGN03-001-J03 and supporting cases). In plain words: the list holds the current year and the two before it, April starts a new year (by the Indian date), and the current one is marked. The cases J01, J02 and J04 of the same story test the profile service and are in `libs/core/src/auth/company-selection.profile.spec.ts`.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN03-001
 * @subtask        ST-LGN03-001-BE-03
 * @lld            LLD-EPIC-LGN-03 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/libs/organisation/src/services/financial-year.service.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { FinancialYearService } from './financial-year.service';

const at = (iso: string) => new Date(iso);

describe('FinancialYearService (US-LGN03-001)', () => {
  const service = new FinancialYearService();

  /** @tc TC-LGN03-001-J03 @story US-LGN03-001 @ac AC-US-LGN03-001-03 @subtask ST-LGN03-001-BE-03 In plain words: the list holds the current year and the two before it, with the current one marked. */
  it('TC-LGN03-001-J03 lists the current year and the two before it, with the current one marked', () => {
    expect(service.list(at('2026-11-27T10:00:00+05:30'))).toEqual([
      { label: '2026-27', current: true },
      { label: '2025-26', current: false },
      { label: '2024-25', current: false },
    ]);
  });

  /** @story US-LGN03-001 @ac AC-US-LGN03-001-03 @subtask ST-LGN03-001-BE-03 In plain words: supporting test. March still belongs to the old year; April starts the new one. */
  it('changes the year on 1 April', () => {
    expect(service.list(at('2027-03-31T12:00:00+05:30'))[0]).toEqual({ label: '2026-27', current: true });
    expect(service.list(at('2027-04-01T12:00:00+05:30'))[0]).toEqual({ label: '2027-28', current: true });
  });

  /** @story US-LGN03-001 @ac AC-US-LGN03-001-03 @subtask ST-LGN03-001-BE-03 In plain words: supporting test. The year changes at midnight of the Indian date, not of UTC (00:30 on 1 April in India is still 31 March in UTC). */
  it('uses the Indian date for the change of year', () => {
    expect(service.list(at('2027-03-31T19:00:00Z'))[0].label).toBe('2027-28');
    expect(service.list(at('2027-03-31T18:00:00Z'))[0].label).toBe('2026-27');
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-001-03 @subtask ST-LGN03-001-BE-03 In plain words: supporting test. A label is valid only when it is in the list. */
  it('says whether a label is in the list', () => {
    const now = at('2026-11-27T10:00:00+05:30');
    expect(service.isValid('2026-27', now)).toBe(true);
    expect(service.isValid('2024-25', now)).toBe(true);
    expect(service.isValid('2027-28', now)).toBe(false);
    expect(service.isValid('2023-24', now)).toBe(false);
    expect(service.isValid('abc', now)).toBe(false);
  });
});
