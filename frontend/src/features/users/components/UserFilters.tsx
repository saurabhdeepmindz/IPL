/**
 * @file    UserFilters.tsx
 * @module  UsersFeature
 *
 * @description
 * The user filters. In plain words: the search box, the department, role, company and sign-in filters and Clear filters.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserFilters.tsx
 * @lld-synced     v0.24
 * @status         built
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { useRoles } from '@/features/roles';
import { useCompanies, useDepartments } from '../hooks/useMasters';
import type { UserFilters as Filters } from '../types/user.types';

/** Props of UserFilters. */
interface UserFiltersProps {
  /** The current filters */
  value: Filters;
  /** Called with the new filters (empty values are removed) */
  onChange: (value: Filters) => void;
}

const clean = (f: Filters): Filters => Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined && v !== '')) as Filters;

/**
 * Filters. In plain words: the search box, the department, role, company and sign-in filters and Clear filters. "All companies" is offered only when the companies answer says `canViewAll` (decision L-71).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-MST-01, API-MST-03
 * @ac        AC-US002-02
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies useDepartments, useCompanies, useRoles
 *
 * @returns The rendered filters
 */
export function UserFilters({ value, onChange }: UserFiltersProps) {
  const departments = useDepartments().data ?? [];
  const companies = useCompanies().data;
  const roles = useRoles({}).data?.items ?? [];
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
    <div className="row g-2 mb-3 align-items-end" data-testid="users-filters">
      <div className="col-md-4">
        <Input label="Search users" placeholder="Search code, name or e-mail" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="col-md-2">
        <Select label="Department" placeholder="All departments" options={departments.map((d) => ({ value: d.id, label: d.name }))} value={value.departmentId ?? ''} onChange={(e) => set({ departmentId: e.target.value })} />
      </div>
      <div className="col-md-2">
        <Select label="Role" placeholder="All roles" options={roles.map((r) => ({ value: r.roleId, label: r.name }))} value={value.roleId ?? ''} onChange={(e) => set({ roleId: e.target.value })} />
      </div>
      <div className="col-md-2">
        <Select label="Company" placeholder="Current company" options={[...(companies?.items ?? []).map((c) => ({ value: c.code, label: c.name })), ...(companies?.canViewAll ? [{ value: 'ALL', label: 'All companies' }] : [])]} value={value.companyCode ?? ''} onChange={(e) => set({ companyCode: e.target.value })} />
      </div>
      <div className="col-md-2">
        <Select label="Sign-in" placeholder="Any sign-in" options={[{ value: 'SSO', label: 'SSO' }, { value: 'LOCAL', label: 'Local' }]} value={value.signIn ?? ''} onChange={(e) => set({ signIn: e.target.value as Filters['signIn'] })} />
      </div>
      <div className="col-12">
        <Button variant="secondary" outline size="sm" onClick={() => onChange({})}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}
