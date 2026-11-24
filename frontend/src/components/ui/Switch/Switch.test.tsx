/**
 * @file    Switch.test.tsx
 * @module  UiComponents
 *
 * @description
 * Supporting tests of ST-ADM01-000-FE-03 for the switch, written before the code. In plain words: it shows on and off, works by keyboard, and a locked switch cannot be changed.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-03
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

describe('Switch', () => {
  it('shows its state and its label', () => {
    render(<Switch label="Allow export" checked onChange={() => undefined} />);
    expect(screen.getByRole('switch', { name: 'Allow export' })).toBeChecked();
  });

  it('can be used by keyboard (Space flips it)', async () => {
    const onChange = vi.fn();
    render(<Switch label="Allow export" checked={false} onChange={onChange} />);
    await userEvent.tab();
    expect(screen.getByRole('switch')).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('a locked switch is disabled and shows the reason', async () => {
    const onChange = vi.fn();
    render(<Switch label="Manage roles" checked onChange={onChange} lockedReason="Protected right of the Administrator" />);
    expect(screen.getByRole('switch')).toBeDisabled();
    expect(screen.getByText('Protected right of the Administrator')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('a disabled switch cannot be changed', () => {
    render(<Switch label="X" checked={false} onChange={() => undefined} disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
