import { Entity, Field, IdEntity } from "remult";
import { Users } from "../../users/users";
import { Activity } from "../activity/activity";

@Entity("volunteersActivities", { allowApiCrud: true })
export class VolunteersActivities extends IdEntity {
    @Field(options => options.valueType = Users)
    v?: Users;
    @Field(options => options.valueType = Activity)
    a?: Activity;
}
