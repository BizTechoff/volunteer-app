import { Allow, DateOnlyField, Entity, Field, IdEntity, isBackend, Remult, Validators } from "remult";
import { DateRequiredValidation, FILTER_IGNORE, StringRequiredValidation } from "../../common/globals";
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
        options.apiPrefilter = (tnt) => {
            let active = FILTER_IGNORE;// tnt.active.isEqualTo(true);
            if (!(remult.isAllowed(Roles.board)))//manager|volunteer
            {
                return active.and( tnt.bid.isEqualTo(remult.user.bid));//only same branch
            }
            return active;// all
        };
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
        caption: terms.branch, validate: StringRequiredValidation
    })
    bid: string = '';

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

    @Field({ caption: terms.active })
    active: boolean = true;

    @Field({ caption: terms.defaultVolunteers })
    defVids: string[] = [];

    @DateOnlyField({ caption: terms.birthday, validate: DateRequiredValidation })
    birthday!: Date;

}