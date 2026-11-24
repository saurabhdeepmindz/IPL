/**
 * @file    Input.tsx
 * @module  UiComponents
 *
 * @description
 * The UX4G text input with label and error text. In plain words: the one input field every form uses.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Use UX4G floating-label style. */
  floating?: boolean;
}

/**
 * Typed React wrapper around UX4G `.form-control` with label, hint and
 * validation feedback wired up for screen readers.
 * @see https://www.ux4g.gov.in — Forms › Form controls
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, size = 'md', floating = false, id, className, required, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const input = (
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(errorId, hintId) || undefined}
        placeholder={floating ? (props.placeholder ?? label) : props.placeholder}
        className={cn(
          'form-control',
          size === 'sm' && 'form-control-sm',
          size === 'lg' && 'form-control-lg',
          error && 'is-invalid',
          className,
        )}
        {...props}
      />
    );

    const labelEl = label && (
      <label htmlFor={inputId} className="form-label">
        {label}
        {required && (
          <span className="text-danger ms-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );

    return (
      <div className={cn('mb-3', floating && 'form-floating')}>
        {floating ? (
          <>
            {input}
            {labelEl}
          </>
        ) : (
          <>
            {labelEl}
            {input}
          </>
        )}
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

Input.displayName = 'Input';

export { Input, type InputProps };
