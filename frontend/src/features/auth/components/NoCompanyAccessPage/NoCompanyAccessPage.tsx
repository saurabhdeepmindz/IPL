/**
 * @file    NoCompanyAccessPage.tsx
 * @module  Auth
 *
 * @description
 * The no-company-access page (LGN-10). In plain words: a signed-in user whose employee code is not linked to a company and role is told whom to call (phone, e-mail, hours), gets a reference to quote, can copy the details for the IT team, and can sign out. A user who has got access meanwhile is sent on to the company page.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-004
 * @subtask        ST-LGN03-004-FE-02
 * @screen         LGN-10
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/features/auth/components/NoCompanyAccessPage.tsx
 * @lld-synced     v0.4
 * @status         built
 */
'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { useMe } from '../../hooks/useMe';
import { usePublicConfig } from '../../hooks/usePublicConfig';
import { useSignOut } from '../../hooks/useSignOut';
import type { MeProfile } from '../../types/me.types';
import { AuthShell } from '../AuthShell';
import { initialsOf } from '../ChooseCompanyPage';
import { ContactBlock } from '../ContactBlock';
import { CopyDetailsButton } from '../CopyDetailsButton';

/**
 * referenceFor.
 *
 * In plain words: the reference the user quotes to the IT team: the employee code, the Indian date as yymmdd and the time as hhmm, for example 10002-261127-0914.
 *
 * @param employeeCode The employee code
 * @param when The moment of the visit
 * @returns The reference
 */
export function referenceFor(employeeCode: string, when: Date): string {
  const india = new Date(when.getTime() + 5.5 * 60 * 60 * 1000);
  const two = (n: number) => String(n).padStart(2, '0');
  const date = `${two(india.getUTCFullYear() % 100)}${two(india.getUTCMonth() + 1)}${two(india.getUTCDate())}`;
  return `${employeeCode}-${date}-${two(india.getUTCHours())}${two(india.getUTCMinutes())}`;
}

function NoAccessBody({ profile }: { profile: MeProfile }) {
  const signOut = useSignOut();
  const reference = useMemo(() => referenceFor(profile.employeeCode, new Date()), [profile.employeeCode]);
  const details = `AMS access request — ${profile.name}, employee code ${profile.employeeCode}, reference ${reference}`;
  return (
    <div data-testid="no-access">
      <div className={hf('who')}>
        <span className={hf('avatar')} id="av">
          {initialsOf(profile.name)}
        </span>
        <div>
          <b id="wn">{profile.name}</b>
          <small id="wd">Employee code {profile.employeeCode}</small>
        </div>
      </div>
      <span className={hf('big-ic warn')}>
        <HfIcon name="building" />
      </span>
      <h1>No company access yet</h1>
      <p className={hf('sub')}>
        You are signed in, but your employee code is not linked to any company and role in AMS. The IT team sets this up in User Management. Once they do, sign in again.
      </p>
      <div id="c">
        <ContactBlock helpdesk={profile.helpdesk} reference={reference} />
      </div>
      <div style={{ display: 'grid', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
        <CopyDetailsButton text={details} />
        <button className={hf('btn btn-primary')} type="button" onClick={signOut} data-testid="no-access-sign-out">
          Sign out
        </button>
      </div>
    </div>
  );
}

/**
 * NoCompanyAccessPage.
 *
 * In plain words: LGN-10. Reads the profile; with a company in it the user is sent to the company page.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-004
 * @subtask   ST-LGN03-004-FE-02
 * @frd       FR-040.6
 * @workflow  UF-03
 * @screen    LGN-10
 * @contract  API-ME-01
 * @ac        AC-US-LGN03-004-01
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @dependencies useMe, usePublicConfig, AuthShell, ContactBlock, CopyDetailsButton
 */
export function NoCompanyAccessPage() {
  const router = useRouter();
  const { data: config } = usePublicConfig();
  const { data: profile } = useMe();
  const hasCompany = profile !== undefined && profile.companies.length > 0;
  useEffect(() => {
    if (hasCompany) router.replace('/choose-work');
  }, [hasCompany, router]);
  return (
    <AuthShell helpEmail={config?.helpdesk.email ?? 'it.helpdesk@ipl.example'}>
      {profile && !hasCompany ? <NoAccessBody profile={profile} /> : null}
    </AuthShell>
  );
}
