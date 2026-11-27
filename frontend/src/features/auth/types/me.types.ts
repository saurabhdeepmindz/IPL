/**
 * @file    me.types.ts
 * @module  Auth
 *
 * @description
 * Types of the company screens. In plain words: shapes of the answers of API-ME-01 and API-ME-02 and the input of the choice.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-003, US-LGN03-004, US-LGN03-005
 * @subtask        ST-LGN03-003-FE-01
 * @lld            LLD-EPIC-LGN-03 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/features/auth/types/me.types.ts
 * @lld-synced     v0.3
 * @status         built
 */

/**
 * me.types.
 *
 * In plain words: types
 *
 * @rtm
 *   epics:     EPIC-LGN-03
 *   stories:   US-LGN03-003, US-LGN03-004, US-LGN03-005
 *   workflows: UF-03
 *   contracts: API-ME-01, API-ME-02
 *   ac:        AC-US-LGN03-003-01
 *   lld:       LLD-EPIC-LGN-03 v0.3 section 6.1
 */

/** One company the user can work in today, with the names of the user's roles in it. */
export interface MeCompany {
  code: string;
  name: string;
  roles: string[];
}

/** One financial year of the list; the current one is marked. */
export interface FinancialYear {
  label: string;
  current: boolean;
}

/** The company and year of the session. */
export interface SessionContext {
  companyCode: string;
  financialYear: string;
}

/** The helpdesk values of the no-access page. */
export interface Helpdesk {
  phone: string;
  email: string;
  hours: string;
  placeholder: boolean;
}

/** The answer of API-ME-01 (data part). */
export interface MeProfile {
  employeeCode: string;
  name: string;
  companies: MeCompany[];
  financialYears: FinancialYear[];
  context: SessionContext | null;
  helpdesk: Helpdesk;
}

/** The landing page chosen for the user. */
export interface Landing {
  role: string;
  route: string;
}

/** The body of the call API-ME-02. */
export type ContextInput = SessionContext;

/** The answer of API-ME-02 (data part). */
export interface ContextResult {
  context: SessionContext;
  landing: Landing;
  accessToken: string;
  expiresIn: number;
}
