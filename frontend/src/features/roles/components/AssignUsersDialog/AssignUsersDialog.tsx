'use client';

/**
 * @file    AssignUsersDialog.tsx
 * @module  Roles
 *
 * @description
 * Assign users drawer. In plain words: HF-ADM-02 assign drawer.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-02 #assignDrawer
 * @status         built
 */

import { useState } from 'react';
import { ReasonDialog } from '@/components/ams';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { HfModal } from '@/hf/HfModal';
import { useUserSearch } from '@/features/users';
import { toApiError } from '@/lib/errors';
import { useSessionStore } from '@/store/session.store';
import { useAssignUsers } from '../../hooks/useAssignUsers';
import type { RoleDetails } from '../../types/role.types';

interface AssignUsersDialogProps {
  role: RoleDetails;
  open: boolean;
  onClose: () => void;
}

interface Picked {
  employeeCode: string;
  name: string;
}

/**
 * AssignUsersDialog.
 *
 * In plain words: the "Assign users" side drawer of the high-fidelity design: company and valid-from, a search, the people found (click to add), the chosen people, and Cancel / Assign. Assigning asks for a reason.
 */
export function AssignUsersDialog({ role, open, onClose }: AssignUsersDialogProps) {
  const sessionCompany = useSessionStore((s) => s.user?.companyCode);
  const assign = useAssignUsers(role.roleId);
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<Picked[]>([]);
  const [company, setCompany] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [askReason, setAskReason] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const found = useUserSearch(text, open).data?.items.filter((u) => !picked.some((p) => p.employeeCode === u.employeeCode)) ?? [];
  const companies = [...new Set([sessionCompany, ...role.users.map((u) => u.company)].filter((c): c is string => Boolean(c)))];

  const submit = () => {
    const next: Record<string, string> = {};
    if (picked.length === 0) next.users = 'Choose at least one user';
    if (!company) next.company = 'Choose a company';
    if (!validFrom) next.validFrom = 'Enter a date';
    setErrors(next);
    if (Object.keys(next).length === 0) setAskReason(true);
  };
  const send = (reason: string) =>
    assign.mutate({ employeeCodes: picked.map((p) => p.employeeCode), companyCode: company, validFrom, reason }, {
      onSuccess: onClose,
      onError: (err) => {
        setFailure(toApiError(err).message);
        setAskReason(false);
      },
    });
  const msg = (text?: string) => (
    <span className={hf('err')} role={text ? 'alert' : undefined}>
      <span>
        <HfIcon name="alertC" />
      </span>
      <span>{text}</span>
    </span>
  );

  return (
    <>
      <HfModal
        open={open}
        onClose={onClose}
        drawer
        title="Assign users"
        subtitle={`to ${role.name}`}
        footer={
          <>
            <button type="button" className={hf('btn btn-outline')} onClick={onClose}>
              Cancel
            </button>
            <button type="button" className={hf('btn btn-primary')} onClick={submit} data-testid="assign-submit">
              Assign
            </button>
          </>
        }
      >
        {['Report Viewer', 'Auditor'].includes(role.name) && (
          <div className={hf('alert info')} data-testid="assign-info" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <span>
              <HfIcon name="info" />
            </span>
            <div>This role is added to the user&apos;s business role; it does not replace it.</div>
          </div>
        )}
        <div className={hf('form-grid')} style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 'var(--spacing-lg)' }}>
          <div className={hf('field', errors.company && 'invalid')}>
            <label htmlFor="assign-company">
              Company<span className={hf('req')}>*</span>
            </label>
            <select id="assign-company" className={hf('select')} value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">Select a company</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {msg(errors.company)}
          </div>
          <div className={hf('field', errors.validFrom && 'invalid')}>
            <label htmlFor="assign-from">
              Valid from<span className={hf('req')}>*</span>
            </label>
            <input id="assign-from" className={hf('input')} type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            {msg(errors.validFrom)}
          </div>
        </div>
        <div className={hf('field', errors.users && 'invalid')}>
          <div className={hf('search')} style={{ marginBottom: 'var(--spacing-sm)' }}>
            <HfIcon name="search" />
            <input className={hf('input')} type="search" placeholder="Search name, employee code or department" aria-label="Search users" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          {msg(errors.users)}
        </div>
        <ul aria-label="People found" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {found.map((u) => (
            <li key={u.employeeCode}>
              <button type="button" className={hf('btn btn-text sm')} onClick={() => setPicked([...picked, u])}>
                Add {u.name} ({u.employeeCode})
              </button>
            </li>
          ))}
        </ul>
        <div className={hf('muted')} style={{ fontSize: 'var(--fs-1)', margin: 'var(--spacing-sm) 0' }}>
          {picked.length} {picked.length === 1 ? 'user' : 'users'} chosen
        </div>
        <ul aria-label="Chosen users" className={hf('chips')} style={{ listStyle: 'none', padding: 0 }}>
          {picked.map((p) => (
            <li key={p.employeeCode} className={hf('chip')}>
              {p.name} ({p.employeeCode}){' '}
              <button type="button" className={hf('close-btn')} style={{ width: 20, height: 20 }} aria-label={`Remove ${p.name}`} onClick={() => setPicked(picked.filter((x) => x !== p))}>
                <HfIcon name="x" size="sm" />
              </button>
            </li>
          ))}
        </ul>
        {failure && (
          <p role="alert" style={{ color: 'var(--text-error)' }}>
            {failure}
          </p>
        )}
      </HfModal>
      <ReasonDialog open={askReason} title="Reason for assigning" onConfirm={send} onCancel={() => setAskReason(false)} busy={assign.isPending} confirmLabel="Assign" />
    </>
  );
}
