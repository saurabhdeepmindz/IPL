'use client';

/**
 * @file    UserRowMenu.tsx
 * @module  Users
 *
 * @description
 * Row actions menu. In plain words: the three-dots menu of a user row.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-001
 * @subtask        ST-ADM01-001-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-01 #list
 * @status         built
 */

import { useEffect, useRef, useState } from 'react';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import type { HfIconName } from '@/hf/icons.generated';
import { useRunUserAction } from '../../hooks/useUserActions';
import type { UserActionKind, UserDetails, UserListItem } from '../../types/user.types';
import { DeactivateUserDialog } from '../DeactivateUserDialog';
import { UserActionConfirm } from '../UserActionConfirm';
import type { UserActionResult } from '../UserActionNotice';

type Item = { key: UserActionKind | 'deactivate'; label: string; icon: HfIconName };

function itemsFor(user: UserListItem | UserDetails, place: 'list' | 'details'): Item[] {
  if (user.status === 'INACTIVE') return [];
  const items: Item[] = [];
  if (user.status === 'LOCKED') items.push({ key: 'unlock', label: 'Unlock', icon: 'unlock' });
  if (user.signIn === 'LOCAL') {
    items.push({ key: 'reset-password', label: 'Reset password', icon: 'refresh' });
    const signedIn = 'firstSignInAt' in user && user.firstSignInAt;
    if (!signedIn) items.push({ key: 'resend-otp', label: 'Resend one-time password', icon: 'mail' });
  }
  if (place === 'list') items.push({ key: 'deactivate', label: 'Deactivate', icon: 'power' });
  return items;
}

interface UserRowMenuProps {
  user: UserListItem | UserDetails;
  place: 'list' | 'details';
  onResult: (result: UserActionResult) => void;
  onDeactivated: () => void;
}

/**
 * UserRowMenu.
 *
 * In plain words: the "more actions" menu of a user row in the design (three dots, a panel with the actions that fit the user's state).
 */
export function UserRowMenu({ user, place, onResult, onDeactivated }: UserRowMenuProps) {
  const [open, setOpen] = useState(false);
  const [asking, setAsking] = useState<UserActionKind | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
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
    <div className={hf('menu-wrap')} style={{ display: 'inline-block' }}>
      <button ref={button} type="button" className={hf('btn btn-text icon sm')} aria-haspopup="menu" aria-expanded={open} aria-label={`Actions for ${user.name}`} onClick={() => setOpen(!open)}>
        <HfIcon name="more" size="sm" />
      </button>
      {open && (
        <div ref={list} role="menu" aria-label={`Actions for ${user.name}`} className={hf('menu', 'open')} onKeyDown={move}>
          {items.map((item) => (
            <button key={item.key} type="button" role="menuitem" className={item.key === 'deactivate' ? hf('danger') : undefined} onClick={() => choose(item)}>
              <HfIcon name={item.icon} size="sm" />
              {item.label}
            </button>
          ))}
        </div>
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
    </div>
  );
}
