import { DatePipe } from "@angular/common";
import { BackendMethod, Remult } from "remult";
import { CalendarRequest } from "./types";
 
export class EmailSvc {
    static sendMail: (email: string, subject: string, message: string, link: string, remult: Remult) => Promise<boolean>;
    static sendMail2: (req: CalendarRequest) => Promise<boolean>;
 
    @BackendMethod({ allowed: true })
    static async SendEmail(to: string, subject: string, text: string, link: string, remult?: Remult) {
        return await EmailSvc.sendMail(to, subject, text, link, remult!);
    } 
    @BackendMethod({ allowed: true })
    static async SendEmail2(req: CalendarRequest) {
        return await EmailSvc.sendMail2(req);
    } 
}
export class DateUtils {

    static pipe: DatePipe = new DatePipe('en-US');

    static toDateString(d: Date) {
        return DateUtils.pipe.transform(d, 'dd.MM.yyyy')!;
    }
}
