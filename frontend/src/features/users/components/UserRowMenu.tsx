/**
 * @file    UserRowMenu.tsx
 * @module  Users
 *
 * @description
 * Row menu. In plain words: a keyboard-accessible menu of the actions that fit the user; it also runs the confirmation and the call (decisions L-87 to L-89).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-008
 * @subtask        ST-ADM01-008-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserRowMenu.tsx
 * @lld-synced     v0.28
 * @status         built
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRunUserAction } from '../hooks/useUserActions';
import type { UserActionKind, UserDetails, UserListItem } from '../types/user.types';
import { DeactivateUserDialog } from './DeactivateUserDialog';
import { UserActionConfirm } from './UserActionConfirm';
import type { UserActionResult } from './UserActionNotice';

type Item = { key: UserActionKind | 'deactivate'; label: string };

/** The items that fit the user (decision L-89). */
function itemsFor(user: UserListItem | UserDetails, place: 'list' | 'details'): Item[] {
  if (user.status === 'INACTIVE') return [];
  const items: Item[] = [];
  if (user.status === 'LOCKED') items.push({ key: 'unlock', label: 'Unlock' });
  if (user.signIn === 'LOCAL') {
    items.push({ key: 'reset-password', label: 'Reset password' });
    const signedIn = 'firstSignInAt' in user && user.firstSignInAt;
    if (!signedIn) items.push({ key: 'resend-otp', label: 'Resend one-time password' });
  }
  if (place === 'list') items.push({ key: 'deactivate', label: 'Deactivate' });
  return items;
}

/** Props of UserRowMenu. */
interface UserRowMenuProps {
  /** The user; the details page also gives the first sign-in date */
  user: UserListItem | UserDetails;
  /** Where the menu is shown: the list shows Resend for every local user */
  place: 'list' | 'details';
  /** Called with the result of an action, for the notice */
  onResult: (result: UserActionResult) => void;
  /** Called after a deactivation */
  onDeactivated: () => void;
}

/**
 * Row menu. In plain words: button "Actions for <name>"; Enter opens, arrows move, Escape closes; items Unlock, Reset password, Resend one-time password, Deactivate as the user allows; none for an Inactive user.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-008
 * @subtask   ST-ADM01-008-FE-02
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-05, API-USR-06, API-USR-07, API-USR-08
 * @ac        AC-US008-01, 02, 03
 * @lld       LLD-EPIC-ADM-01 v0.26 §6.3
 * @status    built
 *
 * @dependencies useUserActions, UserActionConfirm, DeactivateUserDialog
 *
 * @returns The rendered output
 */
export function UserRowMenu({ user, place, onResult, onDeactivated }: UserRowMenuProps) {
  const [open, setOpen] = useState(false);
  const [asking, setAsking] = useState<UserActionKind | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const { run, busy } = useRunUserAction(onResult);
  const items = itemsFor(user, place);

  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!button.current?.parentElement?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);

  if (items.length === 0) return null;

  const move = (e: React.KeyboardEvent) => {
    const all = Array.from(list.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const at = all.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') all[(at + 1) % all.length]?.focus();
    else if (e.key === 'ArrowUp') all[(at - 1 + all.length) % all.length]?.focus();
    else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
      if (e.key === 'Escape') button.current?.focus();
    } else return;
    if (e.key !== 'Tab') e.preventDefault();
  };

  const choose = (item: Item) => {
    setOpen(false);
    if (item.key === 'deactivate') setDeactivating(true);
    else setAsking(item.key);
  };

  return (
    <span className="position-relative d-inline-block">
      <button ref={button} type="button" className="btn btn-outline-secondary btn-sm" aria-haspopup="menu" aria-expanded={open} aria-label={`Actions for ${user.name}`} onClick={() => setOpen(!open)}>
        <span aria-hidden="true">⋮</span>
      </button>
      {open && (
        <ul ref={list} role="menu" aria-label={`Actions for ${user.name}`} className="list-unstyled position-absolute end-0 bg-white border rounded shadow-sm p-1 m-0" style={{ zIndex: 10, minWidth: '14rem' }} onKeyDown={move}>
          {items.map((item) => (
            <li key={item.key} role="none">
              <button type="button" role="menuitem" className="btn btn-link text-start w-100 text-decoration-none" onClick={() => choose(item)}>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <UserActionConfirm
        action={asking}
        userName={user.name}
        email={user.email}
        busy={busy}
        onCancel={() => setAsking(null)}
        onConfirm={() => {
          const action = asking;
          setAsking(null);
          if (action) void run(user, action);
        }}
      />
      <DeactivateUserDialog user={deactivating ? user : null} onClose={() => setDeactivating(false)} onDone={onDeactivated} />
    </span>
  );
}
