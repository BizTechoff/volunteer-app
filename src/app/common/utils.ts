import { BackendMethod, Remult } from "remult";

export class EmailSvc {
    static sendMail: (subject: string, message: string, email: string, remult: Remult) => Promise<boolean>;

    @BackendMethod({ allowed: true })
    static async SendEmail(to: string, text: string, remult?: Remult) {
        return await EmailSvc.sendMail("test email", text, to, remult!);
    }
}
