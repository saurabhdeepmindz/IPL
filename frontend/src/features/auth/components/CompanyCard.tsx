/**
 * @file    CompanyCard.tsx
 * @module  Auth
 *
 * @description
 * The roles box of the chosen company. In plain words: an information box under the company list that says "Your roles in <company>" and lists the role names. The design (HF-LGN-09) uses a drop-down for the company and one box for the roles, so this component, planned as a card per company, shows the box (decision UX-LGN-14, suggested).
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-003
 * @subtask        ST-LGN03-003-FE-02
 * @screen         LGN-09
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/features/auth/components/CompanyCard.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import { hf } from '../hf/hf';
import { Icon } from '../hf/Icon';
import type { MeCompany } from '../types/me.types';

/**
 * CompanyCard.
 *
 * In plain words: shows the roles the user holds in the chosen company. The page keeps the empty holder `#roles` around it, as the design does, so the space is the same with and without the box.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-003
 * @subtask   ST-LGN03-003-FE-02
 * @workflow  UF-03
 * @screen    LGN-09
 * @ac        AC-US-LGN03-003-01
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @param company The chosen company with the names of the user's roles in it
 */
export function CompanyCard({ company }: { company: MeCompany }) {
  return (
    <div className={hf('alert info')} style={{ margin: 0 }} data-testid="choose-roles">
      <Icon name="key" size="sm" />
      <div>
        <b>Your roles in {company.name}</b>
        {company.roles.join(', ')}
      </div>
    </div>
  );
}
