import { Allow, DateOnlyField, Entity, Field, IdEntity, isBackend, Remult } from "remult";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";
import { Activity } from "../activity/activity";
 
@Entity<Tenant>('tenants',
    {
        allowApiInsert: [Roles.admin, Roles.manager],
        allowApiDelete: [Roles.admin, Roles.manager],
        allowApiUpdate: Allow.authenticated,
        allowApiRead: Allow.authenticated
    },
    async (options, remult) => {
        // options.deleting = async (tnt) => {
        //     let found = await remult.repo(Activity).findFirst(_ => _.tid.isEqualTo(tnt.id));

        // };
        options.saving = async (act) => {
            if (isBackend()) {
                if (act._.isNew()) {
                }
            }
        };
    })
export class Tenant extends IdEntity{

    constructor(private remult: Remult) {
        super();
    }

    @Field({ caption: terms.name })
    name: string = '';

    @Field({ caption: terms.mobile })
    mobile: string = '';

    @Field({ caption: terms.address })
    address: string = '';

    @Field({ caption: terms.status })
    status: string = '';

    @Field({ caption: terms.status })
    defVids: string[] = [];

    @DateOnlyField({ caption: terms.birthday })
    birthday!: Date;

    // @Field({ caption: terms.photo })
    // photoId: string = '';

}