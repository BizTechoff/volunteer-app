import { Allow, DateOnlyField, Entity, Field, IdEntity, isBackend, Remult, Validators } from "remult";
import { DateRequiredValidation, StringRequiredValidation } from "../../common/globals";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";

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
export class Tenant extends IdEntity {

    constructor(private remult: Remult) {
        super();
    }

    @Field({
        caption: terms.name,
        validate: StringRequiredValidation
    })
    name: string = '';

    @Field({
        caption: terms.mobile,
        validate: [StringRequiredValidation, Validators.unique]
    })
    mobile: string = '';

    @Field({ caption: terms.address, validate: StringRequiredValidation })
    address: string = '';

    @Field({ caption: terms.status })
    status: string = '';

    @Field({ caption: terms.defaultVolunteers })
    defVids: string[] = [];

    @DateOnlyField({ caption: terms.birthday, validate: DateRequiredValidation })
    birthday!: Date;

    @Field({
        caption: terms.branch, validate: StringRequiredValidation
    })
    bid: string = '';

}