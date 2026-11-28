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
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/components/ImportWizard.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import { useState } from 'react';
import { NoAccess } from '@/components/ams';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { HfModal } from '@/hf/HfModal';
import { ApiError } from '@/lib/errors';
import { useImportReference } from '../../hooks/useImportReference';
import { useCheckRows, useImportRows } from '../../hooks/useImportRows';
import { buildUsersTemplate } from '../../services/buildUsersTemplate';
import { errorReportCsv } from '../../services/errorReportCsv';
import { mapUsersRows } from '../../services/mapUsersRows';
import { ImportFileError, readUsersFile } from '../../services/readUsersFile';
import { saveFile } from '../../services/saveFile';
import type { MappedFile, Problem } from '../../types/import.types';
import { ImportStepCheck } from '../ImportStepCheck';
import { ImportStepImport } from '../ImportStepImport';
import { ImportStepTemplate } from '../ImportStepTemplate';
import { ImportStepUpload } from '../ImportStepUpload';

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
  const router = useRouter();
  const { reference, isPending, forbidden: listsDenied, isError } = useImportReference();
  const check = useCheckRows();
  const importing = useImportRows();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [confirming, setConfirming] = useState(false);
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
    setFile(null);
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

  const readFile = async (picked: File) => {
    setBusy(true);
    setMessage(null);
    try {
      const parsed = mapUsersRows(await readUsersFile(picked), reference, today());
      setServerProblems(parsed.rows.length > 0 ? await check.run(parsed.rows) : []);
      setMapped(parsed);
      setStep(3);
    } catch (e) {
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

  const confirmAndImport = () => {
    setConfirming(false);
    void runImport();
  };

  const nextLabel = step === 1 ? 'Next: upload file' : step === 2 ? 'Check file' : `Import ${passed.length} good ${passed.length === 1 ? 'row' : 'rows'}`;
  const nextDisabled = busy || (step === 2 && !file) || (step === 3 && passed.length === 0);
  const next = () => {
    if (step === 1) setStep(2);
    else if (step === 2 && file) void readFile(file);
    else if (step === 3) setConfirming(true);
  };

  return (
    <div data-testid="import-wizard">
      <div className={hf('page-head')}>
        <div>
          <h1>Excel Import</h1>
          <p>Load or update master data from Excel. Nothing changes until the file has been checked and you confirm the import.</p>
        </div>
        <div className={hf('page-actions')}>
          <Link className={hf('btn btn-outline')} href="/coming-soon?feature=Master%20Data">
            <HfIcon name="database" />
            Go to Master Data
          </Link>
        </div>
      </div>
      <div className={hf('tabs card')} role="tablist" aria-label="Excel import" style={{ marginBottom: 'var(--spacing-xl)', border: '1px solid var(--stroke-100)', borderRadius: 'var(--radius-md)', background: 'var(--neutral-0-white)' }}>
        <button type="button" role="tab" aria-selected="true">
          New import
        </button>
        <button type="button" role="tab" aria-selected="false" onClick={() => router.push('/coming-soon?feature=Import%20history')}>
          Import history
        </button>
      </div>
      <section className={hf('card')}>
        <div className={hf('card-head')}>
          <ol className={hf('steps')} style={{ margin: 0, padding: 0, flexWrap: 'wrap', gap: 'var(--spacing-xl)' }}>
            {STEPS.map((label, i) => (
              <li key={label} className={hf(step === i + 1 && 'cur', step > i + 1 && 'done')} aria-current={step === i + 1 ? 'step' : undefined}>
                {label}
              </li>
            ))}
          </ol>
          <span className={hf('muted')} style={{ fontSize: 'var(--fs-2)' }}>{`Step ${step} of 4`}</span>
        </div>
        <div className={hf('card-body')}>
          {step === 1 && <ImportStepTemplate busy={busy} error={message} onDownload={downloadTemplate} />}
          {step === 2 && <ImportStepUpload file={file} error={message} busy={busy} onFile={(f) => { setMessage(null); setFile(f); }} onRemove={() => setFile(null)} />}
          {step === 3 && mapped && <ImportStepCheck total={mapped.total} passed={passed.length} problems={problems} onDownload={() => downloadReport(problems)} />}
          {step === 4 && !message && <ImportStepImport done={importing.progress} total={passed.length} result={result} problems={importProblems} onDownload={() => downloadReport([...problems, ...importProblems])} onAgain={reset} />}
          {step === 4 && message && (
            <>
              <p role="alert">{message}</p>
              <button type="button" className={hf('btn btn-primary')} onClick={reset}>
                Start over
              </button>
            </>
          )}
        </div>
        {step < 4 && (
          <div className={hf('modal-foot')} style={{ justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              {step > 1 && (
                <button type="button" className={hf('btn btn-outline')} onClick={() => setStep(step - 1)} disabled={busy}>
                  Back
                </button>
              )}
              <button type="button" className={hf('btn btn-primary')} onClick={next} disabled={nextDisabled}>
                {nextLabel}
              </button>
            </div>
          </div>
        )}
      </section>
      <HfModal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`Import ${passed.length} ${passed.length === 1 ? 'row' : 'rows'}?`}
        footer={
          <>
            <button type="button" className={hf('btn btn-outline')} onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button type="button" className={hf('btn btn-primary')} onClick={confirmAndImport} data-testid="import-confirm">
              Import
            </button>
          </>
        }
      >
        <p style={{ margin: 0 }}>
          {`${passed.length} ${passed.length === 1 ? 'user' : 'users'} will be added in `}
          <b>Users</b>
          {`. The ${new Set(problems.map((p) => p.excelRow)).size} rows with problems are left out. This cannot be undone in one step; each change is in the audit trail.`}
        </p>
      </HfModal>
    </div>
  );
}
