import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { EmailRequest, IcsRequest } from '../app/common/types';
import { NotificationService } from '../app/common/utils';

NotificationService.sendEmail = async (req: EmailRequest) => {
    console.debug('send-email', req);
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

    var mailOptions: Mail.Options = {
        from: `אשל מתנדבים <${process.env.ADMIN_GMAIL_MAIL}>`,//'Sender Name <sender@server.com>'
        to: req.to ?? process.env.ADMIN_GMAIL_MAIL,
        // cc: req.sender,
        subject: req.subject,
        date: new Date(),
        html: req.html//,
        // icalEvent: {
        //     filename: 'invite.ics',
        //     method: 'REQUEST',//PUBLISH
        //     content: content
        // }
    };
    new Promise((res, rej) => {
        transporter.sendMail(mailOptions, function (error: any, info: { response: string; }) {
            if (error) {
                // console.log('mail.error');
                console.debug('Email error', error);
                rej(error);
            } else {
                // console.log('mail.ok');
                res(true);
                console.debug('Email sent', info.response);
            }
        });
    });
    return true;
}

function buildICS(req: IcsRequest) {//date:Date,fh:string,th:string, tilte:string,) {
    let content = '';
    const ics = require('ics')
    const { writeFileSync } = require('fs');
    // ics2.createEvent
    const event = {
        uid: req.aid,
        sequence: req.sequence,
        start: [req.start.year, req.start.month, req.start.day, req.start.hours, req.start.minutes],
        duration: { hours: req.duration.hours, minutes: req.duration.minutes },
        title: req.title,
        description: req.description,
        location: req.location,
        // url: req.url,
        geo: { lat: 31.7860672, lon: 35.2233429 },
        // categories: ['EshelVolunteers'],
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: 'אשל אשדוד', email: process.env.ADMIN_GMAIL_MAIL },
        //organizer: { name: req.organizer.name, email: req.organizer.email },
        attendees: req.attendees
        // [ 
        //     { name: 'Orit Drukman App', email: 'oritdru@gmail.com', rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' },
        //     { name: 'GX App', email: 'gxbreaker@gmail.com', rsvp: true, dir: 'https://linkedin.com/in/brittanyseaton', role: 'OPT-PARTICIPANT' }
        // ]
    }

    ics.createEvent(event, (error: any, value: any) => {
        if (error) {
            console.log(error)
            return
        }
        content = value;
        // console.log(value);
        // writeFileSync(`${__dirname}/meeting.ics`, value)
    });

    return content;
}
