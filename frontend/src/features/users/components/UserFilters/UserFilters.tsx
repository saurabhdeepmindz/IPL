'use client';

/**
 * @file    UserFilters.tsx
 * @module  Users
 *
 * @description
 * User toolbar. In plain words: search, department, role, company, sign-in method and Clear filters, as in the design.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @hf             HF-ADM-01 #list
 * @story         US-ADM01-002
 * @subtask       ST-ADM01-002-FE-02
 * @lld           LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file      docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserFilters.tsx
 * @lld-synced    v0.30
 * @status         built
 */

import { useEffect, useRef, useState } from 'react';
import { useRoleOptions } from '@/features/directory';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { useCompanies, useDepartments } from '@/features/directory';
import type { UserFilters as Filters } from '../../types/user.types';

interface UserFiltersProps {
  value: Filters;
  onChange: (value: Filters) => void;
}

const clean = (f: Filters): Filters => Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined && v !== '')) as Filters;

/**
 * UserFilters.
 *
 * In plain words: the toolbar of the high-fidelity design: search with its icon, department, role, company and sign-in method, and Clear filters. The empty choice of Company means the current company (the design shows "All companies" here; the application keeps the honest word, decision recorded as UX-ACC-01).
 */
export function UserFilters({ value, onChange }: UserFiltersProps) {
  const departments = useDepartments().data ?? [];
  const companies = useCompanies().data;
  const roles = useRoleOptions({}).data?.items ?? [];
  const [text, setText] = useState(value.q ?? '');
  const [seenQ, setSeenQ] = useState(value.q);
  const latest = useRef({ value, onChange });
  useEffect(() => {
    latest.current = { value, onChange };
  });
  if (value.q !== seenQ) {
    setSeenQ(value.q);
    if (!value.q) setText('');
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      const { value: v, onChange: change } = latest.current;
      if ((v.q ?? '') !== text.trim()) change(clean({ ...v, q: text.trim(), page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [text]);
  const set = (patch: Partial<Filters>) => onChange(clean({ ...value, ...patch, page: 1 }));

  return (
    <div className={hf('toolbar')} data-testid="users-filters">
      <div className={hf('search')} style={{ flex: 1, maxWidth: 420 }}>
        <HfIcon name="search" />
        <input className={hf('input')} type="search" placeholder="Search employee code, name or e-mail" aria-label="Search users" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <select className={hf('select')} aria-label="Department" value={value.departmentId ?? ''} onChange={(e) => set({ departmentId: e.target.value })}>
        <option value="">All departments</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <select className={hf('select')} aria-label="Role" value={value.roleId ?? ''} onChange={(e) => set({ roleId: e.target.value })}>
        <option value="">All roles</option>
        {roles.map((r) => (
          <option key={r.roleId} value={r.roleId}>
            {r.name}
          </option>
        ))}
      </select>
      <select className={hf('select')} aria-label="Company" value={value.companyCode ?? ''} onChange={(e) => set({ companyCode: e.target.value })}>
        <option value="">Current company</option>
        {(companies?.items ?? []).map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
            {' · '}
            {c.code}
          </option>
        ))}
        {companies?.canViewAll && <option value="ALL">All companies</option>}
      </select>
      <select className={hf('select')} aria-label="Sign-in method" value={value.signIn ?? ''} onChange={(e) => set({ signIn: e.target.value as Filters['signIn'] })}>
        <option value="">Any sign-in</option>
        <option value="SSO">SSO</option>
        <option value="LOCAL">Local</option>
      </select>
      <button className={hf('btn btn-text')} type="button" onClick={() => onChange({})}>
        Clear filters
      </button>
    </div>
  );
}
