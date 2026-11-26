'use client';

/**
 * @file    RoleForm.tsx
 * @module  Roles
 *
 * @description
 * Role form. In plain words: HF-ADM-02 create and edit view.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-02 #new, #edit
 * @status         built
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { ReasonDialog } from '@/components/ams';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { toApiError } from '@/lib/errors';
import { usePermissionCatalog } from '../hooks/usePermissionCatalog';
import { useRoles } from '../hooks/useRoles';
import { useSaveRole } from '../hooks/useSaveRole';
import { roleFormSchema, type RoleFormValues } from '../schemas/roleFormSchema';
import type { PermissionCell } from '../types/role.types';
import { PlainWordsPanel } from './PlainWordsPanel';
import { RolePermissionSwitches } from './RolePermissionSwitches';

interface RoleFormProps {
  roleId?: string;
}

/** Field message line of the design: icon and words under the field. */
function FieldError({ text }: { text?: string }) {
  return (
    <span className={hf('err')} role={text ? 'alert' : undefined}>
      <span>
        <HfIcon name="alertC" />
      </span>
      <span>{text}</span>
    </span>
  );
}

function Help({ children }: { children: string }) {
  return (
    <span className={hf('help')}>
      <span>
        <HfIcon name="info" />
      </span>
      {children}
    </span>
  );
}

/**
 * RoleForm.
 *
 * In plain words: the Create role and Edit role screen of the high-fidelity design (HF-ADM-02): the "About the role" and "Permissions by module" sections in one card, the "In plain words" card beside it, and the sticky foot with Cancel and Save role.
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
  const errors = form.formState.errors;
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

  const register = form.register('copyFromRoleId', { onChange: (e) => setOverride(cellsOf(e.target.value)) });
  return (
    <div data-testid="roles-form-page">
      <div className={hf('page-head')}>
        <div>
          <h1>{roleId ? 'Edit role' : 'Create role'}</h1>
          <p>Name the role and choose what it allows. Detailed action-level rights (create, view, edit, approve, export per module) are refined in Permission Management.</p>
        </div>
      </div>
      <div className={hf('split')}>
        <form className={hf('card')} onSubmit={form.handleSubmit(setPending)} noValidate data-testid="roles-form">
          <div className={hf('form-sec')}>
            <h3>About the role</h3>
            <p>Shown to administrators when giving access to users.</p>
            <div className={hf('form-grid')}>
              <div className={hf('field', errors.name && 'invalid')}>
                <label htmlFor="r-name">
                  Role name<span className={hf('req')}>*</span>
                </label>
                <input className={hf('input')} id="r-name" maxLength={40} placeholder="e.g. Plant Head" {...form.register('name')} />
                <Help>Must be unique. Up to 40 characters.</Help>
                <FieldError text={errors.name?.message} />
              </div>
              <div className={hf('field')}>
                <label htmlFor="r-copy">Start from</label>
                <select className={hf('select')} id="r-copy" {...register}>
                  <option value="">Blank role</option>
                  {roles.map((r) => (
                    <option key={r.roleId} value={r.roleId}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <Help>Copies the permissions of an existing role; you can change them below.</Help>
              </div>
              <div className={hf('field full', errors.description && 'invalid')}>
                <label htmlFor="r-desc">
                  Description<span className={hf('req')}>*</span>
                </label>
                <textarea className={hf('textarea')} id="r-desc" maxLength={200} placeholder="Who is this role for and what can they do?" {...form.register('description')} />
                <FieldError text={errors.description?.message} />
              </div>
              <div className={hf('field')}>
                <span className={hf('lbl')}>Status</span>
                <label className={hf('toggle')}>
                  <input type="checkbox" role="switch" checked={status === 'ACTIVE'} onChange={(e) => form.setValue('status', e.target.checked ? 'ACTIVE' : 'DRAFT')} />
                  <span className={hf('track')} />
                  <span>Active — can be given to users</span>
                </label>
              </div>
            </div>
          </div>
          <div className={hf('form-sec')}>
            <h3>Permissions by module</h3>
            <p>Switch on what this role may do. Data scope decides whose proposals the role can see.</p>
            <RolePermissionSwitches modules={catalog?.modules ?? []} cells={cells} onChange={setOverride} lockedKeys={locked} />
          </div>
          {failure && (
            <p role="alert" style={{ padding: '0 var(--spacing-xl)', color: 'var(--text-error)' }}>
              {failure}
            </p>
          )}
          <div className={hf('sticky-foot')}>
            <span className={hf('muted')} style={{ fontSize: 'var(--fs-1)' }}>
              Saving asks for a reason, recorded in the audit trail.
            </span>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <Link className={hf('btn btn-neutral')} href="/roles">
                Cancel
              </Link>
              <button className={hf('btn btn-primary')} type="submit" data-testid="roles-save-button">
                <HfIcon name="check" />
                Save role
              </button>
            </div>
          </div>
        </form>
        <PlainWordsPanel cells={cells} labels={labels} />
      </div>
      <ReasonDialog open={pending !== null} title="Reason for saving the role" onConfirm={send} onCancel={() => setPending(null)} busy={save.isPending} />
    </div>
  );
}
