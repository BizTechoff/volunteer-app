import { Field, IdEntity, isBackend } from "remult";
import { Users } from "../../users/users";




export class EntityWithModified extends IdEntity {
    @Field<EntityWithModified>({
        allowApiUpdate: false,
        saving: self => {
            if (self.isNew())
                self.modified = new Date();
        }
    })
    created: Date = new Date();
 
    @Field<EntityWithModified>({
        allowApiUpdate: false
    }, (options, remult) => {

        options.saving = (tenant) => {
            if (tenant.isNew() && isBackend())
                tenant.$.createdBy.setId(remult.user.id);
        };
    })
    createdBy: Users = null!;

    @Field<EntityWithModified>({
        allowApiUpdate: false,
        saving: self => self.modified = new Date()
    })
    modified: Date = new Date();
    @Field<EntityWithModified>({
        allowApiUpdate: false
    }, (options, remult) => {

        options.saving = (tenant) => {
            if (!tenant.isNew() && isBackend())
                tenant.$.modifiedBy.setId(remult.user.id);
        };
    })
    modifiedBy: Users = null!;
}
