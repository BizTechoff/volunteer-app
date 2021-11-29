import { DataControl, openDialog } from "@remult/angular";
import { Allow, DateOnlyField, Entity, Field, FieldOptions, FieldRef, IdEntity, isBackend, Remult, Validators, ValueListFieldType } from "remult";
import { ValueListValueConverter } from 'remult/valueConverters';
import { DateRequiredValidation, EntityRequiredValidation, FILTER_IGNORE, TimeRequireValidator } from "../../common/globals";
import { InputAreaComponent } from "../../common/input-area/input-area.component";
import { SelectPurposesComponent } from "../../common/select-purposes/select-purposes.component";
import { UserIdName } from "../../common/types";
import { terms } from "../../terms";
import { Roles } from "../../users/roles";
import { Users } from "../../users/users";
import { Branch } from "../branch/branch";
import { CommaSeparatedStringArrayFieldUsersAsString, Tenant } from "../tenant/tenant";


export const PurposeRequiredValidation = (ent: Activity, col: FieldRef<Activity, ActivityPurpose[]>) => {
    let ok = col.value && col.value.length > 0 ? true : false;
    if (!ok!) {
        if (!ent.isNew() && ent.status === ActivityStatus.success) {
            col.error = terms.requiredField;
        }
    }
}

export function CommaSeparatedStringArrayFieldPurpose<entityType = any>(
    ...options: (FieldOptions<entityType, ActivityPurpose[]> |
        ((options: FieldOptions<entityType, ActivityPurpose[]>, remult: Remult) => void))[]) {
    return Field({
        displayValue: (r, x) => {
            return x ? x.map(i => i.caption).join(', ').trim() : '';
        },
        valueConverter: {
            toDb: x => x ? x.map(i => i.id.toString()).join(',') : undefined,
            fromDb: x => x ? ActivityPurpose.fromString(x.toString()) : []
        }
    }, ...options);
}

// export function CommaSeparatedStringArrayField<entityType = any>(
//     ...options: (FieldOptions<entityType, Users[]> |
//         ((options: FieldOptions<entityType, Users[]>, remult: Remult) => void))[]) {
//     return Field({
//         displayValue: (r, x) => {
//             return x ? x.map(i => i.name).join(', ').trim() : '';
//         },
//         valueConverter: {
//             toDb: x => x ? x.map(i => i.id.toString()).join(',') : undefined,
//             fromDb: x => x ? Users.fromString(x.toString(), remult!) : []
//         }
//     }, ...options);
// }

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

    static getOptions() {
        let op = new ValueListValueConverter(ActivityPurpose).getOptions();
        return op;
    }
    static fromString(str: string) {
        // console.log(str);
        let split = str.toString().split(',');
        // console.log(split);
        let result = [] as ActivityPurpose[];
        let options = ActivityPurpose.getOptions();
        split.forEach(id => {
            let found = options.find(_ => _.id === parseInt(id));
            if (found) {
                result.push(found);
            }
        });
        return result;
    }
}

@DataControl({
    // valueList: async remult => DeliveryStatus.getOptions(remult)
    // , width: '150'

})
@ValueListFieldType(ActivityDayPeriod, {
    // displayValue: (e, val) => val.caption,
    // translation: l => l.deliveryStatus
})
export class ActivityDayPeriod {
    // static none = new ActivityType(0, 'ללא');
    static morning = new ActivityDayPeriod(1, 'בוקר');
    static afternoon = new ActivityDayPeriod(2, 'צהריים');
    static evening = new ActivityDayPeriod(3, 'ערב');

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
    static w4_assign = new ActivityStatus(1, 'ממתין לשיבוץ',
        async (a, to, uid) => {//t=the new status
            if (to === ActivityStatus.w4_start) {
                a.assigned = new Date();
                a.status = to;
                await a.save();
                // sendEmail(a, New-Assigned);
            }
            else if (to === ActivityStatus.cancel) {
                a.canceled = new Date();
                a.status = to;
                await a.save();
                await ActivityStatus.showOnlySummary(a);
                // sendEmail(a, Canceled-Assigned);
            } else return;
        });
    static w4_start = new ActivityStatus(2, 'ממתין להתחלה',
        async (a, to, uid) => {//t=the new status
            if (to === ActivityStatus.w4_end) {
                a.started = new Date();
                a.status = to;
                await a.save();
                await ActivityStatus.showAfterStarted(a);
                // sendEmail(a, Started);
            }
            else if (to === ActivityStatus.cancel) {
                a.canceled = new Date();
                if (a.vids.length > 1) {
                    //remove only yourself
                    let f = a.vids.find(itm => itm.id === uid);
                    if (f) {
                        let i = a.vids.indexOf(f);
                        a.vids.splice(i, 1);
                    }
                }
                else {// its only you here
                    a.status = to;
                }
                await a.save();
                await ActivityStatus.showOnlySummary(a);
                // sendEmail(a, Canceled-Assigned);
            } else return;
            await a.save();
        });
    static w4_end = new ActivityStatus(3, 'ממתין לסיום',
        async (a, to, uid) => {//t=the new status
            if (to === ActivityStatus.success) {
                a.ended = new Date();
                a.status = to;
                await a.save();
                await ActivityStatus.showOnlySummary(a);
                // sendEmail(a, Success/Ended);
            }
            else if (to === ActivityStatus.problem) {
                a.problemed = new Date();
                a.status = to;
                await a.save();
                await ActivityStatus.showOnlySummary(a);
                // sendEmail(a, Problem);
            } else return;
            await a.save();
        });
    static success = new ActivityStatus(4, 'הסתיים בהצלחה', () => undefined!, 'green');
    static problem = new ActivityStatus(5, 'הסתיים בבעיה', () => undefined!, 'red');
    static cancel = new ActivityStatus(6, 'בוטל', () => undefined!, 'gray');

