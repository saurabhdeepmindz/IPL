/**
 * @file    landing.resolver.spec.ts
 * @module  AuthCoreModule
 *
 * @description
 * Jest cases of the landing resolver. In plain words: the landing page is the first role of the configured order that the user has; an initiator who is also a processor lands in the Inbox; a user with only custom roles gets the neutral placeholder.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-002
 * @subtask        ST-LGN03-002-BE-02
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/libs/core/src/auth/landing.resolver.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { LandingResolver } from './landing.resolver';

const ORDER = ['ADMINISTRATOR', 'FINANCE', 'INITIATOR', 'PROCESSOR', 'AUDITOR', 'REPORT_VIEWER'];

describe('LandingResolver (US-LGN03-002)', () => {
  const resolver = new LandingResolver();

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-04 @subtask ST-LGN03-002-BE-02 In plain words: supporting test. One role gives the route of that role. */
  it('gives the route of the only role', () => {
    expect(resolver.resolve(['FINANCE'], ORDER)).toEqual({ role: 'FINANCE', route: '/landing/finance' });
    expect(resolver.resolve(['ADMINISTRATOR'], ORDER)).toEqual({ role: 'ADMINISTRATOR', route: '/dashboard' });
    expect(resolver.resolve(['REPORT_VIEWER'], ORDER)).toEqual({ role: 'REPORT_VIEWER', route: '/landing/reports' });
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-05 @subtask ST-LGN03-002-BE-02 In plain words: supporting test. The first role of the order wins, whatever order the roles come in. */
  it('picks the first role of the order', () => {
    expect(resolver.resolve(['AUDITOR', 'FINANCE', 'INITIATOR'], ORDER).role).toBe('FINANCE');
    expect(resolver.resolve(['REPORT_VIEWER', 'AUDITOR'], ORDER).role).toBe('AUDITOR');
    expect(resolver.resolve(['PROCESSOR', 'ADMINISTRATOR'], ORDER).role).toBe('ADMINISTRATOR');
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-06 @subtask ST-LGN03-002-BE-02 In plain words: supporting test. An initiator only gets the Initiator Dashboard; an initiator who is also a processor gets the Inbox. */
  it('sends an initiator who is also a processor to the Inbox', () => {
    expect(resolver.resolve(['INITIATOR'], ORDER)).toEqual({ role: 'INITIATOR', route: '/landing/initiator' });
    expect(resolver.resolve(['INITIATOR', 'PROCESSOR'], ORDER)).toEqual({ role: 'PROCESSOR', route: '/landing/inbox' });
    expect(resolver.resolve(['PROCESSOR', 'INITIATOR', 'AUDITOR'], ORDER).route).toBe('/landing/inbox');
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-05 @subtask ST-LGN03-002-BE-02 In plain words: supporting test. A changed order changes the answer, and a Finance user is not sent to the Inbox by the initiator rule. */
  it('follows a changed order', () => {
    expect(resolver.resolve(['ADMINISTRATOR', 'FINANCE'], ['FINANCE', 'ADMINISTRATOR']).role).toBe('FINANCE');
    expect(resolver.resolve(['FINANCE', 'PROCESSOR'], ORDER).role).toBe('FINANCE');
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-04 @subtask ST-LGN03-002-BE-02 In plain words: supporting test. A user who holds only custom roles still gets a page: the neutral placeholder. */
  it('gives the neutral placeholder to custom roles only', () => {
    expect(resolver.resolve(['MY_CUSTOM_ROLE'], ORDER)).toEqual({ role: 'MY_CUSTOM_ROLE', route: '/landing/home' });
  });
});
