/**
 * @file    Badge.tsx
 * @module  UiComponents
 *
 * @description
 * The UX4G badge. In plain words: a small coloured label such as a status.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pill?: boolean;
  dot?: boolean;
}

/**
 * Typed React wrapper around the UX4G `.badge` component.
 * @see https://www.ux4g.gov.in — Components › Badges
 */
function Badge({
  variant = 'primary',
  pill = false,
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn('badge', `text-bg-${variant}`, pill && 'rounded-pill', className)}
      {...props}
    >
      {dot && (
        <span
          className={cn('rounded-circle me-1 d-inline-block', `bg-${variant}`)}
          style={{ width: '0.45em', height: '0.45em', verticalAlign: 'middle' }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
