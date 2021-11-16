import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { Remult } from 'remult';
import { EmailSvc } from '../app/common/utils';
 
EmailSvc.sendMail = async (to: string, subject: string, message: string, link: string, remult: Remult) => {

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

    let body = `<div align="right">
                    <p>${message}</p>
                    <p>!link!</p>
                    <br>
                    <p>,בברכה
                        <br>
                        אשל ירושלים
                    </p>
                    </div>`;
    let toCalndar = '';
    if (link && link.length > 0) {
        toCalndar = `<a href=${link}>לחץ כאן להוספה ליומן</a>`;
    };
    body = body.replace('!link!', toCalndar);

    var mailOptions: Mail.Options = {
        from: process.env.ADMIN_GMAIL_MAIL,
        to: to,
        subject: subject,
        date: new Date(),
        html: body
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
