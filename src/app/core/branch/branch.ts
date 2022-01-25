import { DataControl, openDialog } from "@remult/angular";
import { Entity, Field, FieldRef, Remult } from "remult";
import { ColorNumberValidator, EmailValidator, StringRequiredValidation } from "../../common/globals";
import { SelectBranchComponent } from "../../common/select-branch/select-branch.component";
import { terms } from "../../terms";
import { EntityWithModified } from "../EntityWithModified";



@DataControl<any, Branch | undefined>({
    hideDataOnInput: true,
    clickIcon: 'search',
    getValue: (_, f) => f.value?.name,
    click: Branch.selectBranch()
})
@Entity<Branch>('branches', {
    allowApiDelete: false,
    allowApiInsert: false,
    allowApiUpdate: true,
    allowApiRead: c => true,
    // allowApiInsert: Roles.admin,
    // allowApiDelete: Roles.admin,
    // allowApiUpdate: Roles.admin,
    // allowApiRead: Allow.authenticated
    defaultOrderBy: { name: "asc" }
},
    (options, remult) => {
        // options.apiPrefilter = () => (
        //     { id: remult.branchAllowedForUser() }
        // )
        // { bid: !remult.isAllowed(Roles.board) ? { $id: remult.user.bid } : undefined }
        // options.apiPrefilter = () => {
        //     return {
        //         id: remult.branchAllowedForUser()
        //     }
        // }
        // options.apiPrefilter = async () => ({
        //     id: remult.branchAllowedForUser()
        //     // id: !remult.isAllowed(Roles.board) ? remult.user.bid : undefined
        // })
    }
)
export class Branch extends EntityWithModified {

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
        options.caption = terms.volunteers
        if (true) {
            options.serverExpression = async branch => {
                return remult.repo((await import("../../users/users")).Users).count({ bid: branch, volunteer: true })
            };
        }
        else {
            options.sqlExpression = (branch) => `( select count(*) from users where users.bid = '${branch.key}' && users.volunteer = 'true' )`;
            // options.sqlExpression = (branch) => `( select count(*) from users where users.bid = branches.id && users.volunteer = 'true' )`;
        }
    })
    volunteersCount = 0;

    // @DataControl({field: disabled-sort})
    @Field<Branch>((options, remult) => {
        options.caption = terms.activities;
        options.serverExpression = async branch => {
            return remult.repo((await import("../activity/activity")).Activity).count({ bid: branch })//, status: ActivityStatus.openStatuses
        };
    })
    activitiesCount = 0;

    @Field<Branch>((options, remult) => {
        options.caption = terms.photos;
        options.serverExpression = async branch => {
            return remult.repo((await import("../photo/photo")).Photo).count({ bid: branch })//, status: ActivityStatus.openStatuses
        };
    })
    photosCount = 0;

    @Field<Branch>((options, remult) => {
        options.caption = terms.tenants
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
    static selectBranch<containerType = any>(explicit?: string[], change?: (e: containerType, b?: string) => void) {
        return (container: containerType, f: FieldRef<any, Branch | undefined>) => {

            if (!explicit) {
                explicit = [] as string[]
            }
            openDialog(SelectBranchComponent, x => x.args = {
                explicit: explicit,
                canSelectAll: true,
                onSelect: b => {
                    // console.log('select');
                    if (f.value != b) {
                        f.value = b;
                        if (change) {
                            // console.log('change');
                            change(container, b?.id);
                        }
                    }
                },
                title: f.metadata.caption
            })
        }
    }

}
