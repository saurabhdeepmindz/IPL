/**
 * @file    RoleDashboardPlaceholder.tsx
 * @module  Auth
 *
 * @description
 * The placeholder of a dashboard that is not built yet. In plain words: a simple page, shown inside the main frame with the main menu, that names the dashboard and says it is not built yet. No error is shown.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-005
 * @subtask        ST-LGN03-005-FE-02
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/features/auth/components/RoleDashboardPlaceholder.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { dashboardName } from '../landing.map';

/**
 * RoleDashboardPlaceholder.
 *
 * In plain words: names the dashboard of the landing route and says it is not built yet; the frame around it brings the main menu.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-005
 * @subtask   ST-LGN03-005-FE-02
 * @workflow  UF-03
 * @ac        AC-US-LGN03-005-06
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @param props.route The landing route, for example /landing/finance
 */
export function RoleDashboardPlaceholder(props: { route: string }) {
  const name = dashboardName(props.route);
  return (
    <section data-testid="landing-placeholder">
      <div className={hf('page-head')}>
        <div>
          <h1>{name}</h1>
          <p>This dashboard is part of a later release.</p>
        </div>
      </div>
      <div className={hf('card')}>
        <div className={hf('empty')}>
          <span className={hf('art')}>
            <HfIcon name="clock" size="lg" />
          </span>
          <b>Coming soon</b>
          <p>The {name} is not built yet. It will open here when its module is released. Until then, use the main menu.</p>
        </div>
      </div>
    </section>
  );
}
