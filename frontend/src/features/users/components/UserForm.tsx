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
import { useRoles } from '@/features/roles';
import { hf } from '@/hf/hf';
import { HfField } from '@/hf/HfField';
import { HfIcon } from '@/hf/HfIcon';
import { toApiError } from '@/lib/errors';
import { useCompanies, useDepartments, useDesignations } from '../hooks/useMasters';
import { useSaveUser } from '../hooks/useSaveUser';
import { useUser } from '../hooks/useUser';
import { useUsers } from '../hooks/useUsers';
import { userFormSchema, type UserFormValues } from '../schemas/userFormSchema';
import type { UserFormData } from '../types/user.types';
import { AccessSummary } from './AccessSummary';
import { CompanyRoleTable } from './CompanyRoleTable';

interface UserFormProps {
  /** Code of the user to change; empty to add */
  employeeCode?: string;
}

const newKey = (): string => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const EMPTY: UserFormValues = { employeeCode: '', fullName: '', email: '', mobile: '', departmentId: '', designationId: '', reportingManagerCode: '', signIn: 'SSO', companies: [{ companyCode: '', roleIds: [], validFrom: '', validTo: '' }] };

/**
 * UserForm.
 *
 * In plain words: the Add user and Edit user screen of the high-fidelity design (HF-ADM-01 #new, #edit): page head, one card with Employee details, Organisation, Sign-in method (two cards) and Company access and roles, the sticky foot with Cancel and Save, and the Access summary beside it.
 */
