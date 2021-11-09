import { DataControl, openDialog } from "@remult/angular";
import { Allow, DateOnlyField, Entity, Field, IdEntity, isBackend, Remult, ValueListFieldType } from "remult";
import { ValueListValueConverter } from 'remult/valueConverters';
import { FILTER_IGNORE, StringRequiredValidation, TimeRequireValidator } from "../../common/globals";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";
import { Tenant } from "../tenant/tenant";

@DataControl({
    // valueList: async remult => DeliveryStatus.getOptions(remult)
    // , width: '150'

})
@ValueListFieldType(ActivityPurpose, {
    // displayValue: (e, val) => val.caption,
    // translation: l => l.deliveryStatus
})
export class ActivityPurpose {
    // static none = new ActivityType(0, 'ללא');
    static friendly = new ActivityPurpose(1, 'חברותא');
    static assistance = new ActivityPurpose(2, 'סיוע');
    static cleaning = new ActivityPurpose(3, 'ניקיון');
    static shopping = new ActivityPurpose(4, 'קניות');
    static maintenance = new ActivityPurpose(5, 'תחזוקה');

    constructor(public id: number, public caption: string) { }
    // id:number;

    static getOptions(remult: Remult) {
        let op = new ValueListValueConverter(ActivityPurpose).getOptions();
        return op;
    }
}

@DataControl({
    // valueList: async remult => DeliveryStatus.getOptions(remult)
    // , width: '150'

})
@ValueListFieldType(ActivityPurpose, {
    // displayValue: (e, val) => val.caption,
    // translation: l => l.deliveryStatus
})
export class ActivityDayPeriod {
    // static none = new ActivityType(0, 'ללא');
    static morning = new ActivityPurpose(1, 'בוקר');
    static afternoon = new ActivityPurpose(2, 'צהריים');
    static evening = new ActivityPurpose(3, 'ערב');

    constructor(public id: number, public caption: string) { }
    // id:number;

    static getOptions(remult: Remult) {
        let op = new ValueListValueConverter(ActivityDayPeriod).getOptions();
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
    // static none = new ActivityStatus(0, 'ללא');
    static w4_assign = new ActivityStatus(1, 'ממתין לשיבוץ', () => ActivityStatus.w4_start);
    static w4_start = new ActivityStatus(2, 'ממתין להתחלה', () => ActivityStatus.w4_end);
    static w4_end = new ActivityStatus(3, 'ממתין לסיום', () => ActivityStatus.success);
    static success = new ActivityStatus(4, 'הסתיים בהצלחה', () => undefined);
    static problem = new ActivityStatus(5, 'הסתיים בבעיה', () => undefined);
    static cancel = new ActivityStatus(6, 'בוטל', () => undefined);

    constructor(public id: number, public caption: string, public next: () => ActivityStatus | undefined) { }
    // id:number;



    static getOptions() {
        let op = new ValueListValueConverter(ActivityStatus).getOptions();
        return op;
    }

    static openStatuses() {
        return [
            ActivityStatus.w4_assign,
            ActivityStatus.w4_start,
            ActivityStatus.w4_end
        ];
    }

    static closeStatuses() {
        return [
            ActivityStatus.success,
            ActivityStatus.cancel
        ];
    }

    static inProgressStatuses() {
        return [
            ActivityStatus.w4_end
        ];
    }

    static problemStatuses() {
        return [
            ActivityStatus.problem
        ];
    }
}

@ValueListFieldType(ActivityGeneralStatus)
export class ActivityGeneralStatus {
    static opens = new ActivityGeneralStatus(1, 'פתוחות', ActivityStatus.openStatuses());
    // static inProgress = new ActivityGeneralStatus(2, 'בתהליך', ActivityStatus.inProgressStatuses());
    static closed = new ActivityGeneralStatus(3, 'סגורות', ActivityStatus.closeStatuses());
    static problems = new ActivityGeneralStatus(4, 'בעיות', ActivityStatus.problemStatuses());
    static all = new ActivityGeneralStatus(0, 'הכל', ActivityStatus.getOptions());
    constructor(public id: number, public caption: string, public statuses: ActivityStatus[]) { }
}

@Entity<Activity>('activities',
    {
        allowApiInsert: Roles.manager,
        allowApiDelete: Roles.manager,
        allowApiUpdate: Allow.authenticated,
        allowApiRead: Allow.authenticated
    },
    (options, remult) => {
        options.apiPrefilter = async (act) => {
            let result = FILTER_IGNORE;
            if (!remult.isAllowed(Roles.board)) {
                return act.bid.isEqualTo(remult.user.bid);
            }
            return result;
        };
        options.validation = async (act) => {
            if (isBackend()) {
                let validId = (act.bid && act.bid.length > 0)!;
                if (!validId) {
                    act.bid = '0';
                }
                if (act.bid === '0') {
                    if (!remult.isAllowed(Roles.board)) {
                        act.$.bid.error = terms.requiredField;
                    }
                }
            }
        };
        options.saving = async (act) => {
            if (isBackend()) {
                if (act.$.date.valueChanged() || act.$.fh.valueChanged() || act.$.th.valueChanged()) {
                    let conflicts = [] as Activity[];
                    for await (const a of remult.repo(Activity).iterate({
                        where: (_) => _.date.isEqualTo(act.date)
                            .and(_.fh.isLessOrEqualTo(act.th))
                            .and(_.th.isGreaterOrEqualTo(act.fh))
                            .and(_.status.isDifferentFrom(ActivityStatus.cancel))
                    })) {//if _.tid === act.tid || _.vids equalsAny act.vids
                        if (!a.isNew()) {
                            if (a.id === act.id) {
                                continue;//same record has current checked.
                            }
                        }
                        conflicts.push(a);
                    }
                    if (conflicts.length > 0) {
                        throw terms.sameDateAndTimes;
                    }
                }
                if (act._.isNew()) {
                    act.created = new Date();
                    act.createdBy = remult.user.id;
                }
                else {
                    act.modified = new Date();
                    act.modifiedBy = remult.user.id;
                } 
            }
        };
    })
export class Activity extends IdEntity {

