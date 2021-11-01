import { DataControl } from "@remult/angular";
import { Allow, Entity, Field, IdEntity, isBackend, Remult, ValueListFieldType } from "remult";
import { ValueListValueConverter } from "remult/valueConverters";
import { terms } from "../terms";
import { Roles } from "../users/roles";

@Entity<Photo>('photos',
    {
        allowApiInsert: Roles.volunteer,
        allowApiDelete: Roles.manager,
        allowApiUpdate: false,
        allowApiRead: Allow.authenticated
    },
    (options, remult) => {
        options.saving = async (act) => {
            if (isBackend()) {
                if (act._.isNew()) {
                }
            }
        }
    })
export class Photo extends IdEntity {
 
    @Field({ caption: terms.desc })
    desc: string = '';

    @Field({ caption: terms.status })
    status: string = '';

    @Field({ caption: terms.data })
    data: string = '';

    @Field({ caption: terms.entityType })
    entType: string = '';

    @Field({ caption: terms.entityId })
    entId: string = '';

}

@DataControl({
    // valueList: async remult => DeliveryStatus.getOptions(remult)
    // , width: '150'

})
@ValueListFieldType(PhotoStatus, {
    // displayValue: (e, val) => val.caption,
    // translation: l => l.deliveryStatus
})
export class PhotoStatus {
    static none = new PhotoStatus(0, 'ללא');
    static clean = new PhotoStatus(1, 'פעיל');
    static friendly = new PhotoStatus(2, 'לא פעיל');

    constructor(public id: number, public desc: string) { }
    // id:number;

    static getOptions(remult: Remult) {
        let op = new ValueListValueConverter(PhotoStatus).getOptions();
        return op;
    }
}
