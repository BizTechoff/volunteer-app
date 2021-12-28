
import { DataControl, InputField, openDialog } from "@remult/angular";
import { Allow, BackendMethod, DateOnlyField, Entity, Field, IdEntity, IntegerField, isBackend, Remult, Validators, ValueListFieldType } from "remult";
import { InputTypes } from "remult/inputTypes";
import { ValueListValueConverter } from "remult/valueConverters";
import { DialogService } from "../common/dialog";
import { pointsEachSuccessActivity, pointsEachSuccessPhoto, pointsForSurprise, StringRequiredValidation } from "../common/globals";
//import { SelectLangsComponent } from "../common/select-langs/select-langs.component";
//import { SelectVolunteersComponent } from "../common/select-volunteers/select-volunteers.component";
import { Branch } from "../core/branch/branch";
import { CommaSeparatedStringArrayField, Tenant } from "../core/tenant/tenant";
import { terms } from "../terms";
import { Roles } from './roles';


@ValueListFieldType({ /*displayValue: () => {return '';}*/ /*multi: true*/ })
export class Langs {
    static hebrew = new Langs(1, 'עברית');
    static english = new Langs(2, 'אנגלית');
    static russian = new Langs(3, 'רוסית');
    static french = new Langs(4, 'צרפתית');
    constructor(public id: number, public caption: string) { }

    static getOptions() {
        let op = new ValueListValueConverter(Langs).getOptions();
        return op;
    }
    static fromString(str: string) {
        // console.log(str);
        let split = str.toString().split(',');
        // console.log(split);
        let result = [] as Langs[];
        let options = Langs.getOptions();
        split.forEach(l => {
            let found = options.find(_ => _.id === parseInt(l));
            if (found) {
                result.push(found);
            }
        });
        return result;
    }

}

// export function CommaSeparatedStringArrayField<entityType = any>(
//     ...options: (FieldOptions<entityType, Users[]> |
//         ((options: FieldOptions<entityType, Users[]>, remult: Remult) => void))[]) {
//     return Field({
//         displayValue: (r, x) => {
//             return x ? x.map(i => i.id).join(', ').trim() : '';
//         },
//         valueConverter: {
//             toDb: x => x ? x.map(i => i.id.toString()).join(',') : undefined,
//             fromDb: x => x ? Langs.fromString(x.toString()) : []
//         }
//     }, ...options);
// }

