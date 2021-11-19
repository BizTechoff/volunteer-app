import { DataControl, openDialog } from "@remult/angular";
import { Allow, DateOnlyField, Entity, Field, FieldOptions, IdEntity, isBackend, Remult, Validators, ValueListFieldType } from "remult";
import { ValueListValueConverter } from "remult/valueConverters";
import { DateRequiredValidation, FILTER_IGNORE, StringRequiredValidation } from "../../common/globals";
import { SelectLangsComponent } from "../../common/select-langs/select-langs.component";
import { SelectTenantComponentComponent } from "../../common/select-tenant-component/select-tenant-component.component";
import { UserIdName } from "../../common/types";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";
import { Langs, Users } from "../../users/users";
import { Branch } from "../branch/branch";


@ValueListFieldType(Referrer, { /*displayValue: () => {return '';}*/ /*multi: true*/ })
export class Referrer {
    static welfare = new Referrer(1, 'רווחה');
    static municipality = new Referrer(2, 'עירייה');
    static tenant = new Referrer(3, 'דייר אחר');
    constructor(public id: number, public caption: string) { }

    static getOptions() {
        let op = new ValueListValueConverter(Referrer).getOptions();
        return op;
    }

}

export function CommaSeparatedStringArrayField<entityType = any>(
    ...options: (FieldOptions<entityType, Langs[]> |
        ((options: FieldOptions<entityType, Langs[]>, remult: Remult) => void))[]) {
    return Field({

        displayValue: (_, x) => {
            return x ? x.map(i => i.caption).join(', ').trim() : '';
        },
        valueConverter: {
            toDb: x => x ? x.map(i => i.id.toString()).join(',') : undefined,
            fromDb: x => x ? Langs.fromString(x.toString()) : []
        }
    }, ...options);
}

export function CommaSeparatedStringArrayFieldUsersAsString<entityType = any>(
    ...options: (FieldOptions<entityType, UserIdName[]> |
        ((options: FieldOptions<entityType, UserIdName[]>, remult: Remult) => void))[]) {
    return Field({
        displayValue: (r, x) => {//(i.id === this.remult.user.id ? 'את\ה' : i.name)
            return x && x.length > 0 ? x.map(i => i.name.trim()).join(', ') : '';
        }//,
        // valueConverter: {
        //     toDb: x => x ? x.map(i => i.id.toString()).join(',') : undefined,
        //     fromDb: x => x ? x.split(',') : []
        // }
    }, ...options);
}

export function CommaSeparatedStringArrayFieldUsers<Tenant>(
    ...options: (FieldOptions<Tenant, Users[]> |
        ((options: FieldOptions<Tenant, Users[]>, remult: Remult) => void))[]) {
    return Field({
        displayValue: (r, x) => {
            return x && x.length > 0 ? x.map(i => i.name.trim()).join(', ') : '';
        },
        valueConverter: {
            toDb: x => x ? x.map(u => u.id).join(',') : undefined,
            fromDb: x => x ? Users.fromString(x.toString()) : []
        }
        // valueConverter: {
        //     toDb: x => '[moti]',// x?  ['e6eb8880-ff9d-4d63-8221-2a5e2dd54916'].map(i => i).join(',') : '',
        //     fromDb: x => []// x ? Users.fromString(x.toString()) : [] as Users[]
        // }
        // // valueConverter: {
        //     toDb: x => '[moti]',// x?  ['e6eb8880-ff9d-4d63-8221-2a5e2dd54916'].map(i => i).join(',') : '',
        //     fromDb: x => [] as Users[]// x ? Users.fromString(x.toString()) : [] as Users[]
        // }
    }, ...options);
}

// export function CommaSeparatedStringArrayField2<entityType = any>(
//     ...options: (FieldOptions<entityType, Referrer[]> |
//         ((options: FieldOptions<entityType, Referrer[]>, remult: Remult) => void))[]) {
//     return Field({
//         displayValue: (r, x) => {
//             return x ? x.map(i => i.caption).join(', ').trim() : '';
//         },
//         valueConverter: {
//             toDb: x => x ? x.map(i => i.id.toString()).join(',') : undefined,
//             fromDb: x => x ? Referrer.fromString(x.toString()) : []
//         }
//     }, ...options);
// }


