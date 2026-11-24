/**
 * @file    Select.tsx
 * @module  UiComponents
 *
 * @description
 * The UX4G select (drop-down list). In plain words: a labelled list with a hint and an error message next to the field.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-03
 */
import { type SelectHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  /** Value sent to the API. */
  value: string;
  /** Text the user reads. */
  label: string;
  /** True to show the option but not allow it. */
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Text above the field. Always give one. */
  label: string;
  /** The choices. */
  options: SelectOption[];
  /** First empty choice, for example "Select a company". */
  placeholder?: string;
  /** Error message; shown in red and tied to the field for screen readers. */
  error?: string;
  /** Help text under the field. */
  hint?: string;
  /** UX4G size. */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Typed React wrapper around the UX4G `.form-select`.
 * @see https://www.ux4g.gov.in — Forms › Select
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, hint, size = 'md', id, className, required, ...props }, ref) => {
    const generated = useId();
    const selectId = id ?? generated;
    const hintId = hint ? `${selectId}-hint` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    return (
      <div className="mb-3">
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && (
            <span className="text-danger ms-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(errorId, hintId) || undefined}
          className={cn('form-select', size === 'sm' && 'form-select-sm', size === 'lg' && 'form-select-lg', error && 'is-invalid', className)}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        {error && (
          <div id={errorId} className="invalid-feedback" role="alert">
            {error}
          </div>
        )}
        {hint && !error && (
          <div id={hintId} className="form-text">
            {hint}
          </div>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export { Select, type SelectProps, type SelectOption };
