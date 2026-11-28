/**
 * @file    CompanyRoleTable.tsx
 * @module  UsersFeature
 *
 * @description
 * The company access table. In plain words: one row per company with its roles, valid-from, valid-to and Remove; Add company adds a row.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/CompanyRoleTable.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import { useRoles } from '@/features/roles';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { useCompanies } from '../../hooks/useMasters';
import type { CompanyRoleInput } from '../../types/user.types';

interface CompanyRoleTableProps {
  /** The rows of the form */
  rows: CompanyRoleInput[];
  /** Called with the new rows */
  onChange: (rows: CompanyRoleInput[]) => void;
  /** Messages by field, for example `companies.0.validTo` */
  errors?: Record<string, string>;
}

/**
 * CompanyRoleTable.
 *
 * In plain words: the "Company access and roles" table of the design: a company list, the roles as chips with a "+ Add role" list, valid from and to, and a remove button; "Add company" adds a row.
 */
export function CompanyRoleTable({ rows, onChange, errors = {} }: CompanyRoleTableProps) {
  const companies = useCompanies().data?.items ?? [];
  const roles = useRoles({ status: 'ACTIVE' }).data?.items ?? [];
  const set = (i: number, patch: Partial<CompanyRoleInput>) => onChange(rows.map((r, n) => (n === i ? { ...r, ...patch } : r)));
  const nameOf = (id: string) => roles.find((r) => r.roleId === id)?.name ?? id;

  return (
    <div data-testid="user-company-rows">
      <div className={hf('table-wrap')}>
        <table className={hf('tbl co-tbl')}>
          <thead>
            <tr>
              <th style={{ minWidth: 220 }}>Company</th>
              <th style={{ minWidth: 280 }}>Roles</th>
              <th>Valid from</th>
              <th>Valid to</th>
              <th className={hf('act')}>
                <span className={hf('sr-only')}>Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>
                  <select id={`company-${i}`} className={hf('select')} aria-label="Company" value={r.companyCode} onChange={(e) => set(i, { companyCode: e.target.value })}>
                    <option value="">Select a company</option>
                    {companies.map((c) => (
                      <option key={c.code} value={c.code} disabled={rows.some((x, n) => n !== i && x.companyCode === c.code)}>
                        {`${c.name} · ${c.code}`}
                      </option>
                    ))}
                  </select>
                  {errors[`companies.${i}.companyCode`] && <div style={{ color: 'var(--text-error)', fontSize: 'var(--fs-1)' }}>{errors[`companies.${i}.companyCode`]}</div>}
                </td>
                <td>
                  <div role="group" aria-label={`Roles for company ${i + 1}`}>
                    <div className={hf('chips')} style={{ marginBottom: 6 }}>
                      {r.roleIds.map((id) => (
                        <span key={id} className={hf('chip sel')}>
                          {nameOf(id)}
                          <button type="button" className={hf('x')} aria-label={`Remove ${nameOf(id)}`} onClick={() => set(i, { roleIds: r.roleIds.filter((x) => x !== id) })}>
                            <HfIcon name="x" size="sm" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <select className={hf('select')} aria-label="Add role" value="" onChange={(e) => e.target.value && set(i, { roleIds: [...r.roleIds, e.target.value] })}>
                      <option value="">+ Add role</option>
                      {roles.filter((x) => !r.roleIds.includes(x.roleId)).map((x) => (
                        <option key={x.roleId} value={x.roleId}>
                          {x.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td>
                  <input id={`from-${i}`} className={hf('input')} type="date" aria-label="Valid from" value={r.validFrom} style={{ width: 150 }} onChange={(e) => set(i, { validFrom: e.target.value })} />
                  {errors[`companies.${i}.validFrom`] && <div style={{ color: 'var(--text-error)', fontSize: 'var(--fs-1)' }}>{errors[`companies.${i}.validFrom`]}</div>}
                </td>
                <td>
                  <input id={`to-${i}`} className={hf('input')} type="date" aria-label="Valid to" value={r.validTo ?? ''} style={{ width: 150 }} onChange={(e) => set(i, { validTo: e.target.value || undefined })} />
                  {errors[`companies.${i}.validTo`] && <div style={{ color: 'var(--text-error)', fontSize: 'var(--fs-1)' }}>{errors[`companies.${i}.validTo`]}</div>}
                </td>
                <td className={hf('act')}>
                  <button type="button" className={hf('btn btn-text icon sm')} disabled={rows.length === 1} aria-label={`Remove company ${i + 1}`} onClick={() => onChange(rows.filter((_, n) => n !== i))}>
                    <HfIcon name="trash" size="sm" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={hf('field', errors.companies && 'invalid')} style={{ marginTop: 'var(--spacing-md)' }}>
        <span className={hf('err')} role={errors.companies ? 'alert' : undefined}>
          <span>
            <HfIcon name="alertC" />
          </span>
          <span>{errors.companies}</span>
        </span>
      </div>
      <button type="button" className={hf('btn btn-text')} style={{ marginTop: 'var(--spacing-sm)' }} onClick={() => onChange([...rows, { companyCode: '', roleIds: [], validFrom: '' }])}>
        <HfIcon name="plus" />
        Add company
      </button>
    </div>
  );
}
