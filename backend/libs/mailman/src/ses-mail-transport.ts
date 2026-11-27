/**
 * @file    ses-mail-transport.ts
 * @module  MailmanModule
 *
 * @description
 * Amazon SES transport. In plain words: sends through Amazon SES once the sender and region are given.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-005
 * @subtask        ST-LGN02-005-BE-03
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/mailman/src/ses-mail-transport.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { MailTransport } from './mail-transport';
import { PreparedMail } from './mail.types';

/**
 * SesMailTransport.
 *
 * In plain words: sends through Amazon SES in the IPL AWS account (region from AWS_SES_REGION; the credentials come from the task role, never from a file).
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-005
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-005-01, AC-US-LGN02-005-02, AC-US-LGN02-005-03, AC-US-LGN02-005-04
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
@Injectable()
export class SesMailTransport extends MailTransport {
  private readonly client: SESv2Client;

  constructor(region: string, private readonly from: string) {
    super();
    this.client = new SESv2Client({ region });
  }

  async send(message: PreparedMail): Promise<void> {
    await this.client.send(
      new SendEmailCommand({
        FromEmailAddress: this.from,
        Destination: { ToAddresses: [message.to] },
        Content: { Simple: { Subject: { Data: message.subject }, Body: { Text: { Data: message.text }, Html: { Data: message.html } } } },
      }),
    );
  }
}
