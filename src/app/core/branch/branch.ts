import { DataControl, openDialog } from "@remult/angular";
import { Entity, EntityFilter, Field, FieldRef, Filter, Remult, SqlDatabase } from "remult";
import { ColorNumberValidator, EmailValidator, StringRequiredValidation } from "../../common/globals";
import { SelectBranchComponent } from "../../common/select-branch/select-branch.component";
import { UserIdName } from "../../common/types";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";
import { Users } from "../../users/users";
import { EntityWithModified } from "../EntityWithModified";



@DataControl<any, Branch | undefined>({
    hideDataOnInput: true,
    clickIcon: 'search',
    getValue: (_, f) => f.value?.name,
    click: Branch.selectBranch() //([], (_,value) => remult.user.branch = value )
})
@Entity<Branch>('branches', (options, remult) => {
    options.allowApiDelete = false
    options.allowApiInsert = false
    options.allowApiUpdate = Roles.admin
    options.allowApiRead = true
    options.defaultOrderBy = { name: "asc" }
    // options.backendPrefilter = () => remult.branchAllowedForUser()
    // options.backendPrefilter = { id: remult.user.isBoardOrAbove ? undefined : remult.user.branch }
})
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
        options.sqlExpression = (branch) => `( select count(*) from users where users.bid = branches.id and users.volunteer = 'true' )`
        // if (false) {
        //     options.serverExpression = async branch => {
        //         return remult.repo((await import("../../users/users")).Users).count({ bid: branch, volunteer: true })
        //     };
        // }
        // else {
        //     options.sqlExpression = (branch) => `( select count(*) from users where users.bid = branches.id and users.volunteer = 'true' )`;
        //     // options.sqlExpression = (branch) => `( select count(*) from users where users.bid = branches.id && users.volunteer = 'true' )`;
        // }
    })
    volunteersCount = 0;

    @Field<Branch>((options, remult) => {
        options.caption = terms.tenants
        // options.sqlExpression = (branch) => `( select count(*) from tenants where tenants.bid = branches.id )`
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

    // @DataControl({field: disabled-sort})
    @Field<Branch>((options, remult) => {
        options.caption = terms.activities;


        // options.sqlExpression = (branch) => `( select count(*) from activities where activities.bid = branches.id )`
        // options.sqlExpression = (branch) => `( select count(*) from users where users.bid = branches.id and users.volunteer = 'true' )`;
        options.serverExpression = async branch => {
            return remult.repo((await import("../activity/activity")).Activity).count({ bid: branch })//, status: ActivityStatus.openStatuses
        };
    })
    activitiesCount = 0;

    @Field<Branch>((options, remult) => {
        options.caption = terms.uploads;
        options.serverExpression = async branch => {
            return remult.repo((await import("../photo/photo")).Photo).count({ bid: branch })//, status: ActivityStatus.openStatuses
        };
    })
    photosCount = 0;

    @Field<Branch>((options, remult) => {
        options.caption = terms.foods;
        // options.
        options.serverExpression = async branch => {
            // let count = 0;
            // for await (const a of remult.repo((await import("../activity/activity")).Activity).query({
            //     where: { bid: branch, foodDelivered: true }
            // })) {
            //     count += a.foodCount.id
            // }
            // return count;
            return remult.repo((await import("../activity/activity")).Activity).count({ bid: branch, foodDelivered: true })//, status: ActivityStatus.openStatuses
        };
        // options.sqlExpression = async branch => {
        //     return `(select sum(foodCount) from activities where bid = ${branch} and foodDelivered = 'true')`
        // }
    })
    foodDeliveries = 0;

    @Field<Branch>((options, remult) => {
        options.caption = terms.assigns
        if (1 == 1) {
            let empty: UserIdName[] = [] as UserIdName[];
            options.serverExpression = async branch => {
                return remult.repo((await import("../tenant/tenant")).Tenant).count({ bid: branch, defVids: { "$contains": '"id":' } })
            };
        }
        else {
            options.sqlExpression = () => "( select count(*) from tenants where tenants.bid = branches.id )";
        }
    })
    assignCount = 0;

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
    static hasVolunteer = Filter.createCustom<Branch, string>(async (remult, val) => {
        const volunteers = await remult.repo(Users).find({
            where: {
                volunteer: true,
                name: { $contains: val }
            }
        });
        const ids: string[] = [...volunteers.map(v => v.bid), ...volunteers.map(v => v.branch2)].filter(v => v).map(v => v!.id);
        var result: EntityFilter<Branch> = {
            id: ids
        };
        return result;
    });

    static nameStartsWith = Filter.createCustom<Branch, string>(async (remult, val) => {
        //this code will always run on the backend



        return SqlDatabase.customFilter((x) => {
            x.sql = `name like ${x.addParameterAndReturnSqlToken(val)}||'%'`;
            console.log(x.sql);
        })
    });

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
