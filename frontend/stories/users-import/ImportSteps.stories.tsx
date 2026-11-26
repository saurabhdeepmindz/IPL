/**
 * @file    ImportSteps.stories.tsx
 * @module  Stories
 *
 * @description
 * Stories of the four steps of the import wizard and the problems table; the accessibility add-on must pass. One story per state.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-05
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/stories/users-import/ImportSteps.stories.tsx
 * @lld-synced     v0.30
 * @status         built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from 'storybook/test';
import { ImportStepCheck } from '@/features/users-import/components/ImportStepCheck';
import { ImportStepImport } from '@/features/users-import/components/ImportStepImport';
import { ImportStepTemplate } from '@/features/users-import/components/ImportStepTemplate';
import { ImportStepUpload } from '@/features/users-import/components/ImportStepUpload';
import type { Problem } from '@/features/users-import/types/import.types';

const meta = { title: 'UsersImport/ImportSteps', parameters: { layout: 'padded', nextjs: { appDirectory: true } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const problems: Problem[] = [
  { excelRow: 3, column: 'E-mail', value: 'anil3@example.invalid', message: 'The e-mail is already used' },
  { excelRow: 7, column: 'Department code', value: 'FIN-ACCT', message: 'No department with code FIN-ACCT' },
];

export const Template: Story = {
  render: () => <ImportStepTemplate busy={false} error={null} onDownload={fn()} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Download template' })).toBeEnabled();
  },
};

export const UploadEmpty: Story = { render: () => <ImportStepUpload file={null} error={null} busy={false} onFile={fn()} onRemove={fn()} /> };
export const UploadWithFile: Story = { render: () => <ImportStepUpload file={new File(['x'], 'users.xlsx')} error={null} busy onFile={fn()} onRemove={fn()} /> };
export const UploadRefused: Story = {
  render: () => <ImportStepUpload file={null} error="The file has no column: E-mail. Use the template." busy={false} onFile={fn()} onRemove={fn()} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('no column: E-mail');
  },
};

export const CheckWithProblems: Story = {
  render: () => <ImportStepCheck total={52} passed={50} problems={problems} onDownload={fn()} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId('check-summary')).toHaveTextContent('52 rows read. 50 can be imported. 2 have problems.');
    await expect(within(canvasElement).getByRole('table', { name: 'Rows with problems' })).toBeInTheDocument();
  },
};
export const CheckNonePassed: Story = {
  render: () => <ImportStepCheck total={2} passed={0} problems={problems} onDownload={fn()} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Ready to import')).toBeInTheDocument();
  },
};
export const CheckNoProblems: Story = { render: () => <ImportStepCheck total={52} passed={52} problems={[]} onDownload={fn()} /> };

export const ImportRunning: Story = {
  render: () => <ImportStepImport done={400} total={5000} result={null} problems={[]} onDownload={fn()} onAgain={fn()} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Importing… 400 of 5000 rows');
  },
};
export const ImportFinished: Story = {
  render: () => <ImportStepImport done={52} total={52} result={{ created: 50, failed: 2 }} problems={problems} onDownload={fn()} onAgain={fn()} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId('import-result')).toHaveTextContent('Import finished: 50 created, 2 failed.');
  },
};
