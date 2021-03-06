import { DataControl } from "@remult/angular";
import { Allow, Entity, EntityBase, Field, isBackend, Remult, ValueListFieldType } from "remult";
import { ValueListValueConverter } from "remult/valueConverters";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";
import { Users } from "../../users/users";
import { Branch } from "../branch/branch";


@ValueListFieldType()
export class ActiveStatus {
    static on = new ActiveStatus();
    static off = new ActiveStatus();
    constructor() { }
}


@Entity<Photo>('photos',
    {
        allowApiInsert: Roles.volunteer,
        allowApiDelete: Roles.manager,
        allowApiUpdate: false,
        allowApiRead: true// Allow.authenticated
    },
    (options, remult) => {
        options.apiPrefilter = () => {
            if (!remult.authenticated())
                return { id: [] }//why not simple empty-string? ''
            return { bid: remult.branchAllowedForUser() };
        };
        options.saving = async (row) => {
            if (isBackend()) {
                if (row._.isNew()) {
                    if (row.id.length === 0) {
                        const { v4: uuidv4 } = require('uuid');
                        row.id = uuidv4()
                    }
                    row.created = new Date();
                    row.createdBy = await remult.repo(Users).findId(remult.user.id);
                }
            }
        };
    })
export class Photo extends EntityBase {

    @Field() //({dbReadOnly, includeInApi, allowApiUpdate})
    id: string = ''

    @Field({ caption: terms.branch, includeInApi: Allow.authenticated })
    bid!: Branch;

    @Field({ caption: terms.entityId })
    eid: string = '';

    @Field({ caption: terms.public })
    public: boolean = true;

    @Field({ caption: terms.status })
    status: ActiveStatus = ActiveStatus.on;

    @Field({ caption: terms.desc })
    title: string = '';

    @Field({ caption: terms.type })
    type: string = '';

    @Field({ caption: terms.link })
    link: string = '';

    // @Field({ caption: terms.data })
    // data: string = '';

    @Field({ caption: terms.createdBy })
    createdBy!: Users;

    @Field({ caption: terms.created })
    created: Date = new Date();

}

@DataControl({
    // valueList: async remult => DeliveryStatus.getOptions(remult)
    // , width: '150'

})
@ValueListFieldType({
    // displayValue: (e, val) => val.caption,
    // translation: l => l.deliveryStatus
})
export class PhotoStatus {
    static none = new PhotoStatus(0, '??????');
    static clean = new PhotoStatus(1, '????????');
    static friendly = new PhotoStatus(2, '???? ????????');

    constructor(public id: number, public desc: string) { }
    // id:number;

    static getOptions(remult: Remult) {
        let op = new ValueListValueConverter(PhotoStatus).getOptions();
        return op;
    }
}
