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
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/CompanyRoleTable.tsx
 * @lld-synced     v0.26
 * @status         built
 */
'use client';

import { Button, Input, Select } from '@/components/ui';
import { useRoles } from '@/features/roles';
import { useCompanies } from '../hooks/useMasters';
import type { CompanyRoleInput } from '../types/user.types';

/** Props of CompanyRoleTable. */
interface CompanyRoleTableProps {
  /** The rows of the form */
  rows: CompanyRoleInput[];
  /** Called with the new rows */
  onChange: (rows: CompanyRoleInput[]) => void;
  /** Messages by field, for example `companies.0.validTo` */
  errors?: Record<string, string>;
}

/**
 * Company rows. In plain words: one row per company with its roles, valid-from, valid-to and Remove; Add company appends a row; a company cannot be chosen twice and the last row cannot be removed.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-MST-03, API-ROL-01
 * @ac        AC-US004-01, AC-US004-03
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.3
 * @status    built
 *
 * @dependencies useCompanies, useRoles
 *
 * @returns The rendered table
 */
export function CompanyRoleTable({ rows, onChange, errors = {} }: CompanyRoleTableProps) {
  const companies = useCompanies().data?.items ?? [];
  const roles = useRoles({ status: 'ACTIVE' }).data?.items ?? [];
  const set = (i: number, patch: Partial<CompanyRoleInput>) => onChange(rows.map((r, n) => (n === i ? { ...r, ...patch } : r)));
  const toggle = (i: number, id: string) => set(i, { roleIds: rows[i].roleIds.includes(id) ? rows[i].roleIds.filter((x) => x !== id) : [...rows[i].roleIds, id] });

  return (
    <div data-testid="user-company-rows">
      {rows.map((r, i) => (
        <div key={i} className="border rounded p-3 mb-3">
          <div className="row g-2">
            <div className="col-md-4">
              <Select id={`company-${i}`} label="Company" placeholder="Select a company" value={r.companyCode} error={errors[`companies.${i}.companyCode`]} onChange={(e) => set(i, { companyCode: e.target.value })}
                options={companies.map((c) => ({ value: c.code, label: c.code, disabled: rows.some((x, n) => n !== i && x.companyCode === c.code) }))} />
            </div>
            <div className="col-md-3">
              <Input id={`from-${i}`} label="Valid from" type="date" required value={r.validFrom} error={errors[`companies.${i}.validFrom`]} onChange={(e) => set(i, { validFrom: e.target.value })} />
            </div>
            <div className="col-md-3">
              <Input id={`to-${i}`} label="Valid to" type="date" value={r.validTo ?? ''} error={errors[`companies.${i}.validTo`]} onChange={(e) => set(i, { validTo: e.target.value || undefined })} />
            </div>
            <div className="col-md-2 d-flex align-items-center">
              <Button variant="danger" outline size="sm" disabled={rows.length === 1} aria-label={`Remove company ${i + 1}`} onClick={() => onChange(rows.filter((_, n) => n !== i))}>
                Remove
              </Button>
            </div>
          </div>
          <fieldset>
            <legend className="form-label">{`Roles for company ${i + 1}`}</legend>
            {roles.map((role) => (
              <label key={role.roleId} className="me-3">
                <input type="checkbox" className="form-check-input me-1" checked={r.roleIds.includes(role.roleId)} onChange={() => toggle(i, role.roleId)} />
                {role.name}
              </label>
            ))}
          </fieldset>
        </div>
      ))}
      {errors.companies && <p role="alert" className="text-danger">{errors.companies}</p>}
      <Button variant="link" onClick={() => onChange([...rows, { companyCode: '', roleIds: [], validFrom: '' }])}>
        Add company
      </Button>
    </div>
  );
}
