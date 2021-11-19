import { DatePipe } from "@angular/common";
import { BackendMethod, Remult } from "remult";

export class EmailSvc {
    static sendMail: (email: string, subject: string, message: string, link: string, remult: Remult) => Promise<boolean>;

    @BackendMethod({ allowed: true })
    static async SendEmail(to: string, subject: string, text: string, link: string, remult?: Remult) {
        return await EmailSvc.sendMail(to, subject, text, link, remult!);
    } 
}
export class DateUtils {

    static pipe: DatePipe = new DatePipe('en-US');

    static toDateString(d: Date) {
        return DateUtils.pipe.transform(d, 'dd.MM.yyyy')!;
    }
}
