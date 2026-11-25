/**
 * @file    Breadcrumbs.tsx
 * @module  Ui
 *
 * @description
 * The breadcrumb. In plain words: the path above the screen title.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/components/layout/Breadcrumbs.tsx
 * @lld-synced     v0.30
 * @status         built
 */
import Link from 'next/link';

/** One step of the path. */
interface Crumb {
  /** Text of the step */
  label: string;
  /** Where the step leads; empty for the current screen */
  href?: string;
}

/** Props of Breadcrumbs. */
interface BreadcrumbsProps {
  /** The path; the last item is the current screen and is not a link */
  items: Crumb[];
}

/**
 * Breadcrumb. In plain words: a nav with an ordered list; the last item marks the current screen.
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
 * @returns The rendered breadcrumb
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" data-testid="layout-breadcrumbs">
      <ol className="breadcrumb mb-2">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className={last ? 'breadcrumb-item active' : 'breadcrumb-item'}>
              {item.href && !last ? <Link href={item.href}>{item.label}</Link> : <span aria-current={last ? 'page' : undefined}>{item.label}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
