/**
 * @file    ReasonDialog.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest supporting tests of the reason dialog and the status badge (written before the code). In plain words: a reason is required, Escape cancels, the busy state blocks the button, every status has a word.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012, US-ADM01-013
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.23 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.23.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/components/ReasonDialog.test.tsx
 * @lld-synced     v0.23
 * @status         built
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReasonDialog } from '@/components/ams/ReasonDialog';
import { StatusBadge } from '@/components/ams/StatusBadge';

const setup = (over: Partial<React.ComponentProps<typeof ReasonDialog>> = {}) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(<ReasonDialog open title="Why?" onConfirm={onConfirm} onCancel={onCancel} {...over} />);
  return { onConfirm, onCancel };
};

describe('ReasonDialog and StatusBadge (supporting tests)', () => {
  /**
   * @story     US-ADM01-012, US-ADM01-013
   * @ac        AC-US012-06
   * @subtask   ST-ADM01-012-FE-04
   * In plain words: supporting test. Confirm without a reason shows "Enter a reason" and sends nothing; a reason is trimmed before it is sent.
   */
  it('requires a reason before it confirms', async () => {
    const { onConfirm } = setup();
    await userEvent.click(screen.getByTestId('reason-confirm'));
    expect(screen.getByText('Enter a reason')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
    await userEvent.type(screen.getByLabelText(/reason/i), '  Left the company  ');
    await userEvent.click(screen.getByTestId('reason-confirm'));
    expect(onConfirm).toHaveBeenCalledWith('Left the company');
  });

  /**
   * @story     US-ADM01-012, US-ADM01-013
   * @ac        AC-US012-06
   * @subtask   ST-ADM01-012-FE-04
   * In plain words: supporting test. Escape cancels, the busy state disables Confirm, the reason stops at 500 characters.
   */
  it('cancels on Escape, blocks Confirm while busy and limits the reason', async () => {
    const { onCancel } = setup({ busy: true });
    expect(screen.getByTestId('reason-confirm')).toBeDisabled();
    expect(screen.getByLabelText(/reason/i)).toHaveAttribute('maxlength', '500');
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  /**
   * @story     US-ADM01-012, US-ADM01-013
   * @ac        AC-US012-06
   * @subtask   ST-ADM01-012-FE-04
   * In plain words: supporting test. A closed dialog shows nothing.
   */
  it('shows nothing when closed', () => {
    render(<ReasonDialog open={false} title="Why?" onConfirm={() => undefined} onCancel={() => undefined} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  /**
   * @story     US-ADM01-012, US-ADM01-013
   * @ac        AC-US012-01
   * @subtask   ST-ADM01-012-FE-04
   * In plain words: supporting test. Every status is shown as a word, never by colour alone.
   */
  it('shows a word for every status', () => {
    render(
      <>
        <StatusBadge status="ACTIVE" />
        <StatusBadge status="DRAFT" />
        <StatusBadge status="INACTIVE" />
      </>,
    );
    for (const word of ['Active', 'Draft', 'Inactive']) expect(screen.getByText(word)).toBeInTheDocument();
  });
});
