import { google } from 'googleapis';
import { calendar } from 'googleapis/build/src/apis/calendar';
import * as ics2 from 'ics';
import { Remult } from 'remult';
import { EmailSvc } from '../app/common/utils';

EmailSvc.sendMail = async (to: string, subject: string, message: string, link: string, remult: Remult) => {
    // Refer to the Node.js quickstart on how to setup the environment:
    // https://developers.google.com/calendar/quickstart/node
    // Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
    // stored credentials.
    let result = false;
    var event = {
        'summary': 'BTO - Google I/O 2015',
        'location': '800 Howard St., San Francisco, CA 94103',
        'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
            'dateTime': '2015-05-28T09:00:00-07:00',
            'timeZone': 'America/Los_Angeles',
        },
        'end': {
            'dateTime': '2015-05-28T17:00:00-07:00',
            'timeZone': 'America/Los_Angeles',
        },
        'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=2'
        ],
        'attendees': [
            { 'email': 'oritdru@gmail.com' },
            { 'email': 'gxbreaker@gmail.com' },
        ],
        'reminders': {
            'useDefault': false,
            'overrides': [
                { 'method': 'email', 'minutes': 24 * 60 },
                { 'method': 'popup', 'minutes': 10 },
            ],
        },
    };

    const auth = new google.auth.GoogleAuth({
        // Scopes can be specified either as an array or as a single, space-delimited string.
        scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
        ], 
        clientOptions: {
            email: process.env.ADMIN_GMAIL_MAIL,
            key: process.env.GOOGLE_CALENDAR_API_KEY,
            clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET
        }
    });
 
    // const authClient = new GoogleAuth();// await auth.getClient({ });
    // google.options({ auth: auth, key: process.env.GOOGLE_CALENDAR_API_KEY });

    const res = await calendar('v3').events.insert({
        auth: auth,// ,
        calendarId: 'primary',
        requestBody: event,
        sendNotifications: true
    });

    return true;
    //   , function(err: string, event: { htmlLink: any; }) {
    //     if (err) {
    //       console.log('There was an error contacting the Calendar service: ' + err);
    //       return;
    //     }
    //     console.log('Event created: %s', event.htmlLink);
    //   });
}
//maxAttendees
// EmailSvc.sendMail2 = async (to: string, subject: string, message: string, link: string, remult: Remult) => {

//     var transporter = createTransport({
//         service: 'gmail',
//         port: 587,
//         secure: false,
//         requireTLS: true,
//         auth: {
//             user: process.env.ADMIN_GMAIL_MAIL,
//             pass: process.env.ADMIN_GMAIL_PASS
//         }
//     });

//     let body = `<div align="right">
//                     <p>${message}</p>
//                     <p>!link!</p>
//                     <br>
//                     <p>,בברכה
//                         <br>
//                         אשל ירושלים
//                     </p>
//                     </div>`;
//     let toCalndar = '';
//     // if (link && link.length > 0) {
//     //     toCalndar = `<a href=${link}>לחץ כאן להוספה ליומן</a>`;
//     // };
//     body = body.replace('!link!', toCalndar);
//     let content = buildICS(subject);

//     var mailOptions: Mail.Options = {
//         from: `אשל מתנדבים <${process.env.ADMIN_GMAIL_MAIL}>`,//'Sender Name <sender@server.com>'
//         to: to,
//         cc: process.env.ADMIN_GMAIL_MAIL,
//         // att 
//         // attendees: [to, process.env.ADMIN_GMAIL_MAIL!],
//         subject: subject,
//         date: new Date(),
//         html: body,
//         icalEvent: {
//             filename: 'invite.ics',
//             method: 'REQUEST',//PUBLISH
//             content: content
//         }
//     };
//     new Promise((res, rej) => {
//         transporter.sendMail(mailOptions, function (error: any, info: { response: string; }) {
//             if (error) {
//                 // console.log('mail.error');
//                 console.log(error);
//                 rej(error);
//             } else {
//                 // console.log('mail.ok');
//                 res(true);
//                 console.log('Email sent: ' + info.response);
//             }
//         });
//     });
//     return true;

// }

function buildICS(title: string) {//date:Date,fh:string,th:string, tilte:string,) {
    let content = '';
    const ics = require('ics')
    const { writeFileSync } = require('fs');
    ics2.createEvent
    const event = {
        start: [2021, 11, 18, 16, 16],
        duration: { hours: 0, minutes: 27 },
        title: title,// terms.voulnteerNewAssignSubject.replace('!tname!',tname),
        description: 'Annual 10-kilometer run in Boulder, Colorado',
        location: 'Folsom Field, University of Colorado (finish line)',
        url: 'http://www.bolderboulder.com/',
        geo: { lat: 40.0095, lon: 105.2669 },
        categories: ['10k races', 'Memorial Day Weekend', 'Boulder CO'],
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: 'אשל ירושלים', email: process.env.ADMIN_GMAIL_MAIL },
        attendees: [
            { name: 'Orit Drukman App', email: 'oritdru@gmail.com', rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' },
            { name: 'GX App', email: 'gxbreaker@gmail.com', rsvp: true, dir: 'https://linkedin.com/in/brittanyseaton', role: 'OPT-PARTICIPANT' }
        ]
    }

    ics.createEvent(event, (error: any, value: any) => {
        if (error) {
            console.log(error)
            return
        }
        content = value;
        console.log(value);
        // writeFileSync(`${__dirname}/meeting.ics`, value)
    });

    return content;


    // BEGIN:VCALENDAR
    // VERSION:2.0
    // CALSCALE:GREGORIAN
    // PRODID:adamgibbons/ics
    // METHOD:PUBLISH
    // X-PUBLISHED-TTL:PT1H
    // BEGIN:VEVENT
    // UID:d9e5e080-d25e-11e8-806a-e73a41d3e47b
    // SUMMARY:Bolder Boulder
    // DTSTAMP:20181017T204900Z
    // DTSTART:20180530T043000Z
    // DESCRIPTION:Annual 10-kilometer run in Boulder\, Colorado
    // X-MICROSOFT-CDO-BUSYSTATUS:BUSY
    // URL:http://www.bolderboulder.com/
    // GEO:40.0095;105.2669
    // LOCATION:Folsom Field, University of Colorado (finish line)
    // STATUS:CONFIRMED
    // CATEGORIES:10k races,Memorial Day Weekend,Boulder CO
    // ORGANIZER;CN=Admin:mailto:Race@BolderBOULDER.com
    // ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=Adam Gibbons:mailto:adam@example.com
    // ATTENDEE;RSVP=FALSE;ROLE=OPT-PARTICIPANT;DIR=https://linkedin.com/in/brittanyseaton;CN=Brittany
    //   Seaton:mailto:brittany@example2.org
    // DURATION:PT6H30M
    // END:VEVENT
    // END:VCALENDAR
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
