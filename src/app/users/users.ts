
import { DataControl, InputField, openDialog } from "@remult/angular";
import { Allow, BackendMethod, DateOnlyField, Entity, Field, FieldOptions, IdEntity, isBackend, OneToMany, Remult, Validators, ValueListFieldType } from "remult";
import { InputTypes } from "remult/inputTypes";
import { ValueListValueConverter } from "remult/valueConverters";
import { FILTER_IGNORE, StringRequiredValidation } from "../common/globals";
import { SelectLangsComponent } from "../common/select-langs/select-langs.component";
import { SelectVolunteersComponent } from "../common/select-volunteers/select-volunteers.component";
import { ActivitiesVolunteers } from "../core/activity/activity-volunteer";
import { CommaSeparatedStringArrayField } from "../core/tenant/tenant";
import { terms } from "../terms";
import { Roles } from './roles';


@ValueListFieldType(Langs, { /*displayValue: () => {return '';}*/ /*multi: true*/ })
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
@DataControl<any, Users>({
    hideDataOnInput: true,
    clickIcon: 'search',
    getValue: (_, f) => f.value?.name,
    click: async (_, f) => {
        await openDialog(SelectVolunteersComponent, x => x.args = {
            onSelect: u => f.value = u,
            title: f.metadata.caption,
            usersLangs: f.value.langs
        })
    }
})
@Entity<Users>("Users", {
    allowApiRead: Allow.authenticated,
    allowApiUpdate: Allow.authenticated,
    allowApiDelete: Roles.admin,
    allowApiInsert: Roles.manager,
    defaultOrderBy: (user) => [
        user.admin.descending(),
        user.board.descending(),
        user.manager.descending(),
        user.name
    ]
},
    (options, remult) => {
        // options.defaultOrderBy = (user) => [
        //     user.admin.descending(),
        //     user.board.descending(),
        //     user.manager.descending(),
        //     user.name
        // ];
        options.apiPrefilter = (user) => {
            let active = FILTER_IGNORE;// user.active.isEqualTo(true);
            if (!(remult.isAllowed(Roles.board)))// all
            {
                if (!remult.isAllowed(Roles.manager)) {
                    return active.and(user.id.isEqualTo(remult.user.id));//volunteer only himself
                }
                return active.and(user.bid.isEqualTo(remult.user.bid));//manager only his branch
            }
            return active;
        };
        options.validation = async (user) => {
            let ok = true;
            // console.log('ValidBranchValidation-1');

            if (!user.board && user.volunteer) {
                // console.log('ValidBranchValidation-2');
                ok &&= user.bid && user.bid && user.bid.length > 0 ? true : false;
                ok &&= user.bid !== '0';
            }
            // console.log('ValidBranchValidation-3');
            if (!ok!) {
                // console.log('ValidBranchValidation-4');
                user.$.bid.error = user.$.bid.metadata.caption + ': ' + terms.requiredField;
            }
        }
        options.saving = async (user) => {
            if (isBackend()) {
                if (user._.isNew()) {
                    user.createDate = new Date();
                    if ((await remult.repo(Users).count()) == 0)
                        user.admin = true;// If it's the first user, make it an admin
                }
                if (user.board) {//include admin
                    if (!user.bid || user.bid.length < 1 || user.bid !== '0') {
                        user.bid = '0';
                    }
                }
            }
        };
    }
)
export class Users extends IdEntity {
    
    constructor(private remult: Remult) {
        super();
    }

    // activities = new OneToMany(this.remult.repo(ActivitiesVolunteers), {
    //     where: _ => _.u!.isEqualTo(this)
    // })

    static async fromString(str: string, remult?:Remult) {
        // console.log(str);
        let split = str.toString().split(',');
        // console.log(split);
        let result = [] as Users[];
        split.forEach(async l => { 
            let found = await remult?.repo(Users).findId(l);
            if (found) {
                result.push(found);
            }
        });
        return result;
    }

    @Field({
        caption: terms.branch
    })
    bid: string = '';

    @Field({
        validate: [StringRequiredValidation, Validators.unique],
        caption: terms.username
    })
    name: string = '';

    @Field<Users>((options, remult) => options.serverExpression = async user => await remult.repo(Users).count())
    numOfActivities: number = 0;

    

    @DataControl<Users, Langs[]>({
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
    @CommaSeparatedStringArrayField<Users>({ caption: terms.langs })
    langs: Langs[] = [Langs.hebrew];
 
    @Field({
        validate: [StringRequiredValidation, Validators.unique],
        caption: terms.mobile
    })
    mobile: string = '';

    @Field({
        // validate: [Validators.required, Validators.unique],
        caption: terms.email
    })
    email: string = '';

    @Field({caption: terms.linkClicked})
    clickedLink: boolean = false;

    @DateOnlyField({
        caption: terms.birthday
    })
    birthday!: Date;

    @Field({
        caption: terms.tenant
    })
    defTid: string = '';

    @Field({ includeInApi: false })
    password: string = '';

    @Field({
        allowApiUpdate: false
    })
    createDate: Date = new Date();

    @Field({
        allowApiUpdate: Roles.admin,
        caption: terms.admin
    })
    admin: Boolean = false;

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


    hasValidBranch() {
        let result = true;
        if (!this.board && this.volunteer) {
            result &&= this.bid && this.bid.length > 1 ? true : false;
            result &&= this.bid !== '0';
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
