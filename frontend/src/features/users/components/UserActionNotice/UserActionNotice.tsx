/**
 * @file    UserActionNotice.tsx
 * @module  Users
 *
 * @description
 * Notice of an action. In plain words: the inline message after an action, with Resend when the e-mail failed and Dismiss (decisions L-91, L-92, L-93).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-008
 * @subtask        ST-ADM01-008-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserActionNotice.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import type { UserActionKind } from '../../types/user.types';

/** The result to show. */
export interface UserActionResult {
  /** The action that ran */
  action: UserActionKind;
  /** The employee code of the user */
  employeeCode: string;
  /** The e-mail of the user, for the sentence */
  email: string;
  /** SENT or FAILED for the two password actions; null for Unlock */
  emailStatus: 'SENT' | 'FAILED' | null;
  /** The message of the API when the call was refused (409 or 422) */
  error?: string;
}

interface UserActionNoticeProps {
  /** The result; null shows nothing */
  result: UserActionResult | null;
  /** Called with Resend: repeats the action that failed */
  onRepeat: (action: UserActionKind, employeeCode: string) => void;
  /** Called with Dismiss */
  onDismiss: () => void;
}

/**
 * UserActionNotice.
 *
 * In plain words: the notice after Unlock, Reset password or Resend one-time password, as an alert of the design: green when it worked, amber when it was refused or the e-mail was not sent (with Resend), always with Dismiss.
 */
export function UserActionNotice({ result, onRepeat, onDismiss }: UserActionNoticeProps) {
  if (!result) return null;
  const failed = result.emailStatus === 'FAILED';
  const bad = Boolean(result.error) || failed;
  const text = result.error
    ? result.error
    : result.action === 'unlock'
      ? `User ${result.employeeCode} unlocked.`
      : failed
        ? 'The e-mail was not sent.'
        : `A new one-time password was e-mailed to ${result.email}.`;
  return (
    <div className={hf('alert', bad ? 'warning' : 'success')} role={bad ? 'alert' : 'status'} data-testid="user-action-notice" style={{ margin: 'var(--spacing-lg) 0', alignItems: 'center' }}>
      <span>
        <HfIcon name={bad ? 'alert' : 'checkC'} />
      </span>
      <div style={{ flex: 1 }}>{text}</div>
      {failed && (
        <button type="button" className={hf('btn btn-outline sm')} onClick={() => onRepeat(result.action, result.employeeCode)}>
          Resend
        </button>
      )}
      <button type="button" className={hf('btn btn-text sm')} onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
