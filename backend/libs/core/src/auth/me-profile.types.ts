/**
 * @file    me-profile.types.ts
 * @module  AuthCoreModule
 *
 * @description
 * Types of the profile answer. In plain words: what the company selection service collects for API-ME-01 (`ProfileInput`) and the body the route returns (`MeProfile`).
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-001
 * @subtask        ST-LGN03-001-BE-01
 * @contract       API-ME-01
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.0 (see section 6.3)
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/libs/core/src/auth/me-profile.types.ts
 * @lld-synced     v0.4
 * @status         built
 */

/** One company the user can work in today, with the names of the user's roles in it. */
export interface MeCompany {
  code: string;
  name: string;
  roles: string[];
}

/** One financial year of the list; the current one is marked. */
export interface FinancialYearItem {
  label: string;
  current: boolean;
}

/** The company and year of the session; null until a company is chosen. */
export interface SessionContextView {
  companyCode: string;
  financialYear: string;
}

/** The helpdesk values shown on the no-access page. */
export interface HelpdeskInfo {
  phone: string;
  email: string;
  hours: string;
  /** True while the values are placeholders (IPL has not given the real ones). */
  placeholder: boolean;
}

/** What `CompanySelectionService.profile` collects. */
export interface ProfileInput {
  user: { employeeCode: string; fullName: string };
  companies: MeCompany[];
  years: FinancialYearItem[];
  context: SessionContextView | null;
  helpdesk: HelpdeskInfo;
}

/** The body of API-ME-01. */
export interface MeProfile {
  employeeCode: string;
  name: string;
  companies: MeCompany[];
  financialYears: FinancialYearItem[];
  context: SessionContextView | null;
  helpdesk: HelpdeskInfo;
}

/** The landing page chosen for the user: the role and the route of its page. */
export interface LandingChoice {
  role: string;
  route: string;
}

/** The body of API-ME-02. */
export interface ContextResult {
  context: SessionContextView;
  landing: LandingChoice;
  accessToken: string;
  expiresIn: number;
}
