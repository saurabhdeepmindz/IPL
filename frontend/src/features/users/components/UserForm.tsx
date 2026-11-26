/**
 * @file    UserForm.tsx
 * @module  UsersFeature
 *
 * @description
 * The user form. In plain words: employee details, organisation, sign-in method and company access with roles; the access summary on the right; Save user and Cancel.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserForm.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Button, Input, Select } from '@/components/ui';
import { useRoles } from '@/features/roles';
import { toApiError } from '@/lib/errors';
import { useDepartments, useDesignations } from '../hooks/useMasters';
import { useSaveUser } from '../hooks/useSaveUser';
import { useUser } from '../hooks/useUser';
import { useUsers } from '../hooks/useUsers';
import { userFormSchema, type UserFormValues } from '../schemas/userFormSchema';
import type { UserFormData } from '../types/user.types';
import { AccessSummary } from './AccessSummary';
import { CompanyRoleTable } from './CompanyRoleTable';

/** Props of UserForm. */
interface UserFormProps {
  /** Code of the user to change; empty to add */
  employeeCode?: string;
}

const newKey = (): string => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const EMPTY: UserFormValues = { employeeCode: '', fullName: '', email: '', mobile: '', departmentId: '', designationId: '', reportingManagerCode: '', signIn: 'SSO', companies: [{ companyCode: '', roleIds: [], validFrom: '', validTo: '' }] };

/**
 * User form. In plain words: employee details, organisation, sign-in method and company access with roles; the access summary on the right; Save user and Cancel. One Idempotency-Key per form (decision L-74); no reason dialog (L-73); the code is read-only after the first sign-in; the reporting manager is required unless the designation is the highest.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-02, API-USR-03, API-USR-04
 * @ac        AC-US004-01, AC-US004-02, AC-US004-03, AC-US004-04, AC-US004-05
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.3
 * @status    built
 *
 * @dependencies useSaveUser, useUser, useDepartments, useDesignations, useUsers, CompanyRoleTable, AccessSummary
 *
 * @returns The rendered form
 */
