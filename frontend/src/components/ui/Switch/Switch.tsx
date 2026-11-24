/**
 * @file    Switch.tsx
 * @module  UiComponents
 *
 * @description
 * The UX4G switch (on/off toggle). In plain words: a labelled toggle that works with the keyboard and can be locked with a reason.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-03
 */
import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'checked' | 'size'> {
  /** Text next to the switch. Always give one; it is the accessible name. */
  label: string;
  /** Current state (controlled). */
  checked: boolean;
  /** Called with the new state when the user flips the switch. */
  onChange: (checked: boolean) => void;
  /** Short help text under the label. */
  hint?: string;
  /** When set, the switch is disabled and this reason is shown (for locked rights). */
  lockedReason?: string;
}

/**
 * Typed React wrapper around the UX4G `.form-switch`.
 * @see https://www.ux4g.gov.in — Forms › Switches
 */
const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, checked, onChange, hint, lockedReason, disabled, id, className, ...props }, ref) => {
    const generated = useId();
    const inputId = id ?? generated;
    const noteId = hint || lockedReason ? `${inputId}-note` : undefined;
    return (
      <div className={cn('form-check form-switch', className)}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          className="form-check-input"
          checked={checked}
          disabled={disabled || Boolean(lockedReason)}
          aria-checked={checked}
          aria-describedby={noteId}
          onChange={(e) => onChange(e.target.checked)}
          {...props}
        />
        <label htmlFor={inputId} className="form-check-label">
          {label}
        </label>
        {(lockedReason || hint) && (
          <div id={noteId} className="form-text">
            {lockedReason ?? hint}
          </div>
        )}
      </div>
    );
  },
);

Switch.displayName = 'Switch';

export { Switch, type SwitchProps };
