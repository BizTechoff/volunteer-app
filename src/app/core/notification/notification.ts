import { Entity, Field, IdEntity } from "remult";
import { terms } from "../../terms";
import { Users } from "../../users/users";
import { Activity } from "../activity/activity";

export class NotificationsTypes {
    static EmailNewAssign = new NotificationsTypes(1, 'new-assign', terms.voulnteerNewAssignSubject, terms.voulnteerNewAssign);
    static EmailUpdateAssign = new NotificationsTypes(1, 'update-assign', terms.voulnteerUpdateAssignSubject, terms.voulnteerUpdateAssign);
    static EmailCancelAssign = new NotificationsTypes(1, 'cancel-assign', terms.voulnteerCancelAssignSubject, terms.voulnteerCancelAssign);
    constructor(public id: number, public caption: string, public subject: string, public text: string, public link = terms.volunteerCalndarLink) { }
}

@Entity('notifications', {
    allowApiCrud: true
})
export class NotificationActivity extends IdEntity {

    @Field({ caption: 'מתנדב' })
    volunteer!: Users;

    @Field({ caption: 'פעילות' })
    activity!: Activity;

    @Field({ caption: 'מייל שיוך נשלח' })
    sentAssigned: boolean = false;

    @Field({ caption: 'קישור נלחץ' })
    clickedLink: boolean = false;

}
