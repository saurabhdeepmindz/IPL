/**
 * @file    DevSignInForm.tsx
 * @module  Ui
 *
 * @description
 * The development sign-in form. In plain words: shown on /login only when `NEXT_PUBLIC_DEV_SIGN_IN` is true; never in production.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/auth/components/DevSignInForm.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { env } from '@/lib/env';
import { toApiError } from '@/lib/errors';
import { useSessionStore } from '@/store/session.store';
import { devSignIn } from '../services/auth.service';

/**
 * Development sign-in form. In plain words: shown on /login only when `NEXT_PUBLIC_DEV_SIGN_IN` is true; never in production. Employee code and company, a Sign in button; on success it opens /roles.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-04
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-ADM-01 v0.30 §6.5
 * @status    built
 *
 * @dependencies devSignIn, useSessionStore, useRouter
 *
 * @returns The form, or nothing when the flag is off
 */
export function DevSignInForm() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  if (env.NEXT_PUBLIC_DEV_SIGN_IN !== 'true') return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      useSessionStore.getState().signIn(await devSignIn(employeeCode.trim(), companyCode.trim()));
      router.push('/roles');
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 tw:max-w-sm" data-testid="dev-sign-in">
      <p className="small text-body-secondary">Development sign-in (not available in production).</p>
      <Input label="Employee code" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} required />
      <Input label="Company" placeholder="IPL" value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} required />
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy}>
        Sign in
      </Button>
    </form>
  );
}
