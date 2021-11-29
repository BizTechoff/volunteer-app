//https://www.youtube.com/watch?v=dFaV95gS_0M&t=996s
// https://www.youtube.com/watch?v=_uHd0ypR5OI
// https://www.nylas.com/blog/integrate-google-calendar-api

import { calendar_v3, google } from 'googleapis';
import { CalendarRequest, DateRequest } from '../app/common/types';
import { EmailSvc } from '../app/common/utils';
// 

// import { calendar_v3 } from "googleapis";

EmailSvc.sendCalendar = async (req: CalendarRequest) => {
    // const {google} = require('googleapis');
    // require('dotenv').config();

    // Provide the required configuration
    const CREDENTIALS = JSON.parse(process.env.CALENDAR_CREDENTIALS_GET_HESED_HAIFA_SERVICE!);
    const calendarId = process.env.CALENDAR_ID_GET_HESED_HAIFA;
    const SCOPE = 'https://www.googleapis.com/auth/calendar.events';

    const auth = new google.auth.OAuth2(
        {
            clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET//,
            // redirectUri : process.env.GOOGLE_CALENDAR_REDIRECT_URL
        });

    auth.setCredentials({
        scope: SCOPE,
        refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
    })

    // Google calendar API settings
    const calendar = google.calendar({ version: "v3", auth: auth });
    // Insert new event to Google Calendar
    const insertEvent = async (event: calendar_v3.Schema$Event) => {

        try {
            let response = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
                sendNotifications: true,
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

    const updateEvent = async (event: calendar_v3.Schema$Event) => {

        try {
            let response = await calendar.events.update({
                eventId: iCalId2Id(req.ics.aid),// req.ics.aid,
                calendarId: 'primary',
                requestBody: event,
                sendNotifications: true,
                sendUpdates: 'all'
            });

            if (response['status'] == 200 && response['statusText'] === 'OK') {
                return 1;
            } else {
                return 0;
            }
        } catch (error) {
            console.log(`Error at updateEvent --> ${error}`);
            return 0;
        }
    };

    const getEvent = async (): Promise<calendar_v3.Schema$Event | undefined> => {

        // let result: calendar_v3.Schema$Event;
        try {
            let response = await calendar.events.get({
                eventId: req.ics.aid,
                calendarId: 'primary'
            });

            if (response['status'] == 200 && response['statusText'] === 'OK') {
                console.log(response);

                return response.data;
            } else {
                console.log(`Error Status: ${response['status']}`);

            }
        } catch (error) {
            console.log(`Error at getEvent --> ${error}`);
        }
        return undefined;
    };

    const listEvent = async () => {
        let result = 0;
        // let result: calendar_v3.Schema$Event;
        try {
            let response = await calendar.events.list({
                calendarId: 'primary',
                iCalUID: req.ics.aid
            });

            console.log(`listEvent.status: ${response['status']}`);
            if (response['status'] == 200 && response['statusText'] === 'OK') {

                if (response.data.items) {
                    result = response.data.items.length;
                    console.log(`response.data.items.length: ${response.data.items.length}`);
                    for (const itm of response.data.items) {
                        console.log(itm);
                    }
                }
                else {
                    console.log(`Found No items`);

                }
            } else {
                console.log(`Error Status: ${response['status']}`);

            }
        } catch (error) {
            console.log(`Error at listEvent --> ${error}`);
        }
        return result;
    };

    let start = dateTimeForCalander(req.ics.start);
    let calc = req.ics.start;
    calc.hours += req.ics.duration.hours;
    calc.minutes += req.ics.duration.minutes;
    let end = dateTimeForCalander(calc);
    console.log('start', start);
    console.log('end', end);
    console.log('eventid', req.ics.aid);
    console.log('iCalId2Id(req.ics.aid)', iCalId2Id(req.ics.aid));

    let attendees = [] as calendar_v3.Schema$EventAttendee[];
    for (const a of req.ics.attendees) {
        attendees.push({
            email: a.email,
            displayName: a.name
        });
    }

    let event: calendar_v3.Schema$Event = {
        summary: `אשל: פעילות עם הדייר יצחק`,
        description: `קניות שבועיות`,
        start: {
            'dateTime': start,
            'timeZone': 'Asia/Jerusalem'
        },
        end: {
            'dateTime': end,
            'timeZone': 'Asia/Jerusalem'
        },
        location: req.ics.location,
        id: iCalId2Id(req.ics.aid),
        // iCalUID: req.ics.aid,
        colorId: '4',
        attendees: attendees,
        visibility: 'public',
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },//day before
                { method: 'popup', minutes: 120 }//2 hours before
            ]
        }
    };

    // let count = await listEvent();
    // console.log('count', count);

    if (!await insertEvent(event)) {
        await updateEvent(event);
    }

    // if (count) {
    //     await updateEvent(event);
    // }
    // else {
    //     await insertEvent(event);
    // }
    // let exists = await getEvent();
    // console.log(exists);

    // if (exists) {
    //     await updateEvent(event);
    // }
    // else{
    // await insertEvent(event);
    // }

    return true;
}

function iCalId2Id(aid: string) {
    let result = '';
    let invalid = ['-', 'w', 'x', 'y', 'z'];
    for (const c of aid.trim()) {
        if (!invalid.includes(c)) {
            result += c;
        }
    }
    return result;
}

function dateTimeForCalander(date: DateRequest) {
    const TIMEOFFSET = '+02:00';

    let year = date.year;
    let month = date.month;
    let m = month + '';
    if (month < 10) {
        m = `0${month}`;
    }
    let day = date.day;
    let d = day + '';
    if (day < 10) {
        d = `0${day}`;
    }
    let hour = date.hours;
    let h = hour + '';
    let h2 = hour + 1 + '';
    if (hour < 10) {
        h = `0${hour}`;
        if (hour < 9) {
            h2 = `0${hour}`;
        }
    }
    let minute = date.minutes;
    let min = minute + '';
    if (minute < 10) {
        min = `0${minute}`;
    }

    let newDateTime = `${year}-${m}-${d}T${h}:${min}:00.000${TIMEOFFSET}`;
    return newDateTime;
};



// let attendees = [] as calendar_v3.Schema$EventAttendee[];
// for (const a of req.ics.attendees) {
//     attendees.push({
//         displayName: a.name,
//         email: a.email
//     });
// }

// calendar.freebusy.query(
//     {
//      requestBody:{
//          timeMin: start,
//          timeMax: end,
//          items: [{id: 'primary'}]
//      }
//     },
//      (err, res)=>{
//          if(err){
//              return console.log(err);
//          }
//          const attr = res?.data.calendars!.primary.busy;//if not busy
//          if(attr?.length === 0){
//              console.log('Not busy')
//          }
//          else{
//             console.log('Busy')
//          }
//      }
// );

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
// const auth = google.auth.getClient({
//     clientOptions: {
//         key: process.env.GOOGLE_CALENDAR_API_KEY,
//         clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
//         scopes: 'https://www.googleapis.com/auth/calendar'
//     },
//     projectId: process.env.GOOGLE_CALENDAR_PROJECT_ID
// });
// const auth = new google.auth.JWT(
//     CREDENTIALS.client_email,
//     undefined,
//     CREDENTIALS.private_key,
//     SCOPES
//     // ,'eshel.app.haifa@gmail.com'
// );

// Your TIMEOFFSET Offset
// const TIMEOFFSET = '+02:00';

// Get date-time string for calender



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