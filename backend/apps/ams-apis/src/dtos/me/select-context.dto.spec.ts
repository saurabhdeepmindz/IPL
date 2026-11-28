/**
 * @file    select-context.dto.spec.ts
 * @module  AmsApis
 *
 * @description
 * Jest cases of the request shape of API-ME-02. In plain words: the body is a company code and a financial year such as 2026-27; anything else is refused with a list of what is wrong, and unknown fields are dropped.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-002
 * @subtask        ST-LGN03-002-BE-01
 * @contract       API-ME-02
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/apps/ams-apis/src/dtos/me/select-context.dto.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import 'reflect-metadata';
import { AllFieldsValidationPipe } from '@libs/common';
import { SelectContextDto } from './select-context.dto';

const pipe = new AllFieldsValidationPipe();
const run = (body: unknown) => pipe.transform(body, { type: 'body', metatype: SelectContextDto });
type Refused = { getStatus(): number; code: string; fields: { field: string }[] };
const refused = (body: unknown) => run(body).catch((x) => x as Refused) as Promise<Refused>;

describe('SelectContextDto (US-LGN03-002)', () => {
  /** @story US-LGN03-002 @ac AC-US-LGN03-002-01 @subtask ST-LGN03-002-BE-01 In plain words: supporting test. A company code and a year such as 2026-27 are accepted. */
  it('accepts a company code and a financial year', async () => {
    await expect(run({ companyCode: 'IPL', financialYear: '2026-27' })).resolves.toMatchObject({ companyCode: 'IPL', financialYear: '2026-27' });
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-01 @subtask ST-LGN03-002-BE-01 In plain words: supporting test. A missing or badly shaped field gives 422 naming the field. */
  it('refuses a missing or badly shaped field with 422', async () => {
    for (const body of [{}, { companyCode: 'IPL' }, { financialYear: '2026-27' }, { companyCode: 'IPL', financialYear: '2026' }, { companyCode: 'IPL', financialYear: '26-27' }, { companyCode: 'IPL', financialYear: '2026-2027' }]) {
      const e = await refused(body);
      expect(e.getStatus()).toBe(422);
      expect(e.code).toBe('VALIDATION_FAILED');
    }
    const e = await refused({ companyCode: 'IPL', financialYear: '2026' });
    expect(e.fields.map((f) => f.field)).toEqual(['financialYear']);
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-01 @subtask ST-LGN03-002-BE-01 In plain words: supporting test. A company code that is empty, not text, or longer than the 10 characters of the company table is refused. */
  it('refuses an empty, non-text or too long company code', async () => {
    for (const companyCode of ['', 42, 'ABCDEFGHIJK']) {
      const e = await refused({ companyCode, financialYear: '2026-27' });
      expect(e.getStatus()).toBe(422);
    }
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-01 @subtask ST-LGN03-002-BE-01 In plain words: supporting test. Fields that are not part of the body are dropped. */
  it('drops fields that are not part of the body', async () => {
    const result = (await run({ companyCode: 'IPL', financialYear: '2026-27', role: 'ADMINISTRATOR' })) as Record<string, unknown>;
    expect(result.role).toBeUndefined();
  });
});