    constructor(public id: number, public caption: string, public onChanging: (a: Activity, to: ActivityStatus, uid: string) => Promise<void>, public color: string = 'darkblue') { }
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
            ActivityStatus.success//,
            // ActivityStatus.problem,
            // ActivityStatus.cancel
        ];
    }

    static problemStatuses() {
        return [
            ActivityStatus.problem,
            ActivityStatus.cancel
        ];
    }



    static async showAfterStarted(a: Activity) {
        let changed = await openDialog(InputAreaComponent,
            _ => _.args = {
                title: terms.thankYou,
                fields: () => [a.$.started],
                ok: async () => { }
            });
    }

    static async showAfterEndedAndSummary(a: Activity) {
        let changed = await openDialog(InputAreaComponent,
            _ => _.args = {
                title: terms.thankYou,
                fields: () => [a.$.ended, a.$.remark],
                ok: async () => { }
            });
    }

    static async showOnlySummary(a: Activity) {
        let changed = await openDialog(InputAreaComponent,
            _ => _.args = {
                title: terms.thankYou,
                fields: () => [a.$.remark],
                ok: async () => { }
            });
    }

    async sendEmails() {

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
        allowApiInsert: Allow.authenticated,
        allowApiDelete: Allow.authenticated,
        allowApiUpdate: Allow.authenticated,
        allowApiRead: Allow.authenticated,
        defaultOrderBy: (_) => [_.date, _.fh, _.status]
    },
    (options, remult) => {
        options.apiPrefilter = (act) => {
            let result = FILTER_IGNORE;
            if (!remult.isAllowed(Roles.board)) {
                return act.bid.contains(remult.user.bid);
            }
            return result;
        };
        options.validation = async (act) => {
            if (isBackend()) {
                let validId = (act.bid && act.bid.id && act.bid.id.length > 0)!;
                if (!validId) {
                    act.bid = undefined!;
                }
                // Check conflicts with volunteers OR tenant
                if (act.$.vids.valueChanged() || act.$.tid.valueChanged() || act.$.date.valueChanged() || act.$.fh.valueChanged() || act.$.th.valueChanged()) {
                    let conflicts = [] as Activity[];
                    let error = '';
                    for await (const a of remult.repo(Activity).iterate({
                        where: (_) => _.date.isEqualTo(act.date)
                            .and(_.fh.isLessOrEqualTo(act.th))
                            .and(_.th.isGreaterOrEqualTo(act.fh))
                            .and(_.status.isNotIn([ActivityStatus.cancel]))
                    })) {//if _.tid === act.tid || _.vids equalsAny act.vids
                        if (!a.isNew()) {
                            if (a.id === act.id) {
                                continue;//same record has current checked.
                            }
                        }
                        if (a.tid.id === act.tid.id) {
                            // same tenant
                            conflicts.push(a);
                            error = terms.sameDateAndTimes + ' ' + terms.tenant;
                        }
                        if (error.length == 0) {
                            if (Activity.hasIntersuct(act.vids, a.vids)) {
                                //same volunteers
                                conflicts.push(a);
                                error = terms.sameDateAndTimes + ' ' + terms.volunteers;
                            }
                        }
                    }
                    if (conflicts.length > 0) {
                        throw error;
                    }
                }
            }
        };
        options.saving = async (act) => {
            if (isBackend()) {
                if (act._.isNew()) {
                    act.created = new Date();
                    act.createdBy = await remult.repo(Users).findId(remult.user.id);
                }
                else {
                    act.modified = new Date();
                    act.modifiedBy = await remult.repo(Users).findId(remult.user.id);
                }
            }
        };
    })
