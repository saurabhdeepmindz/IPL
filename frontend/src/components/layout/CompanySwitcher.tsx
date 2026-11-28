/**
 * @file    CompanySwitcher.tsx
 * @module  Layout
 *
 * @description
 * The company switch in the header. In plain words: shows the company of the session and, when opened, lists the companies the user can work in today; choosing one saves the choice (API-ME-02, the same financial year) and opens the landing page of that company through the Opening page. One company is active at a time.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-005
 * @subtask        ST-LGN03-005-FE-02
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/components/layout/CompanySwitcher.tsx
 * @lld-synced     v0.4
 * @status         built
 */
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMe, useSelectContext } from '@/features/auth/hooks/useMe';
import { getCompanies } from '@/features/users/services/masters.service';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { readContext, rememberContext } from '@/features/auth/rememberChoices';
import { useSessionStore } from '@/store/session.store';

/**
 * CompanySwitcher.
 *
 * In plain words: the "Company" box of the top bar with its list. There is no unsaved-work warning yet: no screen keeps a draft until the proposal modules are built.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-005
 * @subtask   ST-LGN03-005-FE-02
 * @frd       FR-040.3
 * @workflow  UF-03
 * @screen    LGN-11
 * @contract  API-ME-01, API-ME-02
 * @ac        AC-US-LGN03-005-01, AC-US-LGN03-005-02
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @dependencies useSessionStore, useMe, useSelectContext, getCompanies
 */
export function CompanySwitcher() {
  const user = useSessionStore((s) => s.user);
  const [open, setOpen] = useState(false);
  // the header reads the profile only when its list is opened (the page before it has usually read it already)
  const { data: profile } = useMe({ enabled: open });
  const choose = useSelectContext();
  // the company name comes from the profile; until it is read, from the company list of the Administration screens (as the header did before)
  const masters = useQuery({ queryKey: ['masters.companies'], queryFn: getCompanies, staleTime: 5 * 60_000 });
  const current = profile?.companies.find((c) => c.code === user?.companyCode) ?? masters.data?.items?.find((c) => c.code === user?.companyCode);
  const label = current ? `${current.name} · ${current.code}` : (user?.companyCode ?? '-');
  const year = user?.financialYear ?? profile?.financialYears.find((y) => y.current)?.label ?? '';
  const pick = (companyCode: string) => {
    setOpen(false);
    // a user who asked to start with the last company keeps that choice up to date
    if (readContext()) rememberContext({ companyCode, financialYear: year });
    choose.mutate({ companyCode, financialYear: year });
  };
  return (
    <div className={hf('menu-wrap')}>
      <button className={hf('ctx-select')} type="button" aria-haspopup="true" aria-expanded={open} data-testid="company-switcher" onClick={() => setOpen(!open)}>
        <small>Company</small>
        <b>
          <HfIcon name="building" size="sm" />
          <span className={hf('co-name')} data-testid="layout-company">
            {label}
          </span>
          <HfIcon name="chevD" size="sm" />
        </b>
      </button>
      {open ? (
        <div className={hf('menu open')} role="menu" data-testid="company-menu">
          <div className={hf('mh')}>Companies you can work in</div>
          {(profile?.companies ?? []).map((c) => {
            const isCurrent = c.code === user?.companyCode;
            return (
              <button key={c.code} type="button" role="menuitem" className={isCurrent ? hf('sel') : undefined} aria-current={isCurrent ? 'true' : undefined} data-testid={`switch-${c.code}`} onClick={() => pick(c.code)}>
                {isCurrent ? <HfIcon name="check" size="sm" /> : <span style={{ width: 16 }} />}
                {c.name} · {c.code}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
