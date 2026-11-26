'use client';

/**
 * @file    HfModal.tsx
 * @module  HF
 *
 * @description
 * Dialog and drawer. In plain words: the dimmed page, head, body and foot of the design.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             HF-ADM-02 modals and drawer
 * @status         built
 */

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { hf } from './hf';
import { HfIcon } from './HfIcon';

interface HfModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Buttons of the foot. */
  footer?: ReactNode;
  /** Small line under the title (a drawer shows what it is about). */
  subtitle?: string;
  /** A side drawer instead of a centred dialog. */
  drawer?: boolean;
  /** Close with a click outside. Off by default: a dialog that asks for a reason must not vanish by accident. */
  closeOnBackdrop?: boolean;
}

/**
 * HfModal.
 *
 * In plain words: the dialog and the side drawer of the high-fidelity design: dimmed page behind, a head with the title and a close button, a body and a foot. Escape closes it; focus goes to the first field when it opens.
 */
export function HfModal({ open, title, onClose, children, footer, subtitle, drawer = false, closeOnBackdrop = false }: HfModalProps) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', key);
    box.current?.querySelector<HTMLElement>('input:not([type=hidden]), select, textarea, button:not(.hf-close-btn)')?.focus();
    return () => document.removeEventListener('keydown', key);
  }, [open, onClose]);
  if (!open) return null;
  const inner = (
    <>
      <div className={hf('modal-head')} style={drawer ? { borderBottom: '1px solid var(--stroke-100)', paddingBottom: 'var(--spacing-lg)' } : undefined}>
        <div>
          <h2 id={id}>{title}</h2>
          {subtitle && <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-2)', color: 'var(--text-hint)' }}>{subtitle}</p>}
        </div>
        <button type="button" className={hf('close-btn')} aria-label="Close" onClick={onClose}>
          <HfIcon name="x" />
        </button>
      </div>
      <div className={hf('modal-body')}>{children}</div>
      {footer && <div className={hf('modal-foot')}>{footer}</div>}
    </>
  );
  return (
    <div ref={box} className={hf('scrim', 'open', drawer && 'drawer-scrim')} onMouseDown={(e) => closeOnBackdrop && e.target === e.currentTarget && onClose()}>
      {drawer ? (
        <aside className={hf('drawer', 'open')} role="dialog" aria-modal="true" aria-labelledby={id}>
          {inner}
        </aside>
      ) : (
        <div className={hf('modal')} role="dialog" aria-modal="true" aria-labelledby={id}>
          {inner}
        </div>
      )}
    </div>
  );
}
