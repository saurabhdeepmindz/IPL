/**
 * @file    Modal.test.tsx
 * @module  UiComponents
 *
 * @description
 * Supporting tests of ST-ADM01-000-FE-03 for the modal, written before the code. In plain words: it has a name, traps the focus, closes on Escape and gives the focus back.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-03
 */
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

function Demo({ onClose = () => undefined }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open it</button>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
        title="Deactivate user"
        footer={
          <>
            <button>Cancel</button>
            <button>Deactivate</button>
          </>
        }
      >
        <label>
          Reason <input />
        </label>
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('is not shown until opened', () => {
    render(<Demo />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has its title as its name and is modal', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByText('Open it'));
    const dialog = screen.getByRole('dialog', { name: 'Deactivate user' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('moves the focus inside when it opens', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByText('Open it'));
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
  });

  it('traps the focus: Tab never leaves the dialog', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByText('Open it'));
    const dialog = screen.getByRole('dialog');
    for (let i = 0; i < 8; i += 1) {
      await userEvent.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    for (let i = 0; i < 8; i += 1) {
      await userEvent.tab({ shift: true });
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it('closes on Escape and returns the focus to the opener', async () => {
    const onClose = vi.fn();
    render(<Demo onClose={onClose} />);
    const opener = screen.getByText('Open it');
    await userEvent.click(opener);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('closes from the close button', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByText('Open it'));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
