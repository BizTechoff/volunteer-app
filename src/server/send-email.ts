import { formatDate } from '@angular/common';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
//import * as nodemailer from 'nodemailer'
import { Remult } from 'remult';
import { EmailSvc } from '../app/common/utils';
//
EmailSvc.sendMail = async (subject: string, message: string, email: string, remult: Remult) => {

    var transporter = createTransport({
        service: 'gmail',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'motidru@gmail.com',
            pass: 'Monns2012!'
        }
    });

    let today = new Date();
    let date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 15);
    let fh = '14:15';
    let th = '16:00'; 
    let dtStart = formatDate(date,'yyyyDDmmTHHmm','en-US')

    // let content =
    //     'BEGIN:VCALENDAR' + '\r\n' +
    //     'PRODID:eshel' + '\r\n' +
    //     'METHOD:REQUEST' + '\r\n' +
    //     'BEGIN:VEVENT' + '\r\n' +
    //     'DTSTART:20211108T141500' + '\r\n' +
    //     'DTEND:20211108T160000' + '\r\n' +
    //     'SUMMARY:You have new activity with Tenant' + '\r\n' +
    //     'END:VEVENT' + '\r\n' +
    //     'END:VCALENDAR`';

    let content =
    `BEGIN:VCALENDAR
    VERSION:2.0
    PRODID:<eshel>
    BEGIN:VEVENT
    END:VEVENT
    BEGIN:VEVENT
    END:VEVENT
    END:VCALENDAR`;

    var mailOptions: Mail.Options = {
        from: 'motidru@gmail.com',
        to: 'motidru@gmail.com',
        subject: 'TX!! Got New Activity With Tenant',
        date: new Date(),
        icalEvent: {
            filename: 'invitation.ics',
            method: 'publish',
            content: content
        }
    };
    new Promise((res, rej) => {
        transporter.sendMail(mailOptions, function (error: any, info: { response: string; }) {
            if (error) {
                console.log('mail.error');
                console.log(error);
                rej(error);
            } else {
                console.log('mail.ok');
                res(true);
                console.log('Email sent: ' + info.response);
            }
        });
    });
    return true;

}