export function UserForm({ employeeCode }: UserFormProps) {
  const router = useRouter();
  const [key] = useState(newKey);
  const [banner, setBanner] = useState<string | null>(null);
  const user = useUser(employeeCode).data;
  const departments = useDepartments().data ?? [];
  const designations = useDesignations().data ?? [];
  const companies = useCompanies().data?.items ?? [];
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
  const companyNames = Object.fromEntries(companies.map((c) => [c.code, `${c.name} · ${c.code}`]));
  const errorCount = Object.keys(errors).length;

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

  const reg = form.register;
  const signIn = values.signIn ?? 'SSO';
  return (
    <section>
      <div className={hf('page-head')}>
        <div>
          <h1>{employeeCode ? `Edit user${user ? ` · ${user.name}` : ''}` : 'Add user'}</h1>
          <p>
            Fields marked <span className={hf('req')} style={{ color: 'var(--danger-default)' }}>*</span> are required. The user gets an e-mail once saved.
          </p>
        </div>
      </div>
      <div className={hf('split')}>
        <form className={hf('card')} onSubmit={form.handleSubmit(send)} noValidate data-testid="user-form">
          {(errorCount > 0 || banner) && (
            <div className={hf('alert danger')} role="alert" style={{ margin: 'var(--spacing-xl) var(--spacing-xl) 0' }}>
              <span>
                <HfIcon name="alertC" />
              </span>
              <div>
                <b>{banner ? 'The user was not saved' : 'Please correct the highlighted fields'}</b>
                <span>{banner ? ` ${banner}` : ` ${errorCount} ${errorCount === 1 ? 'field needs' : 'fields need'} attention.`}</span>
              </div>
            </div>
          )}
          <div className={hf('form-sec')}>
            <h3>Employee details</h3>
            <p>As in IPL HR records. The employee code links the user to their companies.</p>
            <div className={hf('form-grid')}>
              <HfField label="Employee code" htmlFor="f-code" required error={errors.employeeCode} help={locked ? 'Cannot be changed after the user signs in' : '5 digits. Cannot be changed after the user signs in.'}>
                <input id="f-code" className={hf('input mono')} inputMode="numeric" maxLength={5} placeholder="e.g. 10412" readOnly={locked} {...reg('employeeCode')} />
              </HfField>
              <HfField label="Full name" htmlFor="f-name" required error={errors.fullName}>
                <input id="f-name" className={hf('input')} placeholder="As in HR records" {...reg('fullName')} />
              </HfField>
              <HfField label="Official e-mail" htmlFor="f-mail" required error={errors.email} help="All AMS notifications go to this address.">
                <input id="f-mail" className={hf('input')} type="email" placeholder="name@ipl.example" {...reg('email')} />
              </HfField>
              <HfField label="Mobile number" htmlFor="f-mob" error={errors.mobile}>
                <input id="f-mob" className={hf('input')} inputMode="tel" placeholder="Optional" {...reg('mobile')} />
              </HfField>
            </div>
          </div>
          <div className={hf('form-sec')}>
            <h3>Organisation</h3>
            <p>Department and designation come from the masters (Master Data Management).</p>
            <div className={hf('form-grid')}>
              <HfField label="Department" htmlFor="f-dept" required error={errors.departmentId}>
                <select id="f-dept" className={hf('select')} {...reg('departmentId')}>
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </HfField>
              <HfField label="Designation" htmlFor="f-des" required error={errors.designationId}>
                <select id="f-des" className={hf('select')} {...reg('designationId')}>
                  <option value="">Select designation</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </HfField>
              <HfField label="Reporting manager" htmlFor="f-mgr" required error={errors.reportingManagerCode} help="Receives SLA escalations for proposals this user holds.">
                <select id="f-mgr" className={hf('select')} {...reg('reportingManagerCode')}>
                  <option value="">Select reporting manager</option>
                  {managers.filter((m) => m.employeeCode !== employeeCode).map((m) => (
                    <option key={m.employeeCode} value={m.employeeCode}>
                      {`${m.name} (${m.employeeCode})`}
                    </option>
                  ))}
                </select>
              </HfField>
            </div>
          </div>
          <div className={hf('form-sec')}>
            <h3>Sign-in method</h3>
            <p>SOW 4.6: IPL single sign-on, with local login as fallback.</p>
            <div className={hf('radio-cards')}>
              <label className={hf('radio-card')}>
                <input type="radio" value="SSO" aria-label="IPL single sign-on (SSO)" {...reg('signIn')} />
                <span>
                  <b>IPL single sign-on (SSO)</b>
                  <small>Recommended. Uses the employee&apos;s IPL network account.</small>
                </span>
              </label>
              <label className={hf('radio-card')}>
                <input type="radio" value="LOCAL" aria-label="Local password" {...reg('signIn')} />
                <span>
                  <b>Local password</b>
                  <small>For users without an IPL network account. A one-time password is e-mailed; it must be changed at first sign-in.</small>
                </span>
              </label>
            </div>
          </div>
          <div className={hf('form-sec')}>
            <h3>
              Company access and roles<span className={hf('req')} style={{ color: 'var(--danger-default)' }}>*</span>
            </h3>
            <p>One URL for all companies: the user sees only the companies listed here, each with its own roles.</p>
            <CompanyRoleTable rows={(values.companies ?? EMPTY.companies) as UserFormValues['companies']} onChange={(rows) => form.setValue('companies', rows, { shouldDirty: true })} errors={errors} />
          </div>
          <div className={hf('sticky-foot')}>
            <span className={hf('muted')} style={{ fontSize: 'var(--fs-1)' }}>
              Changes are recorded in the audit trail.
            </span>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <Link className={hf('btn btn-neutral')} href="/users">
                Cancel
              </Link>
              <button className={hf('btn btn-primary')} type="submit" disabled={save.isPending} data-testid="user-save-button">
                <HfIcon name="check" />
                {employeeCode ? 'Save changes' : 'Save user'}
              </button>
            </div>
          </div>
        </form>
        <AccessSummary name={values.fullName ?? ''} signIn={signIn} companies={(values.companies ?? []) as UserFormValues['companies']} roleNames={roleNames} companyNames={companyNames} />
      </div>
    </section>
  );
}
