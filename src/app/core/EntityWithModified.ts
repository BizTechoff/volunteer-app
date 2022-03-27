import { Field, IdEntity, isBackend } from "remult";
import { datetimeFormat } from "../common/utils";
import { terms } from "../terms";
import { Users } from "../users/users";





export class EntityWithModified extends IdEntity {
    @Field<EntityWithModified, Date>({
        caption: terms.created,
        displayValue: (row,col) => datetimeFormat(col),
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
        options.valueType = Users;
        options.saving = (tenant) => {
            if (tenant.isNew() && isBackend())
                tenant.$.createdBy.setId(remult.user.id);
        };
    })
    createdBy: IUser = null!;

    @Field<EntityWithModified, Date>({
        caption: terms.modified,//
        displayValue: (row,col) => datetimeFormat(col),
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
        options.valueType = Users;
        options.saving = (tenant) => {
            if (!tenant.isNew() && isBackend())
                tenant.$.modifiedBy.setId(remult.user.id);
            // tenant.modifiedBy = remult.user;
        };
    })
    modifiedBy: IUser = null!;
}

export interface IUser {
    id: string;
    name: string;
}