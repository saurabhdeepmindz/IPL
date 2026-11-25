'use client';

/**
 * @file    ImportWizard.tsx
 * @module  UsersImport
 *
 * @description
 * The wizard. In plain words: the four steps with the step line "Step n of 4"; holds the file, the problems and the result; shows NoAccess when a list or a call answers 403.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-05
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/components/ImportWizard.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import { useState } from 'react';
import { NoAccess } from '@/components/ams';
import { Button } from '@/components/ui';
import { ApiError } from '@/lib/errors';
import { useImportReference } from '../hooks/useImportReference';
import { useCheckRows, useImportRows } from '../hooks/useImportRows';
import { buildUsersTemplate } from '../services/buildUsersTemplate';
import { errorReportCsv } from '../services/errorReportCsv';
import { mapUsersRows } from '../services/mapUsersRows';
import { ImportFileError, readUsersFile } from '../services/readUsersFile';
import { saveFile } from '../services/saveFile';
import type { MappedFile, Problem } from '../types/import.types';
import { ImportStepCheck } from './ImportStepCheck';
import { ImportStepImport } from './ImportStepImport';
import { ImportStepTemplate } from './ImportStepTemplate';
import { ImportStepUpload } from './ImportStepUpload';

const STEPS = ['Choose and download template', 'Upload file', 'Check', 'Import'];
const today = (): string => new Date().toLocaleDateString('en-CA');
const forbidden = (e: unknown): boolean => e instanceof ApiError && e.status === 403;

/**
 * The wizard.
 *
 * In plain words: the four steps with the step line "Step n of 4"; holds the file, the problems and the result; shows NoAccess when a list or a call answers 403.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-05
 * @ac       AC-US009-02, AC-US009-03
 * @dependencies useImportReference, useCheckRows, useImportRows, readUsersFile, mapUsersRows, buildUsersTemplate
 */
export function ImportWizard() {
  const { reference, isPending, forbidden: listsDenied, isError } = useImportReference();
  const check = useCheckRows();
  const importing = useImportRows();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [mapped, setMapped] = useState<MappedFile | null>(null);
  const [serverProblems, setServerProblems] = useState<Problem[]>([]);
  const [importProblems, setImportProblems] = useState<Problem[]>([]);
  const [result, setResult] = useState<{ created: number; failed: number } | null>(null);

  if (denied || listsDenied) return <NoAccess screen="Import users" />;
  if (isPending) return <p role="status">Loading the lists…</p>;
  if (isError || !reference) return <p role="alert">The lists for the template could not be loaded. Try again later.</p>;

  const failedRows = new Set(serverProblems.map((p) => p.excelRow));
  const passed = (mapped?.rows ?? []).filter((r) => !failedRows.has(r.excelRow));
  const problems = [...(mapped?.problems ?? []), ...serverProblems].sort((a, b) => a.excelRow - b.excelRow);
  const fail = (e: unknown, fallback: string) => (forbidden(e) ? setDenied(true) : setMessage(e instanceof ImportFileError ? e.message : fallback));
  const reset = () => {
    setStep(1);
    setMessage(null);
    setFileName(null);
    setMapped(null);
    setServerProblems([]);
    setImportProblems([]);
    setResult(null);
  };

  const downloadTemplate = async () => {
    setBusy(true);
    setMessage(null);
    await buildUsersTemplate(reference).then((blob) => saveFile(blob, 'AMS_Users_Template_v1.xlsx'), () => setMessage('The template could not be made. Try again.'));
    setBusy(false);
  };

  const readFile = async (file: File) => {
    setBusy(true);
    setMessage(null);
    setFileName(file.name);
    try {
      const parsed = mapUsersRows(await readUsersFile(file), reference, today());
      setServerProblems(parsed.rows.length > 0 ? await check.run(parsed.rows) : []);
      setMapped(parsed);
      setStep(3);
    } catch (e) {
      setFileName(null);
      fail(e, 'The file could not be checked. Try again.');
    }
    setBusy(false);
  };

  const runImport = async () => {
    setStep(4);
    setResult(null);
    setImportProblems([]);
    try {
      const out = await importing.run(passed);
      setImportProblems(out.problems);
      setResult({ created: out.created, failed: (mapped?.total ?? 0) - out.created });
    } catch (e) {
      fail(e, 'The import stopped. Users already saved stay saved; check the user list before you try again.');
    }
  };

  const downloadReport = (list: Problem[]) => saveFile(new Blob(['\uFEFF', errorReportCsv(list)], { type: 'text/csv;charset=utf-8' }), 'AMS_Users_Import_Errors.csv');

  return (
    <div data-testid="import-wizard">
      <p className="text-body-secondary mb-1">{`Step ${step} of 4`}</p>
      <ol className="list-inline small">
        {STEPS.map((label, i) => (
          <li key={label} className="list-inline-item" aria-current={step === i + 1 ? 'step' : undefined}>{label}</li>
        ))}
      </ol>
      {step === 1 && <ImportStepTemplate busy={busy} error={message} onDownload={downloadTemplate} onNext={() => setStep(2)} />}
      {step === 2 && <ImportStepUpload fileName={fileName} error={message} busy={busy} onFile={readFile} onRemove={() => setFileName(null)} />}
      {step === 3 && mapped && <ImportStepCheck total={mapped.total} passed={passed.length} problems={problems} onImport={runImport} onBack={() => setStep(2)} onDownload={() => downloadReport(problems)} />}
      {step === 4 && !message && <ImportStepImport done={importing.progress} total={passed.length} result={result} problems={importProblems} onDownload={() => downloadReport([...problems, ...importProblems])} onAgain={reset} />}
      {step === 4 && message && (
        <>
          <p role="alert">{message}</p>
          <Button onClick={reset}>Start over</Button>
        </>
      )}
    </div>
  );
}
