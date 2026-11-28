/**
 * @file    FinancialYearSelect.tsx
 * @module  Auth
 *
 * @description
 * The financial year drop-down. In plain words: lists the years of the profile, the current one marked "(current)" and selected when the page opens.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-003
 * @subtask        ST-LGN03-003-FE-02
 * @screen         LGN-09
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/features/auth/components/FinancialYearSelect.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import type { FinancialYear } from '../../types/me.types';

/**
 * FinancialYearSelect.
 *
 * In plain words: the "Financial year" field of the company page.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-003
 * @subtask   ST-LGN03-003-FE-02
 * @workflow  UF-03
 * @screen    LGN-09
 * @ac        AC-US-LGN03-003-02
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @param years The years of the profile
 * @param value The label of the selected year
 * @param onChange Called with the label the user picks
 */
export function FinancialYearSelect({ years, value, onChange }: { years: FinancialYear[]; value: string; onChange: (label: string) => void }) {
  return (
    <div className={hf('field')}>
      <label htmlFor="fy">
        Financial year<span className={hf('req')}>*</span>
      </label>
      <select className={hf('select')} id="fy" data-testid="choose-fy" value={value} onChange={(e) => onChange(e.target.value)}>
        {years.map((y) => (
          <option key={y.label} value={y.label}>
            {y.label}
            {y.current ? ' (current)' : ''}
          </option>
        ))}
      </select>
      <span className={hf('help')}>
        <span>
          <HfIcon name="info" />
        </span>
        Lists show proposals of this year. You can find any year&apos;s proposal by its number.
      </span>
    </div>
  );
}