// @DataControl<any, Users[]>({
//     hideDataOnInput: true,
//     clickIcon: 'search',
//     getValue: (_, f) => f.value.map(u => u.name).join(', '),
//     click: async (_, f) => {
//         await openDialog(SelectVolunteersComponent, x => x.args = {
//             onSelect: site => f.value = site,
//             title: f.metadata.caption,
//             usersLangs: f.value.langs
//         })
//     }
// })
// @DataControl<any, Users[]>({
//     hideDataOnInput: true,
//     clickIcon: 'search',
//     getValue: (_, f) => f.value.map(u => u.$.name).join(', '),
//     // click: async (_, f) => {
//     //     await openDialog(SelectVolunteersComponent, x => x.args = {
//     //         onSelect: u => f.value = u,
//     //         title: f.metadata.caption,
//     //         usersLangs: f.value.langs
//     //     })
//     // }
// }) 
@DataControl<any, Users>({
    hideDataOnInput: true,
    clickIcon: 'search',
    getValue: (_, f) => f.value?.name,
    click: async (_, f) => {
        await openDialog((await import("../common/select-volunteers/select-volunteers.component")).SelectVolunteersComponent, x => x.args = {
            onSelect: u => f.value = u,
            title: f.metadata.caption,
            usersLangs: f.value.langs
        })
    }
})
@Entity<Users>(
    "Users",
    {
        allowApiRead: true,
        allowApiUpdate: Allow.authenticated,
        allowApiDelete: Roles.admin,
        allowApiInsert: Roles.manager,
        defaultOrderBy: {
            admin: "desc",
            donor: "desc",
            board: "desc",
            manager: "desc",
            bid: "desc",
            name: "asc"
        }
    },
    (options, remult) => {
        options.apiPrefilter = () => {

            if (!remult.authenticated())
                return { id: [] }//why not simple empty-string? ''
            return { bid: remult.branchAllowedForUser() };
        };
        options.validation = async (user) => {
            let ok = true;
            if (user.manager || user.volunteer) {
                if (!user.bid) {
                    throw user.$.bid!.metadata.caption + ': ' + terms.requiredField;
                }
                ok &&= (user.bid.id && user.bid.id.length > 0 ? true : false);
                if (!ok!) {
                    user.bid._.error = user.$.bid!.metadata.caption + ': ' + terms.requiredField;
                }
            }
        };
        options.saving = async (user) => {
            if (isBackend()) {
                if (user._.isNew()) {
                    await user.hashAndSetPassword(
                        process.env.DEFAULT_PASSWORD!
                    );
                    user.created = new Date();
                    // user.createdBy = await remult.repo(Users).findId(remult.user.id);
                    if ((await remult.repo(Users).count()) == 0)
                        user.admin = true;// If it's the first user, make it an admin
                }
                else {
                    user.modified = new Date();
                    // user.modifiedBy = await remult.repo(Users).findId(remult.user.id);
                }
                if (user.admin || user.donor || user.board) {
                    user.bid = undefined;
                }
            }
        };
        // options.saved = async (user) => {
        //     if (isBackend()) {
        //         if (user.$.name.originalValue !== user.name) {
        //             //it was changed
        //             for await (const v of remult.repo(Tenant).iterate()) {
        //                 if (v.defVids.length > 0) {
        //                     let f = v.defVids.find(r => r.id === user.id);
        //                     if (f) {
        //                         f.name = user.name;
        //                         await v.save();
        //                     }
        //                 }
        //             }

        //             for await (const a of remult.repo(Activity).iterate()) {
        //                 if (a.vids.length > 0) {
        //                     let f = a.vids.find(r => r.id === user.id);
        //                     if (f) {
        //                         f.name = user.name;
        //                         await a.save();
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
    }
)
export class Users extends IdEntity {

    constructor(private remult: Remult, private dialog: DialogService) {
        super();
    }

    isManager() {
        return this.remult.isAllowed(Roles.manager);
    }

    // activities = new OneToMany(this.remult.repo(ActivitiesVolunteers), {
    //     where: _ => _.u!.isEqualTo(this)
    // })

    static fromString(str: string, remult?: Remult) {
        // console.log(str);
        let split = str.toString().split(',');
        // console.log(split);
        let result = [] as Users[];
        split.forEach(async id => {
            let found = await remult?.repo(Users).findId(id);
            if (found) {
                result.push(found);
            }
        });
        return result;
    }

    @Field({
        caption: terms.branch,
        allowNull: true
    })
    bid?: Branch;

    @Field({
        caption: terms.username,
        validate: [
            StringRequiredValidation,
            (e, c) => {
                if (isBackend())
                    Validators.unique(e, c)
            }]
    })
    name: string = '';

    // @Field<Users>((options, remult) => options.serverExpression = async user => await remult.repo(Users).count())
    // numOfActivities: number = 0;

    @DataControl<Users, Langs[]>({
        hideDataOnInput: true,
        clickIcon: 'search',
        getValue: (r, v) => { return v && v.value ? v.value.map(i => i.caption).join(', ').trim() : ''; },
        // getValue : (r,v) => {v.displayValue},
        click: async (_, f) => {
            await openDialog((await import("../common/select-langs/select-langs.component")).SelectLangsComponent, x => x.args = {
                // onSelect: site => f.value = site,
                // title: f.metadata.caption,
                langs: f.value
            })
        }
    })
    @CommaSeparatedStringArrayField<Users>({ caption: terms.langs })
    langs: Langs[] = [Langs.hebrew];

    @Field({
        validate: [StringRequiredValidation, Validators.unique],
        caption: terms.mobile
    })
    mobile: string = '';

    @Field<Users, string>({
        caption: terms.email,
        validate: [(e, c) => {
            // if (isBackend()) {
            if (e.volunteer) {
                Validators.required(e, c, terms.requiredField)
            }
            // }
        }]
    })
    email: string = '';

