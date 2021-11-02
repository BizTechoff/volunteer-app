
import { InputField } from "@remult/angular";
import { Allow, BackendMethod, DateOnlyField, Entity, Field, IdEntity, isBackend, Remult, Validators } from "remult";
import { InputTypes } from "remult/inputTypes";
import { terms } from "../terms";
import { Roles } from './roles';

@Entity<Users>("Users", {
    allowApiRead: Allow.authenticated,
    allowApiUpdate: Allow.authenticated,
    allowApiDelete: Roles.admin,
    allowApiInsert: Roles.admin
},
    (options, remult) => {
        options.defaultOrderBy = (user) => [
            user.admin.descending(),
            user.board.descending(),
            user.manager.descending(),
            user.name
        ];
        options.apiPrefilter = (user) => {
            if (!(remult.isAllowed(Roles.board)))// include admin
            {
                if (!remult.isAllowed(Roles.manager)) {
                    return user.id.isEqualTo(remult.user.id);
                }
                return user.bid.isEqualTo(remult.user.bid);
            }
            return undefined!;
        };
        options.validation = async (user) => {
            let ok = true;
            console.log('ValidBranchValidation-1');

            if (!user.board && user.volunteer) {
                console.log('ValidBranchValidation-2');
                ok &&= user.bid && user.bid && user.bid.length > 1 ? true : false;
                ok &&= user.bid !== '0';
            }
            console.log('ValidBranchValidation-3');
            if (!ok!) {
                console.log('ValidBranchValidation-4');
                user._.error = terms.requiredField;
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
    @Field({
        validate: [Validators.required, Validators.unique],
        caption: terms.username
    })
    name: string = '';
    @Field<Users>((options, remult) => options.serverExpression = async user => await remult.repo(Users).count())
    numOfActivities: number = 0;

    @Field({
        validate: [Validators.required, Validators.unique],
        caption: terms.mobile
    })
    mobile: string = '';

    @Field({
        // validate: [Validators.required, Validators.unique],
        caption: terms.email
    })
    email: string = '';

    @DateOnlyField({
        caption: terms.birthday
    })
    birthday!: Date;

    @Field({
        caption: terms.tenant
    })
    defTid: string = '';

    @Field({
        caption: terms.branch
    })
    bid: string = '';
 
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
        allowApiUpdate: Roles.admin,
        caption: terms.board
    })
    board: Boolean = false;

    @Field({
        allowApiUpdate: Roles.admin,
        caption: terms.manager
    })
    manager: Boolean = false;

    @Field({
        allowApiUpdate: Roles.admin,
        caption: terms.volunteer
    })
    volunteer: Boolean = false;

    constructor(private remult: Remult) {
        super();
    }

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
    async create(password: string) {
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
