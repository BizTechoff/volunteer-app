//https://www.youtube.com/watch?v=dFaV95gS_0M&t=996s
// https://www.youtube.com/watch?v=_uHd0ypR5OI
// https://www.nylas.com/blog/integrate-google-calendar-api

import { calendar_v3, google } from 'googleapis';
import { CalendarClient, CalendarRequest, DateRequest } from '../app/common/types';
import { EmailSvc } from '../app/common/utils';


EmailSvc.sendCalendar = async (req: CalendarRequest) => {
    console.debug('send-calendar', req);
    const SCOPE = 'https://www.googleapis.com/auth/calendar.events';

    let data = JSON.parse(process.env.CALENDAR_BRANCHES!);
    let branches: CalendarClient[] = [] as CalendarClient[];
    branches.push(...data);
 
    let found = branches.find(b => req.sender.includes(b.name));
    if (!found) {
        console.debug(`אימייל הסניף ${req.sender} אינו מוגדר במערכת`);
        return false;
    }
 
    const auth = new google.auth.OAuth2(
        {
            clientId: found.client.id,
            clientSecret: found.client.secret
        });

    auth.setCredentials({
        scope: SCOPE,
        refresh_token: found.client.token
    })

    let start = dateTimeForCalander(req.ics.start);
    let calc = req.ics.start;
    calc.hours += req.ics.duration.hours;
    calc.minutes += req.ics.duration.minutes;
    let end = dateTimeForCalander(calc);

    let organizer = {
        email: req.ics.organizer.email,
        displayName: req.ics.organizer.displayName
    };// calendar_v3.Schema$Event.organizer
    let attendees = [] as calendar_v3.Schema$EventAttendee[];
    for (const a of req.ics.attendees) {
        attendees.push({
            email: a.email,
            displayName: a.name
        });
    }

    let event: calendar_v3.Schema$Event = {
        summary: req.ics.title,
        description: req.ics.description,
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
        colorId: req.ics.color + '',
        organizer: organizer,
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

    // Google calendar API settings
    const calendar = google.calendar({ version: "v3", auth: auth });

    if (!await insertEvent(calendar, req.ics.aid, event)) {
        await updateEvent(calendar, req.ics.aid, event);
    }

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

async function insertEvent(calendar: calendar_v3.Calendar, aid: string, event: calendar_v3.Schema$Event) {

    try {
        let response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            sendNotifications: true,
            sendUpdates: 'all'
        });

        if (response['status'] == 200 && response['statusText'] === 'OK') {
            console.debug('Insert Event', 'OK');
            return 1;
        } else {
            console.debug('Insert Event Error', response['status']);
            return 0;
        }
    } catch (error) {
        console.debug(`Error at insertEvent --> ${error}`);
        return 0;
    }
};

async function updateEvent(calendar: calendar_v3.Calendar, aid: string, event: calendar_v3.Schema$Event) {

    try {
        let response = await calendar.events.update({
            eventId: iCalId2Id(aid),
            calendarId: 'primary',
            requestBody: event,
            sendNotifications: true,
            sendUpdates: 'all'
        });

        if (response['status'] == 200 && response['statusText'] === 'OK') {
            console.debug('Update Event', 'OK');
            return 1;
        } else {
            console.debug('Update Event Error', response['status']);
            return 0;
        }
    } catch (error) {
        console.debug(`Error at updateEvent --> ${error}`);
        return 0;
    }
};

async function getEvent(calendar: calendar_v3.Calendar, aid: string): Promise<calendar_v3.Schema$Event | undefined> {

    // let result: calendar_v3.Schema$Event;
    try {
        let response = await calendar.events.get({
            eventId: aid,
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

async function listEvent(calendar: calendar_v3.Calendar, aid: string) {
    let result = 0;
    // let result: calendar_v3.Schema$Event;
    try {
        let response = await calendar.events.list({
            calendarId: 'primary',
            iCalUID: aid
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
