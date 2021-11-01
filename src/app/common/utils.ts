import { Remult } from "remult";

export class EmailSvc {

    constructor() { }
    static sendMail: (subject: string, message: string, email: string, remult: Remult) => Promise<boolean>;
}