export class Activity extends IdEntity {

    constructor(private remult: Remult) { super(); }



    isBoard() {
        return this.remult.isAllowed(Roles.board) ? true : false;
    }

    static hasIntersuct(us1: UserIdName[], us2: UserIdName[]) {
        if (!us1) {
            us1 = [] as UserIdName[];
        }
        if (!us2) {
            us2 = [] as UserIdName[];
        }
        for (let i = 0; i < us2.length; ++i) {
            if (us1.find(_ => _.id === us2[i].id)) {
                return true;
            }
        };
        return false;
    }

    @Field({
        caption: terms.branch, validate: EntityRequiredValidation
    })
    bid!: Branch;

    @Field(options => options.valueType = Tenant, { caption: terms.tenant, validate: Validators.required.withMessage(terms.requiredField) })
    // @Field(options => options.valueType = Tenant, {caption: terms.tenant} )
    //@Field({ caption: terms.tenant })
    tid!: Tenant;

    //@CommaSeparatedStringArrayField<Users>({ caption: terms.volunteers })//, displayValue: (r,v) => ''.join(',', v.displayValue) })
    @CommaSeparatedStringArrayFieldUsersAsString({ caption: terms.volunteers })
    vids: UserIdName[] = [] as UserIdName[];

    @Field({ caption: terms.status })
    status: ActivityStatus = ActivityStatus.w4_assign;

    @DateOnlyField({
        caption: terms.date, validate: DateRequiredValidation, displayValue: (_, x) =>
            x?.toLocaleDateString()
    })
    date: Date = new Date();

    // vols = new OneToMany(this.remult.repo(ActivitiesVolunteers), {
    //     where: _ => _.a!.isEqualTo(this)
    // })

    @DataControl<Tenant, ActivityPurpose[]>({
        hideDataOnInput: true,
        clickIcon: 'search',
        getValue: (r, v) => { return v && v.value ? v.value.map(i => i.caption).join(', ').trim() : ''; },
        // getValue : (r,v) => {v.displayValue},
        click: async (_, f) => {
            await openDialog(SelectPurposesComponent, x => x.args = {
                // onSelect: site => f.value = site,
                // title: f.metadata.caption,
                purposes: f.value
            })
        }
    })
    @CommaSeparatedStringArrayFieldPurpose<Activity>({ caption: terms.purpose, validate: PurposeRequiredValidation })
    // @Field({ caption: terms.purpose })
    purposes: ActivityPurpose[] = [];//ActivityPurpose.friendly];

    @Field({ caption: terms.desc })
    purposeDesc: string = '';

    // @DataControl<Tenant>({ האם הוא מחובר למזהה של היישות? היכן אמור להיות הקליק לבחירה מרשימה
    //     click: async (a) => {
    //         await openDialog(DynamicSelect(Tenant));
    //         a.bid = '888';
    //     }
    // })

    // @Field({ caption: terms.volunteers })
    // // volids = new OneToMany(this.remult.repo(Users), {
    // //     // where: (_) => {  _.  }
    // // })
    // // @Field({ caption: terms.volunteers })//, displayValue: (r,v) => ''.join(',', v.displayValue) })
    // volids: Users[] = [] as Users[];

    @Field({ caption: terms.fromHour, inputType: 'time', validate: TimeRequireValidator })
    fh: string = '00:00';

    @Field({ caption: terms.toHour, inputType: 'time', validate: TimeRequireValidator })
    th: string = '00:00';

    @Field({ caption: terms.commentAndSummary })
    remark: string = '';

    @Field({})
    called!: Date;

    @Field({})
    wazed!: Date;

    @Field({})
    photoed!: Date;

    @Field({})
    assigned!: Date;

    @Field({})
    started!: Date;

    @Field({})
    ended!: Date;

    @Field({})
    canceled!: Date;

    @Field({})
    problemed!: Date;

    @Field({ caption: terms.createdBy })
    createdBy!: Users;

    @Field({ caption: terms.created })
    created!: Date;

    @Field({ caption: terms.modifiedBy })
    modifiedBy!: Users;

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