@DataControl<any, Tenant>({
    hideDataOnInput: true,
    clickIcon: 'search',
    getValue: (_, f) => f.value?.name,
    click: async (_, f) => {
        await openDialog(SelectTenantComponentComponent,
            x => x.args = {
                title: 'דייר',// f.metadata && f.metadata.caption?f.metadata.caption:'בחירה',
                bid: f.value.bid,
                onSelect: t => f.value = t,
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
                return active.and(tnt.bid.contains(remult.user.bid));//only same branch
            }
            return active;// all
        };
        options.saving = (tnt) => {
            if (isBackend()) {
                console.log('Tenant Saving: ', tnt.defVids.length);
            }
        };
        options.saved = (tnt) => {
            if (isBackend()) {
                console.log('Tenant Saved: ', tnt.defVids.length);
            }
        }
        // options.deleting = async (tnt) => {
        //     let found = await remult.repo(Activity).findFirst(_ => _.tid.isEqualTo(tnt.id));

        // };
        // options.saving = async (act) => {
        //     if (isBackend()) {
        //         if (act._.isNew()) {
        //         }
        //     }
        // };
    })
export class Tenant extends IdEntity {

    constructor(private remult: Remult) {//, private dialog: DialogService) {
        super();
    }

    @Field({
        caption: terms.branch, validate: Validators.required.withMessage(terms.requiredField)
    })
    bid!: Branch;

    @Field({ caption: terms.referrer, validate: Validators.required.withMessage(terms.requiredField) })
    referrer: Referrer = Referrer.welfare;

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
        getValue: (r, v) => { return v && v.value ? v.value.map(i => i.caption).join(', ').trim() : ''; },
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

    @DataControl<Tenant, Date>({
        valueChange: (r, _) => { r.calcAge(); }
    })
    @DateOnlyField({ caption: terms.birthday, validate: DateRequiredValidation })
    birthday!: Date;

    @DataControl<Tenant, number>({
        width: '60', 
        readonly: true
    })
    @Field({ caption: terms.age })
    age: number = 0;

    @DataControl<Tenant, Users[]>({
        click: () => { },
        clickIcon: 'search',
        hideDataOnInput: true,
        getValue: (r, v) => { return v.displayValue; }
        // getValue: (r,v) => {return v && v.value ? v.value.map(i => i.name).join(', ').trim() : '';}
        // click: async (r, v) => await r.openVolunteers()
    })
    // @CommaSeparatedStringArrayFieldUsers<Tenant>({ caption: terms.associatedVolunteers })
    @CommaSeparatedStringArrayFieldUsersAsString<Tenant>({ caption: terms.associatedVolunteers })
    //defVids: Users[] = [] as Users[];
    defVids: UserIdName[] = [] as UserIdName[];

    calcAge() {
        let result = 0;
        if (this.birthday && this.birthday.getFullYear() > 1900) {
            let today = new Date();
            result = Math.max(1, today.getFullYear() - this.birthday.getFullYear());
        }
        this.age = result;
    }

    // async openVolunteers() {
    //     let t: Tenant = this;
    //     let bidOk = (t && t.bid && t.bid.id && t.bid.id.length > 0)!;
    //     if (bidOk) {
    //         let volids = await openDialog(VolunteersAssignmentComponent,
    //             input => input.args = {
    //                 bid: t.bid,
    //                 aid: '',
    //                 tname: t.name,
    //                 langs: t.langs,// this.t.langs, 
    //                 vids: t.defVids
    //             },
    //             output => output ? (output.args.changed ? output.args.vids : undefined) : undefined);
    //     }
    //     else {
    //         await this.dialog.error(terms.mustSetBidForThisAction);
    //     }
    // }

}
