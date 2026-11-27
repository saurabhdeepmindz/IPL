'use client';

/**
 * @file    PasswordFields.tsx
 * @module  Auth
 *
 * @description
 * Shared parts of the password forms. In plain words: the password box with Show inside it, and the field message line (icon and words) of the design.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @story          US-LGN02-007, US-LGN02-008
 * @subtask        ST-LGN02-007-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.5
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/components/PasswordFields.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import { hf } from '../hf/hf';
import { Icon } from '../hf/Icon';

/** One password field of the design: the box with Show inside it. */
export function PasswordBox(props: { id: string; testId: string; show: boolean; onToggle: () => void; field: object; autoComplete?: string }) {
  return (
    <div className={hf('pw')}>
      <input id={props.id} className={hf('input')} type={props.show ? 'text' : 'password'} autoComplete={props.autoComplete ?? 'new-password'} data-testid={props.testId} {...props.field} />
      <button className={hf('eye')} type="button" aria-label={props.show ? 'Hide password' : 'Show password'} aria-pressed={props.show} onClick={props.onToggle}>
        {props.show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

/** The message line under a field; nothing when there is no text. */
export function FieldError(props: { id: string; text?: string }) {
  if (!props.text) return null;
  return (
    <span className={hf('err')} data-testid={props.id}>
      <span>
        <Icon name="alertC" />
      </span>
      <span>{props.text}</span>
    </span>
  );
}
