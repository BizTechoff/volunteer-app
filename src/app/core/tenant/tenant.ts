import { DataControl, openDialog } from "@remult/angular";
import { Allow, DateOnlyField, Entity, Field, FieldOptions, IdEntity, isBackend, Remult, Validators } from "remult";
import { DateRequiredValidation, FILTER_IGNORE, StringRequiredValidation } from "../../common/globals";
import { SelectLangsComponent } from "../../common/select-langs/select-langs.component";
import { SelectTenantComponentComponent } from "../../common/select-tenant-component/select-tenant-component.component";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";
import { Langs } from "../../users/users";

export function CommaSeparatedStringArrayField<entityType = any>(
    ...options: (FieldOptions<entityType, Langs[]> |
        ((options: FieldOptions<entityType, Langs[]>, remult: Remult) => void))[]) {
    return Field({
        displayValue: (r,x) => {
            return x? x.map(i => i.caption).join(', ').trim() : '';
        },
        valueConverter: {
            toDb: x => x ? x.map(i => i.id.toString()).join(',') : undefined,
            fromDb: x => x ? Langs.fromString(x.toString()) : []
        }
    }, ...options);
}


@DataControl<any, Tenant>({
    hideDataOnInput: true,
    clickIcon: 'search',
    getValue: (_, f) => f.value?.name,
    click: async (_, f) => {
        await openDialog(SelectTenantComponentComponent, x => x.args = {
            onSelect: site => f.value = site,
            title: f.metadata.caption,
            tenantLangs: f.value.langs
        })
    }
})
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
                return active.and(tnt.bid.isEqualTo(remult.user.bid));//only same branch
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

    @DataControl<Tenant, Langs[]>({
        hideDataOnInput: true,
        clickIcon: 'search',
        getValue: (r,v) => {return v && v.value? v.value.map(i => i.caption).join(', ').trim() : '';},
        // getValue : (r,v) => {v.displayValue},
        click: async (_, f) => {
            await openDialog(SelectLangsComponent, x => x.args = {
                // onSelect: site => f.value = site,
                // title: f.metadata.caption,
                langs: f.value
            })
        }    
    })  
    @CommaSeparatedStringArrayField<Tenant>({ caption: terms.langs })
    langs: Langs[] = [Langs.hebrew];

    @Field({ caption: terms.active })
    active: boolean = true;

    @Field({ caption: terms.defaultVolunteers })
    defVids: string[] = [];

    @DateOnlyField({ caption: terms.birthday, validate: DateRequiredValidation })
    birthday!: Date;

}