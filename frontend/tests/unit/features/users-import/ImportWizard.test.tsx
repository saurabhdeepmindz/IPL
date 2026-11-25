/**
 * @file    ImportWizard.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest tests of the four steps of the import wizard. Written before the code. The file reader, the two calls, the template builder and the lists are replaced; the mapping and the components are real.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-05
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/users-import/ImportWizard.test.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportWizard } from '@/features/users-import/components/ImportWizard';
import type * as ReadFile from '@/features/users-import/services/readUsersFile';
import { ImportFileError, readUsersFile } from '@/features/users-import/services/readUsersFile';
import { buildUsersTemplate } from '@/features/users-import/services/buildUsersTemplate';
import { checkAll, importAll } from '@/features/users-import/services/usersImport.service';
import { useImportReference } from '@/features/users-import/hooks/useImportReference';
import type { Column, RawRow, Reference } from '@/features/users-import/types/import.types';
import { ApiError } from '@/lib/errors';

vi.mock('@/features/users-import/hooks/useImportReference', () => ({ useImportReference: vi.fn() }));
vi.mock('@/features/users-import/services/readUsersFile', async (original) => ({ ...(await original<typeof ReadFile>()), readUsersFile: vi.fn() }));
vi.mock('@/features/users-import/services/buildUsersTemplate', () => ({ buildUsersTemplate: vi.fn() }));
vi.mock('@/features/users-import/services/usersImport.service', () => ({ checkAll: vi.fn(), importAll: vi.fn() }));

const reference: Reference = {
  departments: [{ id: 'd1', code: 'IT', name: 'Information Technology' }],
  designations: [{ id: 'g1', code: 'SM', name: 'Senior Manager' }],
  companies: [{ code: 'IPL', name: 'Indian Potash Limited' }],
  roles: [{ roleId: 'r1', name: 'Initiator' }],
};
const raw = (excelRow: number, over: Partial<Record<Column, string>> = {}): RawRow => ({
  excelRow,
  cells: { 'Employee code': `2000${excelRow}`, 'Full name': 'Anil Kumar', 'E-mail': `anil${excelRow}@example.invalid`, Mobile: '', 'Department code': 'IT', 'Designation code': 'SM', 'Reporting manager code': '10001', 'Sign-in type': 'LOCAL', 'Company code': 'IPL', 'Role names': 'Initiator', 'Valid from': '', 'Valid to': '', ...over },
});

const renderWizard = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
      <ImportWizard />
    </QueryClientProvider>,
  );
const file = () => new File(['x'], 'users.xlsx');
const toUpload = async () => userEvent.click(await screen.findByRole('button', { name: 'Next: upload file' }));
const upload = async () => userEvent.upload(await screen.findByLabelText('Filled template (.xlsx)'), file());

describe('US-ADM01-009 the import wizard (supporting tests)', () => {
  beforeEach(() => {
    vi.mocked(useImportReference).mockReset().mockReturnValue({ reference, isPending: false, forbidden: false, isError: false });
    vi.mocked(readUsersFile).mockReset();
    vi.mocked(buildUsersTemplate).mockReset().mockResolvedValue(new Blob(['t']));
    vi.mocked(checkAll).mockReset().mockResolvedValue([]);
    vi.mocked(importAll).mockReset();
    URL.createObjectURL = vi.fn(() => 'blob:template');
    URL.revokeObjectURL = vi.fn();
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-02
   * @subtask ST-ADM01-009-IN-05
   * In plain words: supporting test. Step 1 shows "Step 1 of 4" and downloads the template named AMS_Users_Template_v1.xlsx built from the lists; Next goes to step 2.
   */
  it('step 1 downloads the template', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    renderWizard();
    expect(await screen.findByText('Step 1 of 4')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Download template' }));
    await waitFor(() => expect(buildUsersTemplate).toHaveBeenCalledWith(reference));
    await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    expect(URL.createObjectURL).toHaveBeenCalled();
    await toUpload();
    expect(await screen.findByText('Step 2 of 4')).toBeInTheDocument();
    click.mockRestore();
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-03
   * @subtask ST-ADM01-009-IN-05
   * In plain words: supporting test. After a file is chosen, step 3 says how many rows were read and passed and lists each problem with Row, Column, Value in file and Problem (from the mapping and from the server); the error report can be downloaded.
   */
  it('step 3 lists the problems', async () => {
    vi.mocked(readUsersFile).mockResolvedValue([raw(2), raw(3), raw(4, { 'Department code': 'XX' })]);
    vi.mocked(checkAll).mockResolvedValue([{ excelRow: 3, column: 'E-mail', value: 'anil3@example.invalid', message: 'The e-mail is already used' }]);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    renderWizard();
    await toUpload();
    await upload();
    expect(await screen.findByText('Step 3 of 4')).toBeInTheDocument();
    expect(screen.getByTestId('check-summary')).toHaveTextContent('3 rows read. 1 can be imported. 2 have problems.');
    const table = screen.getByRole('table', { name: 'Rows with problems' });
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Row', 'Column', 'Value in file', 'Problem']);
    const lines = within(table).getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell').map((c) => c.textContent));
    expect(lines).toEqual([['3', 'E-mail', 'anil3@example.invalid', 'The e-mail is already used'], ['4', 'Department code', 'XX', 'No department with code XX']]);
    expect(checkAll).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ excelRow: 2 }), expect.objectContaining({ excelRow: 3 })]), expect.any(Function));
    await userEvent.click(screen.getByRole('button', { name: 'Download error report' }));
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  it('step 3 turns Import off when no row passed', async () => {
    vi.mocked(readUsersFile).mockResolvedValue([raw(2, { 'Department code': 'XX' })]);
    renderWizard();
    await toUpload();
    await upload();
    expect(await screen.findByTestId('check-summary')).toHaveTextContent('0 can be imported');
    expect(screen.getByRole('button', { name: 'Import the rows that passed' })).toBeDisabled();
  });

  it('step 2 shows why a file was refused and stays on step 2', async () => {
    vi.mocked(readUsersFile).mockRejectedValue(new ImportFileError('The file has no rows to import.'));
    renderWizard();
    await toUpload();
    await upload();
    expect(await screen.findByRole('alert')).toHaveTextContent('The file has no rows to import.');
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    expect(checkAll).not.toHaveBeenCalled();
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-02
   * @subtask ST-ADM01-009-IN-05
   * In plain words: supporting test. Step 4 shows "Importing… n of N rows" and then "Import finished" with the created and failed counts, Open Users and Start another import; only the rows that passed are sent.
   */
  it('step 4 shows the progress and then the counts', async () => {
    vi.mocked(readUsersFile).mockResolvedValue([raw(2), raw(3), raw(4)]);
    vi.mocked(checkAll).mockResolvedValue([{ excelRow: 3, column: 'E-mail', value: 'x', message: 'The e-mail is already used' }]);
    let finish: (v: { created: number; problems: [] }) => void = () => undefined;
    vi.mocked(importAll).mockImplementation((_rows, onProgress) => {
      onProgress?.(1);
      return new Promise((resolve) => (finish = resolve));
    });
    renderWizard();
    await toUpload();
    await upload();
    await userEvent.click(await screen.findByRole('button', { name: 'Import the rows that passed' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Importing… 1 of 2 rows');
    expect(vi.mocked(importAll).mock.calls[0][0].map((r) => r.excelRow)).toEqual([2, 4]);
    finish({ created: 2, problems: [] });
    expect(await screen.findByTestId('import-result')).toHaveTextContent('Import finished: 2 created, 1 failed.');
    expect(screen.getByRole('link', { name: 'Open Users' })).toHaveAttribute('href', '/users');
    await userEvent.click(screen.getByRole('button', { name: 'Start another import' }));
    expect(await screen.findByText('Step 1 of 4')).toBeInTheDocument();
  });

  /**
   * @story   US-ADM01-009
   * @ac      AC-US009-04
   * @subtask ST-ADM01-009-IN-05
   * In plain words: supporting test. A 403 on any list, or on a call, shows "You do not have access to Import users." and nothing else.
   */
  it('shows the no-access message on a 403', async () => {
    vi.mocked(useImportReference).mockReturnValue({ reference: null, isPending: false, forbidden: true, isError: true });
    renderWizard();
    expect(await screen.findByRole('alert')).toHaveTextContent('You do not have access to Import users.');
    expect(screen.queryByText('Step 1 of 4')).not.toBeInTheDocument();
  });

  it('shows the no-access message when the check answers 403', async () => {
    vi.mocked(readUsersFile).mockResolvedValue([raw(2)]);
    vi.mocked(checkAll).mockRejectedValue(new ApiError(403, 'FORBIDDEN', 'No'));
    renderWizard();
    await toUpload();
    await upload();
    expect(await screen.findByTestId('no-access')).toHaveTextContent('You do not have access to Import users.');
  });
});
