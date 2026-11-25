/**
 * @file    AssignUsersDialog.tsx
 * @module  RolesFeature
 *
 * @description
 * The assign users dialog. In plain words: pick users by search, choose the company and the first day, then give the reason and assign.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/AssignUsersDialog.tsx
 * @lld-synced     v0.28
 * @status         built
 */
'use client';

import { useState } from 'react';
import { ReasonDialog } from '@/components/ams';
import { Button, Input, Modal, Select } from '@/components/ui';
import { useUserSearch } from '@/features/users';
import { toApiError } from '@/lib/errors';
import { useSessionStore } from '@/store/session.store';
import { useAssignUsers } from '../hooks/useAssignUsers';
import type { RoleDetails } from '../types/role.types';

/** Props of AssignUsersDialog. */
interface AssignUsersDialogProps {
  /** The role to give */
  role: RoleDetails;
  /** True to show the dialog */
  open: boolean;
  /** Called when the dialog closes */
  onClose: () => void;
}

interface Picked {
  employeeCode: string;
  name: string;
}

/**
 * Assign dialog. In plain words: search and pick users, choose the company and the first day, then give the reason and assign; for Report Viewer or Auditor an info line says it is added to the business role.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-06, API-USR-01
 * @ac        AC-US013-01, AC-US013-02, AC-US013-03
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies useUserSearch, useAssignUsers, ReasonDialog
 *
 * @returns The rendered dialog
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
  const found = useUserSearch(text).data?.items.filter((u) => !picked.some((p) => p.employeeCode === u.employeeCode)) ?? [];
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

  return (
    <>
      <Modal open={open} onClose={onClose} title={`Assign users to ${role.name}`} size="lg" closeOnBackdrop={false}
        footer={<><Button variant="secondary" outline onClick={onClose}>Cancel</Button><Button onClick={submit} data-testid="assign-submit">Assign</Button></>}>
        {['Report Viewer', 'Auditor'].includes(role.name) && (
          <p className="alert alert-info" data-testid="assign-info">This role is added to the user&apos;s business role; it does not replace it.</p>
        )}
        <Input label="Search users" placeholder="Type a name or an employee code" value={text} onChange={(e) => setText(e.target.value)} error={errors.users} />
        <ul className="list-unstyled">
          {found.map((u) => (
            <li key={u.employeeCode}>
              <button type="button" className="btn btn-link p-0" onClick={() => setPicked([...picked, u])}>Add {u.name} ({u.employeeCode})</button>
            </li>
          ))}
        </ul>
        <ul className="list-inline" aria-label="Chosen users">
          {picked.map((p) => (
            <li key={p.employeeCode} className="list-inline-item badge text-bg-light">
              {p.name} ({p.employeeCode}) <button type="button" className="btn btn-link btn-sm p-0" aria-label={`Remove ${p.name}`} onClick={() => setPicked(picked.filter((x) => x !== p))}>x</button>
            </li>
          ))}
        </ul>
        <Select id="assign-company" label="Company" required placeholder="Select a company" options={companies.map((c) => ({ value: c, label: c }))} value={company} onChange={(e) => setCompany(e.target.value)} error={errors.company} />
        <Input label="Valid from" type="date" required value={validFrom} onChange={(e) => setValidFrom(e.target.value)} error={errors.validFrom} />
        {failure && <p role="alert" className="text-danger">{failure}</p>}
      </Modal>
      <ReasonDialog open={askReason} title="Reason for assigning" onConfirm={send} onCancel={() => setAskReason(false)} busy={assign.isPending} />
    </>
  );
}
