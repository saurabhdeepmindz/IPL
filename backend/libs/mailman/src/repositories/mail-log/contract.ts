/**
 * @file    contract.ts
 * @module  MailmanModule
 *
 * @description
 * Mail log contract. In plain words: the interface for the record of every e-mail sent (no body is kept).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-03
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/mailman/src/repositories/mail-log/contract.ts
 * @lld-synced     v0.3
 * @status         built
 */

/**
 * MailLogRepository.
 *
 * In plain words: the record of each try to send an e-mail (who, which message, the result; never the text).
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-005
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-005-01, AC-US-LGN02-005-02, AC-US-LGN02-005-03, AC-US-LGN02-005-04
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.0
 */
export abstract class MailLogRepository {
  /** Adds one record. */
  abstract add(entry: { messageName: string; recipient: string; result: string; attempts: number }): Promise<void>;
}
