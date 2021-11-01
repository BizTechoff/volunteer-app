import { Remult } from "remult";

export class EmailSvc {
    static sendMail: (subject: string, message: string, email: string, remult: Remult) => Promise<boolean>;
}
