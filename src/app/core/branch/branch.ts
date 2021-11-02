import { Allow, Entity, Field, IdEntity } from "remult";
import { StringRequiredValidation } from "../../common/globals";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";

@Entity<Branch>('branches', {
    allowApiInsert: Roles.admin,
    allowApiDelete: Roles.admin,
    allowApiUpdate: Roles.admin,
    allowApiRead: Allow.authenticated
})
export class Branch extends IdEntity {

    @Field({ caption: terms.name, validate: StringRequiredValidation })
    name: string = '';

    @Field({ caption: terms.address, validate: StringRequiredValidation })
    address: string = '';

}
