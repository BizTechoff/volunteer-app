import { DataControl, openDialog } from "@remult/angular";
import { Allow, DateOnlyField, Entity, Field, FieldOptions, Remult, Validators, ValueListFieldType } from "remult";
import { ValueListValueConverter } from "remult/valueConverters";
import { DateRequiredValidation, StringRequiredValidation } from "../../common/globals";
import { SelectLangsComponent } from "../../common/select-langs/select-langs.component";
import { SelectTenantComponent } from "../../common/select-tenant/select-tenant.component";
import { UserIdName } from "../../common/types";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";
import { Langs, Users } from "../../users/users";
import { Branch } from "../branch/branch";
import { EntityWithModified } from "../EntityWithModified";



@ValueListFieldType()
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
        }
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
    }, ...options);
}



@DataControl<any, Tenant>({
    hideDataOnInput: true,
    clickIcon: 'search',
    getValue: (_, f) => f.value?.name,
    click: async (_, f) => {
        await openDialog(SelectTenantComponent,
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
        // if (typeof roles === 'function') {
        //     return (<any>roles)(this(context));//even static-function!
        // }
        allowApiRead: Allow.authenticated,
        defaultOrderBy: {
            bid: "desc",
            name: "asc"
        }
    },
    async (options, remult) => {
        options.apiPrefilter = () => (
            { bid: remult.branchAllowedForUser() }
            // { bid: !remult.isAllowed(Roles.board) ? { $id: remult.user.bid } : undefined }
        )
        // options.saving = async (tenant) => {
        // };
    })
export class Tenant extends EntityWithModified {

    constructor(private remult: Remult) {
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
        click: async (_, f) => {
            await openDialog(SelectLangsComponent, x => x.args = {
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
    })
    @CommaSeparatedStringArrayFieldUsersAsString<Tenant>({ caption: terms.associatedVolunteers })
    defVids: UserIdName[] = [] as UserIdName[];



    calcAge() {
        let result = 0;
        if (this.birthday && this.birthday.getFullYear() > 1900) {
            let today = new Date();
            result = Math.max(1, today.getFullYear() - this.birthday.getFullYear());
        }
        this.age = result;
    }

}
