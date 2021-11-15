import { DatePipe, formatDate } from '@angular/common';
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
            user: process.env.ADMIN_GMAIL_MAIL,
            pass: process.env.ADMIN_GMAIL_PASS
        }
    });

    let today = new Date();
    let date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 15);
    let date1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 16, 0);
    let fh = '14:15';
    let th = '16:00';
    let dtStart = formatDate(date, 'yyyyDDmmTHHmm', 'en-US')

    const datepipe: DatePipe = new DatePipe('en-US');
    let fDate = datepipe.transform(date, 'yyyyMMddTHHmmssZ')!;
    let tDate = datepipe.transform(date1, 'yyyyMMddTHHmmssZ')!;
    let newLine = '%0D%0A';
    let title = 'תואמה לך פעילות עם דייר';
    let location = 'קרני יהודה 23 תל אביב';
    let details = 'היי מתנדב אנא לחץ כאן להוספת הפעילות ליומן';
 
    let query = `https://calendar.google.com/calendar/u/0/r/eventedit?`;
    query += `text=${encodeURI(title)}`;
    query += `&dates=${fDate}/${tDate}`;
    query += `&location=${encodeURI(location)}`;
    query += `&details=${encodeURI(details)}`;
    query += `&trp=true`;
    query += `&sf=true`;
    query += `&output=xml#f`;

    console.log(query);

    var mailOptions: Mail.Options = {
        from: process.env.ADMIN_GMAIL_MAIL,
        to: process.env.ADMIN_GMAIL_MAIL,
        subject: 'TX!! Got New Activity With Tenant',
        date: new Date(),
        html: `<div align="right"><a href=${query}>לחץ כאן להוספה ליומן</a></div>`
    };
    new Promise((res, rej) => {
        transporter.sendMail(mailOptions, function (error: any, info: { response: string; }) {
            if (error) {
                // console.log('mail.error');
                console.log(error);
                rej(error);
            } else {
                // console.log('mail.ok');
                res(true);
                console.log('Email sent: ' + info.response);
            }
        });
    });
    return true;

}

//https://stackoverflow.com/questions/10488831/link-to-add-to-google-calendar
//https://datatracker.ietf.org/doc/html/rfc5546#section-1.4

// let query = `https://calendar.google.com/calendar/u/0/r/eventedit?
// text=${encodeURI(title)}
// &dates=${encodeURI(fDate)}/${encodeURI(tDate)}
// &location=${encodeURI(location)}
// &details=${encodeURI(details)}
// &trp=true
// &sf=true
// &output=xml#f
// `;

// let query = `https://calendar.google.com/calendar/u/0/r/eventedit?`;
// query += `text=${title}`;
// query += `&dates=${fDate}/${tDate}`;
// query += `&location=${location}`;
// query += `&details=${details}`;
// query += `&trp=true`;
// query += `&sf=true`;
// query += `&output=xml#f`;

// icalEvent: {
//     filename: 'invitation.ics',
//     method: 'request',
//     content: content
// }

// let content =
// `BEGIN:VCALENDAR
// VERSION:2.0
// BEGIN:VEVENT
// CLASS:PUBLIC
// DESCRIPTION:eshel-title\nDate and Time - Nov 16\, 2021 6:00 PM to 2:00 PM\nVenue - eshel-address\neshel-details\n
// DTSTART:20211116T160000Z
// DTEND:20211116T120000Z
// LOCATION:eshel-address
// SUMMARY;LANGUAGE=en-us:eshel-title
// END:VEVENT
// END:VCALENDAR`;

// let content =
//     'BEGIN:VCALENDAR' + '\r\n' +
//     'PRODID:eshel' + '\r\n' +
//     'METHOD:REQUEST' + '\r\n' +
//     'BEGIN:VEVENT' + '\r\n' +
//     'DTSTART:20211116T141500' + '\r\n' +
//     'DTEND:20211116T160000' + '\r\n' +
//     'SUMMARY:You have new activity with Tenant' + '\r\n' +
//     'END:VEVENT' + '\r\n' +
//     'END:VCALENDAR`';
//-//ABC Corporation//NONSGML My Product//EN
// let content =
// `BEGIN:VCALENDAR
//     VERSION:2.0
//     PRODID:<1718465d-e9df-4340-964c-09bade511013>
//     BEGIN:VALARM
//         TRIGGER:-PT1440M
//         ACTION:DISPLAY
//         DESCRIPTION:Reminder From Eshel
//         REPEAT:4
//         DURATION:PT1H
//     END:VALARM
// END:VCALENDAR`;

// let content = 'BEGIN:VCALENDAR\r\nPRODID:-//ACME/DesktopCalendar//EN\r\nMETHOD:REQUEST\r\n...';
