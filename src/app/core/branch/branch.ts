import { DataControl, openDialog } from "@remult/angular";
import { Allow, Entity, Field, IdEntity } from "remult";
import { ColorNumberValidator, EmailValidator, FILTER_IGNORE, StringRequiredValidation } from "../../common/globals";
import { SelectBranchComponent } from "../../common/select-branch/select-branch.component";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";

@DataControl<any, Branch>({
    hideDataOnInput: true,
    clickIcon: 'search',
    getValue: (_, f) => f.value?.name,
    click: async (_, f) => {
        await openDialog(SelectBranchComponent, x => x.args = {
            onClear: () => f.value = undefined!,
            onSelect: u => f.value = u,
            title: f.metadata.caption
        })
    }
})
@Entity<Branch>('branches', {
    allowApiCrud : true,
    // allowApiInsert: Roles.admin,
    // allowApiDelete: Roles.admin,
    // allowApiUpdate: Roles.admin,
    // allowApiRead: Allow.authenticated
    defaultOrderBy: (row) => [row.name]
}, 
    (options, remult) => {
        options.apiPrefilter = async (b) => {
            let result = FILTER_IGNORE;
            if (!remult.isAllowed(Roles.board)) {
                return b.id.isEqualTo(remult.user.bid);
            }
            return result;
        }
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

    isBranch(name:string){
        let result =  this.email.includes(name);
        // console.log('isBranch', name, result);
        
        return result;
    }

}
