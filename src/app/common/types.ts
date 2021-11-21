export interface UserIdName {
    id: string,
    name: string//,
    // email: string,
    // sent: boolean
}

export interface PhotoDetails {
    vname: string,
    created: Date,
    data: string,
    bname: string,
    link: string
}


export interface DateRequest {
    year: number,
    month: number,
    day: number,
    hours: number,
    minutes: number
}

export interface DurationRequest {
    hours: number,
    minutes: number
}

export interface OrganizerRequest {
    name: string,
    email: string
}

export interface AttendeeRequest {
    name: string,
    email: string,
    rsvp: true,
    partstat: 'ACCEPTED',
    role: 'OPT-PARTICIPANT'
}

export interface IcsRequest {
    title: string,
    description: string,
    location: string,
    url: string,
    start: DateRequest,
    duration: DurationRequest,
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: OrganizerRequest,
    attendees: AttendeeRequest[]
}

export interface EmailRequest {
    from: string,
    to: string,
    cc: string,
    subject: string,
    html: string
}

export interface CalendarRequest {
    sender: string,
    email: EmailRequest,
    ics: IcsRequest
}
