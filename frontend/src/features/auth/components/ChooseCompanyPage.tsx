/**
 * @file    ChooseCompanyPage.tsx
 * @module  Auth
 *
 * @description
 * The company and financial year page (LGN-09, "Choose where to work"). In plain words: shows who is signed in, a company drop-down with the roles of the chosen company, the financial year, a tick box "Start with this company and year next time" and Continue. A user with no company is sent to the no-access page.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-003, US-LGN03-006
 * @subtask        ST-LGN03-003-FE-02
 * @screen         LGN-09
 * @lld            LLD-EPIC-LGN-03 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/features/auth/components/ChooseCompanyPage.tsx
 * @lld-synced     v0.3
 * @status         built
 */
'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { clearAccessToken } from '@/lib/token';
import { useSessionStore } from '@/store/session.store';
import { hf } from '../hf/hf';
import { Icon } from '../hf/Icon';
import { useMe, useSelectContext } from '../hooks/useMe';
import { usePublicConfig } from '../hooks/usePublicConfig';
import type { MeProfile } from '../types/me.types';
import { AuthShell } from './AuthShell';
import { CompanyCard } from './CompanyCard';
import { FinancialYearSelect } from './FinancialYearSelect';

/** The initials of a name as the design draws them: the capital letters, the first two. */
export function initialsOf(name: string): string {
  return name.replace(/[^A-Z]/g, '').slice(0, 2);
}

function WhoChip({ profile }: { profile: MeProfile }) {
  const router = useRouter();
  const signOut = () => {
    // Until EPIC-LGN-04 ends the server session, sign-out clears the browser session (TBD-LGN03-04).
    clearAccessToken();
    useSessionStore.getState().signOut();
    router.push('/login?reason=signedout');
  };
  return (
    <div className={hf('who')} data-testid="choose-chip">
      <span className={hf('avatar')} id="av">
        {initialsOf(profile.name)}
      </span>
      <div>
        <b id="wn">{profile.name}</b>
        <small id="wd">Employee code {profile.employeeCode}</small>
      </div>
      <a
        href="/login?reason=signedout"
        onClick={(e) => {
          e.preventDefault();
          signOut();
        }}
        data-testid="choose-sign-out"
      >
        Not you? Sign out
      </a>
    </div>
  );
}

/** Plain words for a refused or failed choice. */
function refusedText(code: string | undefined): string {
  if (code === 'COMPANY_NOT_ALLOWED') return 'You do not have access to this company. Choose one from the list.';
  if (code === 'INVALID_YEAR') return 'Choose one of the financial years in the list.';
  return 'We could not save your choice. Check your connection and try again.';
}

function ChooseForm({ profile }: { profile: MeProfile }) {
  const queryClient = useQueryClient();
  const choose = useSelectContext();
  const one = profile.companies.length === 1;
  const [company, setCompany] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);
  const [missing, setMissing] = useState(false);
  const companyCode = company ?? (one ? profile.companies[0].code : '');
  const financialYear = year ?? profile.financialYears.find((y) => y.current)?.label ?? profile.financialYears[0]?.label ?? '';
  const chosen = profile.companies.find((c) => c.code === companyCode);
  const refused = choose.error?.code;
  useEffect(() => {
    if (refused === 'COMPANY_NOT_ALLOWED') void queryClient.invalidateQueries({ queryKey: ['me'] });
  }, [refused, queryClient]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyCode) {
      setMissing(true);
      return;
    }
    setMissing(false);
    choose.mutate({ companyCode, financialYear });
  };
  const errorText = missing ? 'Choose a company' : choose.error ? refusedText(refused) : undefined;
  return (
    <form onSubmit={submit} noValidate aria-label="Choose where to work">
      <div className={hf('field', errorText && 'invalid')}>
        <label htmlFor="co">
          Company<span className={hf('req')}>*</span>
        </label>
        <select
          className={hf('select')}
          id="co"
          data-testid="choose-co"
          value={companyCode}
          onChange={(e) => {
            setCompany(e.target.value);
            setMissing(false);
          }}
        >
          {one ? null : <option value="">Select a company</option>}
          {profile.companies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} · {c.code}
            </option>
          ))}
        </select>
        <span className={hf('help')} id="coH">
          <span>
            <Icon name="info" />
          </span>
          <span id="coHt">{one ? 'You have access to one company.' : `You have access to ${profile.companies.length} companies. You work in one company at a time.`}</span>
        </span>
        <span className={hf('err')} data-testid="choose-error" role="alert">
          {errorText ? (
            <>
              <span>
                <Icon name="alertC" />
              </span>
              <span>{errorText}</span>
            </>
          ) : null}
        </span>
      </div>
      <div id="roles">{chosen ? <CompanyCard company={chosen} /> : null}</div>
      <FinancialYearSelect years={profile.financialYears} value={financialYear} onChange={setYear} />
      <label className={hf('check')}>
        <input type="checkbox" id="rem" data-testid="choose-rem" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Start with this company and year next time
      </label>
      <button id="go" className={hf('btn btn-primary')} type="submit" disabled={choose.isPending} data-testid="choose-go">
        {choose.isPending ? 'Opening…' : 'Continue'}
      </button>
    </form>
  );
}

/**
 * ChooseCompanyPage.
 *
 * In plain words: LGN-09. Reads the profile; a user with no company goes to `/no-company-access`.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-003
 * @subtask   ST-LGN03-003-FE-02
 * @frd       FR-040.1, FR-040.2
 * @workflow  UF-03
 * @screen    LGN-09
 * @contract  API-ME-01, API-ME-02
 * @ac        AC-US-LGN03-003-01, AC-US-LGN03-003-02, AC-US-LGN03-003-03
 * @lld       LLD-EPIC-LGN-03 v0.3 §6.1
 * @status    built
 *
 * @dependencies useMe, useSelectContext, AuthShell, CompanyCard, FinancialYearSelect
 */
export function ChooseCompanyPage() {
  const router = useRouter();
  const { data: config } = usePublicConfig();
  const { data: profile } = useMe();
  const noCompany = profile !== undefined && profile.companies.length === 0;
  useEffect(() => {
    if (noCompany) router.replace('/no-company-access');
  }, [noCompany, router]);
  return (
    <AuthShell helpEmail={config?.helpdesk.email ?? 'it.helpdesk@ipl.example'}>
      {profile && !noCompany ? (
        <div data-testid="choose-company">
          <WhoChip profile={profile} />
          <h1>Choose where to work</h1>
          <p className={hf('sub')}>Pick the company and financial year for this session. You can switch company later from the header.</p>
          <ChooseForm profile={profile} />
        </div>
      ) : null}
    </AuthShell>
  );
}
