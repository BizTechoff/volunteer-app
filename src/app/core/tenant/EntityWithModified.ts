import { Field, IdEntity, isBackend } from "remult";





export class EntityWithModified extends IdEntity {
    @Field<EntityWithModified>({
        allowApiUpdate: false,
        saving: self => {
            if (self.isNew() && isBackend())
                self.created = new Date();
        }
    })
    created: Date = new Date();

    @Field<EntityWithModified>({
        allowApiUpdate: false
    }, (options, remult) => {

        options.saving = (tenant) => {
            if (tenant.isNew() && isBackend())
                tenant.createdBy = remult.user.id;
        };
    })
    createdBy: string = null!;

    @Field<EntityWithModified>({
        allowApiUpdate: false,
        saving: self => {
            if (!self.isNew() && isBackend())
                self.modified = new Date()
        }
    })
    modified: Date = new Date();

    @Field<EntityWithModified>({
        allowApiUpdate: false
    }, (options, remult) => {

        options.saving = (tenant) => {
            if (!tenant.isNew() && isBackend())
                tenant.modifiedBy = remult.user.id;
        };
    })
    modifiedBy: string = null!;
}
