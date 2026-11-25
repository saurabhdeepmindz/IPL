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
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserActionNotice.tsx
 * @lld-synced     v0.26
 * @status         built
 */
'use client';

import { Button } from '@/components/ui';
import type { UserActionKind } from '../types/user.types';

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

/** Props of UserActionNotice. */
interface UserActionNoticeProps {
  /** The result; null shows nothing */
  result: UserActionResult | null;
  /** Called with Resend: repeats the action that failed */
  onRepeat: (action: UserActionKind, employeeCode: string) => void;
  /** Called with Dismiss */
  onDismiss: () => void;
}

/**
 * Notice. In plain words: "User 20001 unlocked.", "A new one-time password was e-mailed to <e-mail>.", or "The e-mail was not sent." with Resend; a refused call shows the message of the API.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-008
 * @subtask   ST-ADM01-008-FE-02
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-06, API-USR-07, API-USR-08
 * @ac        AC-US008-01, 02, 03
 * @lld       LLD-EPIC-ADM-01 v0.26 §6.3
 * @status    built
 *
 * @dependencies Button
 *
 * @returns The rendered output
 */
export function UserActionNotice({ result, onRepeat, onDismiss }: UserActionNoticeProps) {
  if (!result) return null;
  const failed = result.emailStatus === 'FAILED';
  const text = result.error
    ? result.error
    : result.action === 'unlock'
      ? `User ${result.employeeCode} unlocked.`
      : failed
        ? 'The e-mail was not sent.'
        : `A new one-time password was e-mailed to ${result.email}.`;
  return (
    <div className={`alert ${result.error || failed ? 'alert-warning' : 'alert-success'} d-flex align-items-center gap-3`} role={result.error || failed ? 'alert' : 'status'} data-testid="user-action-notice">
      <span className="flex-grow-1">{text}</span>
      {failed && (
        <Button variant="primary" outline size="sm" onClick={() => onRepeat(result.action, result.employeeCode)}>
          Resend
        </Button>
      )}
      <Button variant="secondary" outline size="sm" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  );
}
