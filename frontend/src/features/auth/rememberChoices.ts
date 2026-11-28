/**
 * @file    rememberChoices.ts
 * @module  Auth
 *
 * @description
 * What the browser remembers on this device. In plain words: the employee code (when the user ticks "Remember my employee code on this device") and the last company and financial year (when the user ticks "Start with this company and year next time"). Never a password and never a token. When the browser blocks storage (a private window) nothing is remembered and nothing breaks.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-006
 * @subtask        ST-LGN03-006-FE-02
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.1 (the employee-code key is the one the sign-in page already uses; see section 6.4)
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/features/auth/rememberChoices.ts
 * @lld-synced     v0.4
 * @status         built
 */

/**
 * rememberChoices.
 *
 * In plain words: four small functions over local storage.
 *
 * @rtm
 *   epics:     EPIC-LGN-03
 *   stories:   US-LGN03-006
 *   workflows: UF-03
 *   frd:       FR-040.7
 *   ac:        AC-US-LGN03-006-01, AC-US-LGN03-006-02
 *   lld:       LLD-EPIC-LGN-03 v0.4 section 6.1
 */

/** The key the sign-in page has always used for the remembered employee code. */
const CODE_KEY = 'ams-rem-code';
/** The key of the remembered company and year. */
const CONTEXT_KEY = 'ams.context';
/** An employee code is letters and digits, 1 to 20 of them. */
const CODE_FORMAT = /^[A-Za-z0-9]{1,20}$/;

/** A company and financial year the user chose. */
export interface RememberedContext {
  companyCode: string;
  financialYear: string;
}

/**
 * rememberEmployeeCode.
 *
 * In plain words: stores the employee code on this device, or forgets it when given null.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-006
 * @subtask   ST-LGN03-006-FE-02
 * @ac        AC-US-LGN03-006-02
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @param code The employee code, or null to forget it
 */
export function rememberEmployeeCode(code: string | null): void {
  try {
    if (code) localStorage.setItem(CODE_KEY, code);
    else localStorage.removeItem(CODE_KEY);
  } catch {
    /* private window: nothing is remembered */
  }
}

/**
 * readEmployeeCode.
 *
 * In plain words: the remembered employee code, or null when none is stored, the value is not an employee code, or the browser blocks storage.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-006
 * @subtask   ST-LGN03-006-FE-02
 * @ac        AC-US-LGN03-006-02
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @returns The code or null
 */
export function readEmployeeCode(): string | null {
  try {
    const value = localStorage.getItem(CODE_KEY);
    return value !== null && CODE_FORMAT.test(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * rememberContext.
 *
 * In plain words: stores the last company and financial year, or forgets them when given null.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-006
 * @subtask   ST-LGN03-006-FE-02
 * @ac        AC-US-LGN03-006-01
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @param context The company and year, or null to forget them
 */
export function rememberContext(context: RememberedContext | null): void {
  try {
    if (context) localStorage.setItem(CONTEXT_KEY, JSON.stringify({ companyCode: context.companyCode, financialYear: context.financialYear }));
    else localStorage.removeItem(CONTEXT_KEY);
  } catch {
    /* private window: nothing is remembered */
  }
}

/**
 * readContext.
 *
 * In plain words: the remembered company and year, or null when none is stored, the stored text is damaged, or the browser blocks storage. The value only preselects: the AMS API checks it again on every choice.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-006
 * @subtask   ST-LGN03-006-FE-02
 * @ac        AC-US-LGN03-006-01
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @returns The company and year or null
 */
export function readContext(): RememberedContext | null {
  try {
    const text = localStorage.getItem(CONTEXT_KEY);
    if (!text) return null;
    const value: unknown = JSON.parse(text);
    if (typeof value !== 'object' || value === null) return null;
    const { companyCode, financialYear } = value as Record<string, unknown>;
    return typeof companyCode === 'string' && companyCode !== '' && typeof financialYear === 'string' && financialYear !== '' ? { companyCode, financialYear } : null;
  } catch {
    return null;
  }
}
