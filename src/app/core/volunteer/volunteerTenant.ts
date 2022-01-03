import { Entity, Field, IdEntity } from "remult";
import { Users } from "../../users/users";
import { Tenant } from "../tenant/tenant";

@Entity("volunteersTenants", { allowApiCrud: true })
export class VolunteersTenants extends IdEntity {
    @Field(options => options.valueType = Users)
    v?: Users;
    @Field(options => options.valueType = Tenant)
    t?: Tenant;
}
