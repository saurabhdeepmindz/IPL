/**
 * @file    Modal.stories.tsx
 * @module  Storybook
 *
 * @description
 * Storybook examples. In plain words: shows the component in each state, and checks the keyboard use in a play function.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-03
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { expect, userEvent, within } from 'storybook/test';

const meta = { title: 'Components/Modal', component: Modal, parameters: { layout: 'padded' } } satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ size }: { size?: 'sm' | 'md' | 'lg' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Deactivate user"
        size={size}
        footer={
          <>
            <Button variant="secondary" outline onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger">Deactivate</Button>
          </>
        }
      >
        <Input label="Reason" hint="Required for the audit log" />
      </Modal>
    </>
  );
}

export const Default: Story = {
  args: { open: false, onClose: () => undefined, title: 'Deactivate user', children: null },
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const opener = within(canvasElement).getByRole('button', { name: 'Open dialog' });
    await userEvent.click(opener);
    const dialog = within(document.body).getByRole('dialog', { name: 'Deactivate user' });
    await expect(dialog).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(opener).toHaveFocus();
  },
};
export const Large: Story = { args: { open: false, onClose: () => undefined, title: 'Large', children: null }, render: () => <Demo size="lg" /> };