export function UserForm({ employeeCode }: UserFormProps) {
  const router = useRouter();
  const [key] = useState(newKey);
  const [banner, setBanner] = useState<string | null>(null);
  const user = useUser(employeeCode).data;
  const departments = useDepartments().data ?? [];
  const designations = useDesignations().data ?? [];
  const managers = useUsers({ status: 'active', pageSize: 100 }).data?.items ?? [];
  const roles = useRoles({}).data?.items ?? [];
  const save = useSaveUser();
  const locked = Boolean(employeeCode && user?.firstSignInAt);
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: EMPTY,
    values: user?.form ? { employeeCode: user.employeeCode, fullName: user.name, email: user.email, mobile: user.form.mobile ?? '', departmentId: user.form.departmentId ?? '', designationId: user.form.designationId ?? '', reportingManagerCode: user.form.reportingManagerCode ?? '', signIn: user.signIn, companies: user.form.companies.map((c) => ({ ...c, validTo: c.validTo ?? '' })) } : undefined,
  });
  const values = useWatch({ control: form.control });
  const errors: Record<string, string> = {};
  const flat = (o: unknown, path: string): void => {
    const e = o as { message?: unknown } & Record<string, unknown>;
    if (typeof e?.message === 'string') errors[path] = e.message;
    else if (e && typeof e === 'object') Object.entries(e).forEach(([k, v]) => flat(v, path ? `${path}.${k}` : k));
  };
  flat(form.formState.errors, '');
  const roleNames = Object.fromEntries(roles.map((r) => [r.roleId, r.name]));

  const send = (v: UserFormValues) => {
    const highest = designations.find((d) => d.id === v.designationId)?.isHighest === true;
    if (!highest && !v.reportingManagerCode) return form.setError('reportingManagerCode', { message: 'Choose a reporting manager' });
    const changed = employeeCode && !locked && v.employeeCode !== employeeCode;
    const input: UserFormData = {
      employeeCode: employeeCode ?? v.employeeCode, ...(changed ? { newEmployeeCode: v.employeeCode } : {}), fullName: v.fullName.trim(), email: v.email.trim(), ...(v.mobile ? { mobile: v.mobile } : {}),
      departmentId: v.departmentId, designationId: v.designationId, ...(v.reportingManagerCode ? { reportingManagerCode: v.reportingManagerCode } : {}), signIn: v.signIn,
      companies: v.companies.filter((c) => c.companyCode).map((c) => ({ companyCode: c.companyCode, roleIds: c.roleIds, validFrom: c.validFrom, ...(c.validTo ? { validTo: c.validTo } : {}) })),
    };
    setBanner(null);
    save.mutate({ employeeCode, input, idempotencyKey: key }, {
      onSuccess: (r) => router.push(`/users?created=${'oneTimePassword' in r ? r.employeeCode : v.employeeCode}&otp=${'oneTimePassword' in r && r.oneTimePassword.required ? (r.oneTimePassword.emailStatus ?? 'NONE') : 'NONE'}`),
      onError: (err) => {
        const e = toApiError(err);
        const messages: Record<string, string> = { DUPLICATE_EMPLOYEE_CODE: 'This employee code is already used', DUPLICATE_EMAIL: 'This e-mail is already used', EMPLOYEE_CODE_READ_ONLY: 'The employee code cannot be changed after the first sign-in' };
        const field = e.code === 'DUPLICATE_EMAIL' ? 'email' : 'employeeCode';
        if (messages[e.code]) form.setError(field, { message: messages[e.code] });
        else if (e.status === 422 && Object.keys(e.fields).length > 0) Object.entries(e.fields).forEach(([f, m]) => form.setError(f as keyof UserFormValues, { message: m }));
        else setBanner('The user could not be saved. Check the connection and try again; your entries are kept.');
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(send)} noValidate data-testid="user-form">
      <h1 className="h3">{employeeCode ? 'Edit user' : 'Add user'}</h1>
      <div className="row">
        <div className="col-lg-8">
          <div className="row">
            <div className="col-md-6"><Input label="Employee code" required readOnly={locked} hint={locked ? 'Cannot be changed after the user signs in' : '5 digits'} error={errors.employeeCode} {...form.register('employeeCode')} /></div>
            <div className="col-md-6"><Input label="Full name" required error={errors.fullName} {...form.register('fullName')} /></div>
            <div className="col-md-6"><Input label="Official e-mail" required error={errors.email} {...form.register('email')} /></div>
            <div className="col-md-6"><Input label="Mobile number" error={errors.mobile} {...form.register('mobile')} /></div>
            <div className="col-md-6"><Select label="Department" required placeholder="Select department" options={departments.map((d) => ({ value: d.id, label: d.name }))} error={errors.departmentId} {...form.register('departmentId')} /></div>
            <div className="col-md-6"><Select label="Designation" required placeholder="Select designation" options={designations.map((d) => ({ value: d.id, label: d.name }))} error={errors.designationId} {...form.register('designationId')} /></div>
            <div className="col-md-6"><Select label="Reporting manager" placeholder="Select reporting manager" options={managers.filter((m) => m.employeeCode !== employeeCode).map((m) => ({ value: m.employeeCode, label: `${m.name} (${m.employeeCode})` }))} error={errors.reportingManagerCode} {...form.register('reportingManagerCode')} /></div>
          </div>
          <fieldset className="mb-3">
            <legend className="h6">Sign-in method</legend>
            <label className="me-4"><input type="radio" className="form-check-input me-1" value="SSO" {...form.register('signIn')} />IPL single sign-on (SSO)</label>
            <label><input type="radio" className="form-check-input me-1" value="LOCAL" {...form.register('signIn')} />Local password</label>
          </fieldset>
          <h2 className="h5">Company access and roles</h2>
          <CompanyRoleTable rows={(values.companies ?? EMPTY.companies) as UserFormValues['companies']} onChange={(rows) => form.setValue('companies', rows, { shouldDirty: true })} errors={errors} />
        </div>
        <div className="col-lg-4">
          <AccessSummary signIn={values.signIn ?? 'SSO'} companies={(values.companies ?? []) as UserFormValues['companies']} roleNames={roleNames} />
        </div>
      </div>
      {banner && <p role="alert" className="text-danger">{banner}</p>}
      <div className="d-flex gap-2 justify-content-end border-top pt-3">
        <Link href="/users" className="btn btn-outline-secondary">Cancel</Link>
        <Button type="submit" disabled={save.isPending} data-testid="user-save-button">Save user</Button>
      </div>
    </form>
  );
}