    @Field({ caption: terms.linkClicked })
    clickedLink: boolean = false;

    @DataControl<Users, Date>({
        valueChange: (r, _) => { r.calcAge(); }
    })
    @DateOnlyField({
        caption: terms.birthday
    })
    birthday!: Date;

    @DataControl<Tenant, number>({
        width: '60',
        readonly: true
    })
    @Field({ caption: terms.age })
    age: number = 0;

    @Field(options => options.valueType = Tenant, { caption: terms.tenant })
    defTid!: Tenant;

    // @DataControl<Users, number>({
    //     clickIcon: 'help',
    //     click: async (r, v) => await r.showPointsExplain()
    // })
    @IntegerField({ caption: terms.pointsYouHave })//.replace('!success!', pointsEachSuccessActivity.toString()).replace('!upload!', pointsEachSuccessPhoto.toString()) })
    points: number = 0;

    @Field({ includeInApi: false })
    password: string = '';

    @Field({
        allowApiUpdate: false
    })
    created: Date = new Date();

    // @Field({
    //     allowApiUpdate: false
    // })
    // createdBy: Users = null!;

    @Field({
        allowApiUpdate: false
    })
    modified: Date = new Date();

    // @Field({
    //     allowApiUpdate: false
    // })
    // modifiedBy: Users = null!;

    @Field({
        allowApiUpdate: Roles.admin,
        caption: terms.admin
    })
    admin: Boolean = false;

    @Field({
        allowApiUpdate: Roles.board,
        caption: terms.donor
    })
    donor: Boolean = false;

    @Field({
        allowApiUpdate: Roles.board,
        caption: terms.board
    })
    board: Boolean = false;

    @Field({
        allowApiUpdate: Roles.board,
        caption: terms.manager
    })
    manager: Boolean = false;

    @Field({
        allowApiUpdate: Roles.manager,//by adding new volunteer for his branch
        caption: terms.volunteer
    })
    volunteer: Boolean = false;

    @Field({ caption: terms.active })
    active: boolean = true;

    async showPointsExplain() {
        let message = '';
        message += `כל דיווח מוצלח = ${pointsEachSuccessActivity} נקודות`;
        message += "\n";
        message += `כל העלאת תמונה או וידאו = ${pointsEachSuccessPhoto} נקודות`;
        message += "\n";
        message += "\n";
        message += `על כל ${pointsForSurprise} מקבלים הפתעה`;
        if (this.dialog) {
            await this.dialog.error(message);
        }
    }

    calcAge() {
        let result = 0;
        if (this.birthday && this.birthday.getFullYear() > 1900) {
            let today = new Date();
            result = Math.max(1, today.getFullYear() - this.birthday.getFullYear());
        }
        this.age = result;
    }

    hasValidBranch() {
        let result = true;
        if (!this.board && this.volunteer) {
            result &&= this.bid && this.bid.id && this.bid.id.length > 0 ? true : false;
        }
        return result;
    }
    async hashAndSetPassword(password: string) {
        this.password = (await import('password-hash')).generate(password);
    }
    async passwordMatches(password: string) {
        return !this.password || (await import('password-hash')).verify(password, this.password);
    }
    @BackendMethod({ allowed: true })
    async create(password: string = '') {
        // console.log(this);
        if (!password || password.trim().length === 0) {
            password = process.env.DEFAULT_PASSWORD!;
        }
        if (!this._.isNew())
            throw new Error(terms.invalidOperation);
        await this.hashAndSetPassword(password);
        await this._.save();
    }
    @BackendMethod({ allowed: Allow.authenticated })
    async updatePassword(password: string) {
        if (this._.isNew() || this.id != this.remult.user.id && !this.remult.isAllowed(Roles.admin)) {
            // if (this._.isNew() || this.id != this.remult.user.id)
            throw new Error(terms.invalidOperation);
        }
        await this.hashAndSetPassword(password);
        await this._.save();
    }
}
export class PasswordControl extends InputField<string>
{
    constructor(caption = terms.password) {
        super({ caption, inputType: InputTypes.password, defaultValue: () => '' });
    }
}

