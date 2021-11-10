import { DataControl, openDialog } from "@remult/angular";
import { Allow, Entity, Field, IdEntity } from "remult";
import { FILTER_IGNORE, StringRequiredValidation } from "../../common/globals";
import { SelectBranchComponent } from "../../common/select-branch/select-branch.component";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";

@DataControl<any, Branch>({
    hideDataOnInput: true,
    clickIcon: 'search',
    getValue: (_, f) => f.value?.name,
    click: async (_, f) => {
        await openDialog(SelectBranchComponent, x => x.args = {
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

}
