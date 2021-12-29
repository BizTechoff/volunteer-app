import { DataControl, openDialog } from "@remult/angular";
import { Entity, Field, IdEntity, Remult } from "remult";
import { ColorNumberValidator, EmailValidator, StringRequiredValidation } from "../../common/globals";
import { SelectBranchComponent } from "../../common/select-branch/select-branch.component";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";



@DataControl<any, Branch>({
    hideDataOnInput: true,
    clickIcon: 'search',
    getValue: (_, f) => f.value?.name,
    click: async (_, f) => {
        await openDialog(SelectBranchComponent, x => x.args = {
            onClear: () => {
                if (f.value) {
                    f.value = undefined!;
                    if (f.valueChanged) {
                        f.valueChanged();
                    }
                }
            },
            onSelect: b => {
                if (!f.value || f.value.id !== b.id) {
                    f.value = b;
                    if (f.valueChanged) {
                        f.valueChanged();
                    }
                }
            },
            title: f.metadata.caption
        })
    }
})
@Entity<Branch>('branches', {
    allowApiDelete: false,
    allowApiInsert: false,
    allowApiUpdate: true,
    allowApiRead: c => c.authenticated(),
    // allowApiInsert: Roles.admin,
    // allowApiDelete: Roles.admin,
    // allowApiUpdate: Roles.admin,
    // allowApiRead: Allow.authenticated
    defaultOrderBy: { name: "asc" }
},
    (options, remult) => {
        // options.apiPrefilter = () => {
        //     return {
        //         id: remult.branchAllowedForUser()
        //     }
        // }
        options.apiPrefilter = async () => ({
            id: !remult.isAllowed(Roles.board) ? remult.user.bid : undefined
        })
    }
)
export class Branch extends IdEntity {

    @Field({ caption: terms.name, validate: StringRequiredValidation })
    name: string = '';

    @Field({ caption: terms.address, validate: StringRequiredValidation })
    address: string = '';

    @Field({ caption: terms.email, validate: EmailValidator })
    email: string = '';

    @Field({ caption: terms.color, validate: ColorNumberValidator })
    color: number = 1;

    @Field({ caption: terms.frame })
    frame: string = '';

    @Field<Branch>((options, remult) => {
        if (1 == 1) {
            options.serverExpression = async branch => {
                return remult.repo((await import("../../users/users")).Users).count({ bid: branch, volunteer: true })
            };
        }
        else {
            options.sqlExpression = () => "( select count(*) from users where users.bid = branches.id && users.volunteer = 'true' )";
        }
    })
    volunteersCount = 0;

    @Field<Branch>((options, remult) => {
        if (1 == 1) {
            options.serverExpression = async branch => {
                return remult.repo((await import("../tenant/tenant")).Tenant).count({ bid: branch })
            };
        }
        else {
            options.sqlExpression = () => "( select count(*) from tenants where tenants.bid = branches.id )";
        }
    })
    tenantsCount = 0;

    constructor(private remult: Remult) {
        super();
    }

    // getVolunteersCount() {
    //     if (this.volunteersCount !== undefined)
    //         return this.volunteersCount;
    //     this.volunteersCount = 0;
    //     this.remult.repo(Users).count({volunteer: true, bid: this}).then(result => { this.volunteersCount = result; })
    //     return this.volunteersCount;
    // }

    // getTenantsCount() {
    //     if (this.tenantsCount !== undefined)
    //         return this.tenantsCount;
    //     this.tenantsCount = 0;
    //     this.remult.repo(Tenant).count({bid: this}).then(result => { this.tenantsCount = result; })
    //     return this.tenantsCount;
    // }

    isBranch(name: string) {
        let result = this.email.includes(name);
        // console.log('isBranch', name, result);

        return result;
    }

}
