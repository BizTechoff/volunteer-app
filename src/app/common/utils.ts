import { DatePipe } from "@angular/common";
import { BackendMethod, Remult } from "remult";
import { Activity } from "../core/activity/activity";
import { terms } from "../terms";
import { Users } from "../users/users";
import { AttendeeRequest, CalendarRequest, IcsRequest, SmsRequest } from "./types";

export class NotificationService {
    static sendCalendar: (sender: string, req: IcsRequest) => Promise<boolean>;
    // static sendCalendar: (req: CalendarRequest) => Promise<boolean>;
    static sendMail: (req: CalendarRequest) => Promise<boolean>;

    static sendSms: (req: SmsRequest) => Promise<{ success: boolean, message: string, count: number }>;

    @BackendMethod({ allowed: true /*(r, e) => r.authenticated()*/ })
    static async SendEmail(req: CalendarRequest) {
        return await NotificationService.sendMail(req);
    }

    @BackendMethod({ allowed: true })
    static async SendSms(req: SmsRequest) {
        return await NotificationService.sendSms(req);
    }

    @BackendMethod({ allowed: true })
    static async SendCalendar(aid: string, remult?: Remult) {
        // console.log('from cancel - toCalendar 2')
        let a = await remult!.repo(Activity).findId(aid);
        if (!a) {
            console.debug(`SendCalendar.aid(${aid}) NOT found`);
            return false;
        }
        let vidsNames = '';
        if (a.vids.length > 1) {
            vidsNames = `לכם (${a.$.vids.displayValue})`;
        }
        else if (a.vids.length === 1) {
            vidsNames = `לך (${a.$.vids.displayValue})`;
        }
        else if (a.vids.length === 0) {
            // cancel the event
        }
        let title = terms.voulnteerNewAssignSubject
            .replace('!tname!', a.tid.name)
            .replace('!branch!', a.bid.name);
        let html = terms.voulnteerNewAssign
            .replace('!vnames!', vidsNames)
            .replace('!purposeDesc!', a.purposeDesc && a.purposeDesc.length > 0 ? ` בנושא: '${'`' + a.purposeDesc + '`'}'` : '')
            .replace('!name!', a.tid.name)
            .replace('!date!', DateUtils.toDateString(a.date))
            .replace('!from!', a.fh)
            .replace('!to!', a.th)
            .replace('!address!', a.tid.address);

        let attendees = [] as AttendeeRequest[];
        for (const v of a.vids) {
            let u = await remult!.repo(Users).findId(v.id);
            attendees.push(
                {
                    name: u.name,
                    email: u.email,
                    rsvp: true,
                    partstat: 'ACCEPTED',
                    role: 'OPT-PARTICIPANT'
                });
        };

        let req: IcsRequest = {
            aid: a.id,
            color: a.bid.color,
            sequence: 2,// new Date().getTime(),
            title: title,
            description: html,
            location: a.tid.address,
            url: '',// 'bit.ly/eshel-app',
            start: {
                year: a.date.getFullYear(),
                month: a.date.getMonth() + 1,
                day: a.date.getDate(),
                hours: parseInt(a.fh.split(':')[0]),
                minutes: parseInt(a.fh.split(':')[1])
            },
            duration: {
                hours: parseInt(a.th.split(':')[0]) - parseInt(a.fh.split(':')[0]),
                minutes: parseInt(a.th.split(':')[1]) - parseInt(a.fh.split(':')[1])
            },
            status: 'CONFIRMED',
            busyStatus: 'BUSY',
            organizer: {
                displayName: a.bid.name, //u.name
                email: a.bid.email // this.isManager() ? b.email : u.email
            },
            attendees: attendees
        };


        return await NotificationService.sendCalendar(a.bid.email, req);
    }

    buildEmail() { }
    buildEevent() { }
}
export class DateUtils {

    static pipe: DatePipe = new DatePipe('en-US');

    static toDateString(d: Date) {
        return DateUtils.pipe.transform(d, 'dd.MM.yyyy')!;
    }
}
