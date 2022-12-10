import { Data } from "../data/data";

export type EmailProps = {
  emails: Array<string>;
};

export class EmailNotificationService {
  public kind = "email" as const;

  public async notify(data: Data, { emails }: EmailProps) {
    for (const email of emails) {
      console.log(`Sending email to ${email}... `);
      await new Promise((r) => setTimeout(r, 200));
      console.log("Done!");
    }
  }
}
