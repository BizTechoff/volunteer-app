import { Allow, Entity, Field, IdEntity } from "remult";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";
import { Users } from "../../users/users";

@Entity<Branch>('branches', {
    allowApiInsert: Roles.admin,
    allowApiDelete: Roles.admin,
    allowApiUpdate: Roles.admin,
    allowApiRead: Allow.authenticated
})
export class Branch extends IdEntity {

    @Field({ caption: 'שם' })
    name: string = '';

    @Field({ caption: terms.manager, dbName: 'manager' })
    manager!: Users;

    @Field({ caption: terms.address })
    address: string = '';

}
