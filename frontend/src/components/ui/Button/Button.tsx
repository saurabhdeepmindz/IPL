/**
 * @file    Button.tsx
 * @module  UiComponents
 *
 * @description
 * The UX4G button. In plain words: the one button every screen uses, with variants, loading and disabled states.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant =
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Renders the UX4G outline style (`btn-outline-*`). */
  outline?: boolean;
  size?: ButtonSize;
  /** Full-width block button. */
  block?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const sizeClass: Record<ButtonSize, string | undefined> = {
  sm: 'btn-sm',
  md: undefined,
  lg: 'btn-lg',
};

/**
 * Typed React wrapper around the UX4G `.btn` component.
 * @see https://www.ux4g.gov.in — Components › Buttons
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      outline = false,
      size = 'md',
      block = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      type = 'button',
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={cn(
          'btn',
          variant === 'link' ? 'btn-link' : outline ? `btn-outline-${variant}` : `btn-${variant}`,
          sizeClass[size],
          block && 'w-100',
          'd-inline-flex align-items-center justify-content-center gap-2',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
            <span role="status">Loading…</span>
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
