/**
 * @file    Modal.tsx
 * @module  UiComponents
 *
 * @description
 * The UX4G modal (dialog). In plain words: a dialog that traps the keyboard focus, closes on Escape and gives the focus back to what opened it.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-03
 */
import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface ModalProps {
  /** True to show the dialog. */
  open: boolean;
  /** Called when the user closes it (the close button, Escape, or a click on the backdrop). */
  onClose: () => void;
  /** Heading of the dialog. It is also the accessible name. */
  title: string;
  /** The body. */
  children: ReactNode;
  /** Buttons at the bottom, usually Cancel and a main action. */
  footer?: ReactNode;
  /** UX4G size. */
  size?: 'sm' | 'md' | 'lg';
  /** Set to false to stop a click on the backdrop from closing (for confirmations that need a reason). */
  closeOnBackdrop?: boolean;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Typed React wrapper around the UX4G `.modal`. The focus is trapped inside while it is open
 * and returned to the opener when it closes (Standard section 9.6).
 * @see https://www.ux4g.gov.in — Components › Modal
 */
function Modal({ open, onClose, title, children, footer, size = 'md', closeOnBackdrop = true }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialogRef.current)?.focus();
    return () => {
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <>
      <div className="modal-backdrop show" aria-hidden="true" />
      <div
        className="modal d-block show"
        role="presentation"
        onMouseDown={(e) => {
          if (closeOnBackdrop && e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className={cn('modal-dialog modal-dialog-centered', size === 'sm' && 'modal-sm', size === 'lg' && 'modal-lg')}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2 id={titleId} className="modal-title h5">
                {title}
              </h2>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

export { Modal, type ModalProps };
