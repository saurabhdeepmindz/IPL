/**
 * @file    TopBar.tsx
 * @module  Ui
 *
 * @description
 * The top bar. In plain words: company, financial year and the signed-in user. The financial-year picker, the bell and the workspace switch are inert placeholders (decision L-63).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/components/layout/TopBar.tsx
 * @lld-synced     v0.30
 * @status         built
 */
import { useSessionStore } from '@/store/session.store';

/**
 * Top bar. In plain words: the company and the signed-in user from the session; the financial year, the notification bell and the workspace are inert placeholders (decision L-63).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-04
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-ADM-01 v0.30 §6.5
 * @status    built
 *
 * @dependencies useSessionStore
 *
 * @returns The rendered top bar
 */
export function TopBar() {
  const user = useSessionStore((s) => s.user);
  return (
    <header className="d-flex justify-content-end align-items-center gap-3 border-bottom bg-white px-3 py-2" data-testid="layout-topbar">
      <button type="button" className="btn btn-link" disabled aria-label="Notifications (coming later)">
        Notifications
      </button>
      <div>
        <span className="small text-body-secondary d-block">Company</span>
        <strong data-testid="layout-company">{user?.companyCode ?? '-'}</strong>
      </div>
      <div>
        <span className="small text-body-secondary d-block">Financial year</span>
        <span>FY 2026-27</span>
      </div>
      <div>
        <span className="small text-body-secondary d-block">Signed in as</span>
        <strong data-testid="layout-user">{user?.employeeCode ?? '-'}</strong>
      </div>
    </header>
  );
}
