import { Entity, Field, IdEntity } from "remult";
import { Users } from "../../users/users";
import { Activity } from "./activity";

@Entity("actsVols", { allowApiCrud: true })
export class ActivitiesVolunteers extends IdEntity {
    @Field(options => options.valueType = Activity)
    a?: Activity;
    @Field(options => options.valueType = Users)
    u?: Users;
} 