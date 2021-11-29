//https://www.youtube.com/watch?v=dFaV95gS_0M&t=996s
// https://www.youtube.com/watch?v=_uHd0ypR5OI
// https://www.nylas.com/blog/integrate-google-calendar-api

import { calendar_v3, google } from 'googleapis';
import { CalendarRequest } from '../app/common/types';
import { EmailSvc } from '../app/common/utils';
// 

// import { calendar_v3 } from "googleapis";

EmailSvc.sendCalendar = async (req: CalendarRequest) => {
    // const {google} = require('googleapis');
    // require('dotenv').config();

    // Provide the required configuration
    const CREDENTIALS = JSON.parse(process.env.CALENDAR_CREDENTIALS_GET_HESED_HAIFA_SERVICE!);
    const calendarId = process.env.CALENDAR_ID_GET_HESED_HAIFA;

    // Google calendar API settings
    const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
    const calendar = google.calendar({ version: "v3" });

    // const auth = new google.auth.OAuth2(
    //     {
    //         clientId: CREDENTIALS.web.client_id,
    //         clientSecret: CREDENTIALS.web.client_secret//,
    //         // redirectUri: CREDENTIALS.web.auth_uri
    //     });

    // const auth = new google.auth.getClient(
    //     { 
    //         clientId: CREDENTIALS.web.client_id,
    //         clientSecret: CREDENTIALS.web.client_secret//,
    //         // redirectUri: CREDENTIALS.web.auth_uri
    //     });

    const auth = new google.auth.JWT(
        CREDENTIALS.client_email,
        undefined,
        CREDENTIALS.private_key,
        SCOPES
        // ,'eshel.app.haifa@gmail.com'
    );

    // const auth = new google.auth.OAuth2(
    //        { clientId: '982749320989-rkd39te64b9q2u8i3g79vn80s5ekfis1.apps.googleusercontent.com',
    //         clientSecret: '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',
    //         redirectUri: 'https://volunteers-app.herokuapp.com/'
    // });

    // Your TIMEOFFSET Offset
    const TIMEOFFSET = '+02:00';

    // Get date-time string for calender
    const dateTimeForCalander = () => {

        let date = new Date();

        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let m = month + '';
        if (month < 10) {
            m = `0${month}`;
        }
        let day = date.getDate();
        let d = day + '';
        if (day < 10) {
            d = `0${day}`;
        }
        let hour = date.getHours();
        let h = hour + '';
        let h2 = hour + 1 + '';
        if (hour < 10) {
            h = `0${hour}`;
            if (hour < 9) {
                h2 = `0${hour}`;
            }
        }
        let minute = date.getMinutes();
        let min = minute + '';
        if (minute < 10) {
            min = `0${minute}`;
        }

        let newDateTime = `${year}-${m}-${d}T${h}:${min}:00.000${TIMEOFFSET}`;
        let newDateTime2 = `${year}-${m}-${d}T${h2}:${min}:00.000${TIMEOFFSET}`;

        let startDate = new Date(Date.parse(newDateTime));
        // Delay in end time is 1
        let endDate = new Date(new Date(startDate).setHours(startDate.getHours() + 1));

        return {
            'start': newDateTime,
            'end': newDateTime2
        }
    };

    // Insert new event to Google Calendar
    const insertEvent = async (event: calendar_v3.Schema$Event) => {

        try {
            let response = await calendar.events.insert({
                auth: auth,
                calendarId: calendarId,
                requestBody: event,
                sendUpdates: 'all'
            });

            if (response['status'] == 200 && response['statusText'] === 'OK') {
                return 1;
            } else {
                return 0;
            }
        } catch (error) {
            console.log(`Error at insertEvent --> ${error}`);
            return 0;
        }
    };

    let dateTime = dateTimeForCalander();
    // new Date().toISOString();
    let attendees = [] as calendar_v3.Schema$EventAttendee[];
    // for (const a of req.ics.attendees) {
    //     attendees.push({
    //         displayName: a.name,
    //         email: a.email
    //     });
    // }

    // Event for Google Calendar
    let event: calendar_v3.Schema$Event = {
        'summary': `אשל: פעילות עם הדייר יצחק`,
        'description': `קניות שבועיות`,
        'start': {
            'dateTime': dateTime['start'],
            'timeZone': 'Asia/Jerusalem'
        },
        'end': {
            'dateTime': dateTime['end'],
            'timeZone': 'Asia/Jerusalem'
        },
        colorId: '4',
        attendees: [
            { email: 'oritdru@gmail.com' }
        ],
        visibility: 'public',
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },//day before
                { method: 'popup', minutes: 120 }//2 hours before
            ]
        }
    };

    insertEvent(event)
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    return true;
}

// insertEventToGoogleCalendar();
// Get all the events between two dates
// const getEvents = async (dateTimeStart, dateTimeEnd) => {

//     try {
//         let response = await calendar.events.list({
//             auth: auth,
//             calendarId: calendarId,
//             timeMin: dateTimeStart,
//             timeMax: dateTimeEnd,
//             timeZone: 'Asia/Kolkata'
//         });

//         let items = response['data']['items'];
//         return items;
//     } catch (error) {
//         console.log(`Error at getEvents --> ${error}`);
//         return 0;
//     }
// };

// let start = '2020-10-03T00:00:00.000Z';
// let end = '2020-10-04T00:00:00.000Z';

// getEvents(start, end)
//     .then((res) => {
//         console.log(res);
//     })
//     .catch((err) => {
//         console.log(err);
//     });

// Delete an event from eventID
// const deleteEvent = async (eventId) => {

//     try {
//         let response = await calendar.events.delete({
//             auth: auth,
//             calendarId: calendarId,
//             eventId: eventId
//         });

//         if (response.data === '') {
//             return 1;
//         } else {
//             return 0;
//         }
//     } catch (error) {
//         console.log(`Error at deleteEvent --> ${error}`);
//         return 0;
//     }
// };

let eventId = 'hkkdmeseuhhpagc862rfg6nvq4';

// deleteEvent(eventId)
//     .then((res) => {
//         console.log(res);
//     })
//     .catch((err) => {
//         console.log(err);
//     });