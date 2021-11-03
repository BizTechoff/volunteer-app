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
            if (!(remult.isAllowed(Roles.board)))//manager|volunteer
            {
                return tnt.bid.isEqualTo(remult.user.bid);//only same branch
                // if (!remult.isAllowed(Roles.manager)) {
                //     return FILTER_RESTRICT;//volunteer only himself
                // }  
                // return tnt.bid.isEqualTo(remult.user.bid);//manager only his branch
            }
            return FILTER_IGNORE!;// all
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