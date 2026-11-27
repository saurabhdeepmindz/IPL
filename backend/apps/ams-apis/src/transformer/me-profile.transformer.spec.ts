/**
 * @file    me-profile.transformer.spec.ts
 * @module  AmsApis
 *
 * @description
 * Jest cases of the profile transformer. In plain words: the body of API-ME-01 holds the employee code, the name, the companies with their roles, the financial years, the session context and the helpdesk values.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-001
 * @subtask        ST-LGN03-001-BE-01
 * @contract       API-ME-01
 * @lld            LLD-EPIC-LGN-03 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/apps/ams-apis/src/transformer/me-profile.transformer.spec.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { ProfileInput } from '@libs/core';
import { MeProfileTransformer } from './me-profile.transformer';

const input: ProfileInput = {
  user: { employeeCode: '10002', fullName: 'A. Kumar' },
  companies: [
    { code: 'IPL', name: 'Indian Potash Limited', roles: ['Initiator', 'Processor'] },
    { code: 'IPLFB', name: 'IPL second company', roles: ['Auditor'] },
  ],
  years: [
    { label: '2026-27', current: true },
    { label: '2025-26', current: false },
    { label: '2024-25', current: false },
  ],
  context: null,
  helpdesk: { phone: '+91 00000 00000', email: 'helpdesk@ipl.example', hours: 'Mon-Sat, 9:00-18:00', placeholder: true },
};

describe('MeProfileTransformer (US-LGN03-001)', () => {
  const transformer = new MeProfileTransformer();

  /** @story US-LGN03-001 @ac AC-US-LGN03-001-02 @subtask ST-LGN03-001-BE-01 In plain words: supporting test. The body carries the code and the name of the user and the companies with the role names. */
  it('builds the body of API-ME-01', () => {
    expect(transformer.toBody(input)).toEqual({
      employeeCode: '10002',
      name: 'A. Kumar',
      companies: input.companies,
      financialYears: input.years,
      context: null,
      helpdesk: input.helpdesk,
    });
  });

  /** @story US-LGN03-001 @ac AC-US-LGN03-001-04 @subtask ST-LGN03-001-BE-01 In plain words: supporting test. A user with no company gets an empty list, not a missing field. */
  it('keeps an empty company list and the helpdesk values', () => {
    const body = transformer.toBody({ ...input, companies: [] });
    expect(body.companies).toEqual([]);
    expect(body.helpdesk.phone).toBe('+91 00000 00000');
  });

  /** @story US-LGN03-001 @ac AC-US-LGN03-001-01 @subtask ST-LGN03-001-BE-01 In plain words: supporting test. The session context is passed on when the session has one. */
  it('passes the session context on', () => {
    const body = transformer.toBody({ ...input, context: { companyCode: 'IPL', financialYear: '2026-27' } });
    expect(body.context).toEqual({ companyCode: 'IPL', financialYear: '2026-27' });
  });

  /** @story US-LGN03-001 @ac AC-US-LGN03-001-01 @subtask ST-LGN03-001-BE-01 In plain words: supporting test. The body does not carry the internal user key or anything else the screen does not need. */
  it('has only the documented fields', () => {
    expect(Object.keys(transformer.toBody(input)).sort()).toEqual(['companies', 'context', 'employeeCode', 'financialYears', 'helpdesk', 'name']);
  });
});
