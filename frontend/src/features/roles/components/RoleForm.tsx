/**
 * @file    RoleForm.tsx
 * @module  RolesFeature
 *
 * @description
 * The role form. In plain words: name, start from, description, status, permissions by module with data scope and the plain-words panel; Save asks for a reason.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.23 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.23.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/components/RoleForm.tsx
 * @lld-synced     v0.23
 * @status         built
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { ReasonDialog } from '@/components/ams';
import { Button, Input, Select, Switch } from '@/components/ui';
import { toApiError } from '@/lib/errors';
import { usePermissionCatalog } from '../hooks/usePermissionCatalog';
import { useRoles } from '../hooks/useRoles';
import { useSaveRole } from '../hooks/useSaveRole';
import { roleFormSchema, type RoleFormValues } from '../schemas/roleFormSchema';
import type { PermissionCell } from '../types/role.types';
import { PlainWordsPanel } from './PlainWordsPanel';
import { RolePermissionSwitches } from './RolePermissionSwitches';

/** Props of RoleForm. */
interface RoleFormProps {
  /** Id of the role to change; empty to create */
  roleId?: string;
}

/**
 * Role form. In plain words: name, start from, description, status, permissions by module and the plain-words panel; Save checks the fields, asks for a reason and only then sends the call.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-02, API-ROL-03
 * @ac        AC-US012-02, AC-US012-03, AC-US012-04, AC-US012-06
 * @lld       LLD-EPIC-ADM-01 v0.23 §6.5
 * @status    built
 *
 * @dependencies useSaveRole, usePermissionCatalog, ReasonDialog, RolePermissionSwitches, PlainWordsPanel
 *
 * @returns The rendered form
 */
export function RoleForm({ roleId }: RoleFormProps) {
  const router = useRouter();
  const catalog = usePermissionCatalog().data;
  const roles = useRoles({}).data?.items ?? [];
  const existing = roleId ? roles.find((r) => r.roleId === roleId) : undefined;
  const save = useSaveRole();
  const [override, setOverride] = useState<PermissionCell[] | null>(null);
  const [pending, setPending] = useState<RoleFormValues | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: '', description: '', status: 'ACTIVE', copyFromRoleId: '' },
    values: existing ? { name: existing.name, description: existing.description, status: existing.status === 'DRAFT' ? 'DRAFT' : 'ACTIVE', copyFromRoleId: '' } : undefined,
  });
  const status = useWatch({ control: form.control, name: 'status' });
  const cellsOf = (id: string): PermissionCell[] => Object.entries(catalog?.cellsByRole[id] ?? {}).map(([permissionKey, c]) => ({ permissionKey, allowed: c.allowed, ...(c.scope ? { scope: c.scope } : {}) }));
  const cells = override ?? (roleId ? cellsOf(roleId) : []);
  const labels = Object.fromEntries((catalog?.modules ?? []).flatMap((m) => m.permissions.map((p) => [p.key, p.label])));
  const locked = Object.entries(catalog?.cellsByRole[roleId ?? ''] ?? {}).filter(([, c]) => c.locked).map(([k]) => k);

  const send = (reason: string) => {
    if (!pending) return;
    const input = { name: pending.name, description: pending.description, status: pending.status, ...(pending.copyFromRoleId ? { copyFromRoleId: pending.copyFromRoleId } : {}), permissions: cells.filter((c) => c.allowed), reason };
    save.mutate({ roleId, input }, {
      onSuccess: () => router.push('/roles'),
      onError: (err) => {
        const e = toApiError(err);
        if (e.fields.name) form.setError('name', { message: e.fields.name });
        else setFailure(e.message);
        setPending(null);
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(setPending)} noValidate data-testid="roles-form">
      <h1 className="h3">{roleId ? 'Edit role' : 'Create role'}</h1>
      <div className="row">
        <div className="col-lg-8">
          <Input label="Role name" required maxLength={40} error={form.formState.errors.name?.message} {...form.register('name')} />
          <Select label="Start from" placeholder="Blank role" options={roles.map((r) => ({ value: r.roleId, label: r.name }))} {...form.register('copyFromRoleId', { onChange: (e) => setOverride(cellsOf(e.target.value)) })} />
          <div className="mb-3">
            <label htmlFor="role-description" className="form-label">Description<span className="text-danger ms-1" aria-hidden="true">*</span></label>
            <textarea id="role-description" rows={3} className={`form-control${form.formState.errors.description ? ' is-invalid' : ''}`} {...form.register('description')} />
            {form.formState.errors.description && <div className="invalid-feedback d-block" role="alert">{form.formState.errors.description.message}</div>}
          </div>
          <Switch label="Active — can be given to users" checked={status === 'ACTIVE'} onChange={(v) => form.setValue('status', v ? 'ACTIVE' : 'DRAFT')} />
          <h2 className="h5 mt-4">Permissions by module</h2>
          <RolePermissionSwitches modules={catalog?.modules ?? []} cells={cells} onChange={setOverride} lockedKeys={locked} />
        </div>
        <div className="col-lg-4">
          <PlainWordsPanel cells={cells} labels={labels} />
        </div>
      </div>
      {failure && <p role="alert" className="text-danger">{failure}</p>}
      <div className="d-flex gap-2 justify-content-end border-top pt-3">
        <Link href="/roles" className="btn btn-outline-secondary">Cancel</Link>
        <Button type="submit" data-testid="roles-save-button">Save role</Button>
      </div>
      <ReasonDialog open={pending !== null} title="Reason for saving the role" onConfirm={send} onCancel={() => setPending(null)} busy={save.isPending} />
    </form>
  );
}