    // constructor(private remult: Remult){super();}
    // @DataControl<Activity>({
    //     click: async (a) => {
    //         await openDialog(DynamicSelect(Branch));
    //         a.bid = '888';
    //     }
    // }) 
    @Field({
        caption: terms.branch, validate: StringRequiredValidation
    })
    bid: string = '';

    @Field({ caption: terms.purpose })
    purpose: ActivityPurpose = ActivityPurpose.friendly;

    @Field({ caption: terms.desc })
    purposeDesc: string = '';

    // @DataControl<Tenant>({ האם הוא מחובר למזהה של היישות? היכן אמור להיות הקליק לבחירה מרשימה
    //     click: async (a) => {
    //         await openDialog(DynamicSelect(Tenant));
    //         a.bid = '888';
    //     }
    // })
    @Field(options => options.valueType = Tenant, { caption: terms.tenant })
    // @Field(options => options.valueType = Tenant, {caption: terms.tenant} )
    //@Field({ caption: terms.tenant })
    tid!: Tenant;

    @Field({ caption: terms.volunteers })//, displayValue: (r,v) => ''.join(',', v.displayValue) })
    vids: string[] = [];

    @DateOnlyField({ caption: terms.date })
    date: Date = new Date();

    @Field({ caption: terms.fromHour, inputType: 'time', defaultValue: () => '00:00', validate: TimeRequireValidator })
    fh!: string;

    @Field({ caption: terms.toHour, inputType: 'time', defaultValue: () => '00:00', validate: TimeRequireValidator })
    th!: string;

    @Field({ caption: terms.status })
    status: ActivityStatus = ActivityStatus.w4_assign;

    @Field({ caption: terms.remark })
    remark: string = '';

    @Field({ caption: terms.createdBy })
    createdBy: string = '';

    @Field({ caption: terms.created })
    created!: Date;

    @Field({ caption: terms.modifiedBy })
    modifiedBy: string = '';

    @Field({ caption: terms.modified })
    modified!: Date;

    period() {
        let result = ActivityDayPeriod.morning;
        if (this.fh >= '07:00' && this.fh < '12:00')
            result = ActivityDayPeriod.morning;
        else if (this.fh >= '12:00' && this.fh < '17:00')
            result = ActivityDayPeriod.afternoon;
        else if (this.fh >= '17:00' && this.fh < '20:00')
            result = ActivityDayPeriod.evening;

        return result;
    }

}
