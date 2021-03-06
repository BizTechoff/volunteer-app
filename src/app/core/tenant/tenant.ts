import { DataControl, openDialog } from "@remult/angular";
import { Allow, DateOnlyField, Entity, Field, FieldOptions, Remult, Validators, ValueListFieldType } from "remult";
import { ValueListValueConverter } from "remult/valueConverters";
import { FoodDeliveredCount, Gender } from "../../common/enums";
import { StringRequiredValidation } from "../../common/globals";
import { SelectLangsComponent } from "../../common/select-langs/select-langs.component";
import { SelectTenantComponent } from "../../common/select-tenant/select-tenant.component";
import { UserIdName } from "../../common/types";
import { dateFormat } from "../../common/utils";
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
    static neighbor = new Referrer(4, 'שכנה');
    static cake = new Referrer(5, 'פרויקט עוגה לקשיש');
    constructor(public id: number, public caption: string) { }

    static getOptions() {
        let op = new ValueListValueConverter(Referrer).getOptions();
        return op;
    }

    static fromStringByCaption(str: string) {
        let result: Referrer = Referrer.welfare;
        let options = Referrer.getOptions();
        let found = options.find(_ => _.caption === str);
        if (found) {
            result = found
        }
        return result;
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
                // bid: _.remult.user.isBoardOrAbove ? f?.value?.bid : _.remult.user.branch,
                onSelect: t => f.value = t
            })
    }
})
@Entity<Tenant>('tenants', async (options, remult) => {
    options.allowApiInsert = [Roles.admin, Roles.manager]
    options.allowApiDelete = [Roles.admin, Roles.manager]
    options.allowApiUpdate = Allow.authenticated
    // if (typeof roles === 'function') {
    //     return (<any>roles)(this(context));//even static-function!
    // }
    options.allowApiRead = Allow.authenticated
    options.defaultOrderBy = {
        bid: "desc",
        name: "asc"
    }
    options.apiPrefilter = () => (
        { bid: remult.branchAllowedForUser() }
    )
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

    @Field({ caption: terms.referrerRemark })
    referrerRemark: string = '';

    @Field({ caption: terms.foodCount })
    foodCount: FoodDeliveredCount = FoodDeliveredCount.one;

    @Field({ caption: terms.foodDeliveryArea })
    foodDeliveryArea: string = '';

    @Field({ caption: terms.gender })
    gender: Gender = Gender.unKnown;

    @Field({
        caption: terms.name,
        validate: StringRequiredValidation
    })
    name: string = '';

    @Field({
        caption: terms.mobile,
        // validate: [StringRequiredValidation, Validators.unique]//,052-3333333 BUG
        // valueConverter: {
        //     fromDb: col => mobileFromDb(mobileToDb(col)),
        //     toDb: col => mobileToDb(col)
        // }
    })
    mobile: string = '';

    @Field({
        caption: terms.phone
        // validate: [StringRequiredValidation, Validators.unique]
    })
    phone: string = '';

    @Field({ caption: terms.address, validate: StringRequiredValidation })
    address: string = '';

    @Field({ caption: terms.addressRemark })
    addressRemark: string = '';

    @Field({ caption: terms.apartment })
    apartment: string = '';

    @Field({ caption: terms.floor })
    floor: string = '';

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
    @DateOnlyField({
        caption: terms.birthday,
        displayValue: (row, col) => dateFormat(col)
    })//
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
