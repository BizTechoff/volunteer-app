import { DataControl } from "@remult/angular";
import { Allow, DateOnlyField, Entity, Field, IdEntity, isBackend, Remult, ValueListFieldType } from "remult";
import { ValueListValueConverter } from 'remult/valueConverters';
import { terms } from "../../terms";
import { Roles } from "../../users/roles";

@Entity<Activity>('activities',
    {
        allowApiInsert: Roles.manager,
        allowApiDelete: Roles.manager,
        allowApiUpdate: Allow.authenticated,
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
export class Activity extends IdEntity {

    // constructor(private remult: Remult){super();}

    @Field({ caption: terms.type })
    type: ActivityType = ActivityType.none;

    @Field({ caption: terms.title })
    title: string = '';

    @Field({ caption: terms.subTitle })
    subTitle: string = '';

    @Field({ caption: terms.tenant })
    tid: string = '';

    @Field({ caption: terms.volunteers })
    vids: string[] = [];

    @DateOnlyField({ caption: terms.date })
    date: Date = new Date();

    @Field({ caption: terms.fromHour })
    fh: string[] = [];

    @Field({ caption: terms.toHour })
    th: string[] = [];

    @Field({ caption: terms.status })
    status: ActivityStatus = ActivityStatus.none;

    @Field({ caption: terms.photos })
    photoIds: string[] = [];

}

@DataControl({
    // valueList: async remult => DeliveryStatus.getOptions(remult)
    // , width: '150'

})
@ValueListFieldType(ActivityType, {
    // displayValue: (e, val) => val.caption,
    // translation: l => l.deliveryStatus
})
export class ActivityType {
    static none = new ActivityType(0, 'ללא');
    static clean = new ActivityType(1, 'ניקיון');
    static friendly = new ActivityType(1, 'חברותא');

    constructor(public id: number, public desc: string) { }
    // id:number;

    static getOptions(remult: Remult) {
        let op = new ValueListValueConverter(ActivityType).getOptions();
        return op;
    }
}

@DataControl({
    // valueList: async remult => DeliveryStatus.getOptions(remult)
    // , width: '150'

})
@ValueListFieldType(ActivityStatus, {
    // displayValue: (e, val) => val.caption,
    // translation: l => l.deliveryStatus
})
export class ActivityStatus {
    static none = new ActivityStatus(0, 'ללא');
    static clean = new ActivityStatus(1, 'ניקיון');
    static friendly = new ActivityStatus(2, 'חברותא');
 
    constructor(public id: number, public desc: string) { }
    // id:number;

    static getOptions(remult: Remult) {
        let op = new ValueListValueConverter(ActivityStatus).getOptions();
        return op;
    }
}
