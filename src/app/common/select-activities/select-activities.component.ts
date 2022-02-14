import { Component, OnInit } from '@angular/core';
import { DataControlInfo, GridSettings } from '@remult/angular';
import { EntityFilter, Remult } from 'remult';
import { Activity, ActivityDayPeriod, ActivityPurpose, ActivityStatus } from '../../core/activity/activity';
import { Branch } from '../../core/branch/branch';

@Component({
  selector: 'app-select-activities',
  templateUrl: './select-activities.component.html',
  styleUrls: ['./select-activities.component.scss']
})
export class SelectActivitiesComponent implements OnInit {

  args: {
    branch?: Branch,
    status?: ActivityStatus,
    purposes?: ActivityPurpose[],
    period?: ActivityDayPeriod,
    day?: number
  }={}
  activities!: GridSettings<Activity>
  
  constructor(private remult:Remult) { }

  ngOnInit(): void {

    this.activities = new GridSettings<Activity>(
      this.remult.repo(Activity),
      {
        where: () => {
          let result: EntityFilter<Activity> = {
            bid: this.args.branch,
            status: this.args.status,
            purposes: this.args.purposes,
            $and: []
          };
          // if (params.period) {
          //   result.$and!.push(this.contains(this.args.langs));
          // }
          // if (params.day) {
          //   result.$and!.push({ name: { $contains: this.search } });
          // }
          return result;
        },
        allowCrud: false,
        numOfColumnsInGrid: 20,
        columnSettings: a => {

          let f = [] as DataControlInfo<Activity>[];
          // if (this.isBoard()) {
            f.push(a.bid!);
          // }
          f.push(
            a.tid,
            a.vids,
            a.status,
            a.date,
            a.purposes,
            a.purposeDesc,
            a.fh,
            a.th,
            a.remark,
            a.createdBy,
            a.created,
            a.modifiedBy,
            a.modified//,
            // a.assigned,
            // a.started,
            // a.ended,
            // a.canceled,
            // a.problemed
          );
          return f;
        }//,
        // gridButtons: [
        //   {
        //     textInMenu: () => terms.refresh,
        //     icon: 'refresh',
        //     click: async () => { await this.refresh(); }
        //   }
        // ],
        // rowButtons: [
        //   // {
        //   //   visible: (_) => !_.isNew() && !this.remult.user.isReadOnly && _.status === ActivityStatus.w4_start,
        //   //   textInMenu: terms.markAsStarted,
        //   //   icon: 'check',
        //   //   click: async (_) => await this.markActivityAs(_, ActivityStatus.w4_end)
        //   // },
        //   // {
        //   //   visible: (_) => !_.isNew() && !this.remult.user.isReadOnly && _.status === ActivityStatus.w4_end,
        //   //   textInMenu: terms.markAsEnded,
        //   //   icon: 'done_all',
        //   //   click: async (_) => await this.markActivityAs(_, ActivityStatus.success)
        //   // },
        //   {
        //     visible: (_) => !_.isNew() && !this.remult.user.isReadOnly,
        //     textInMenu: terms.addActivityToCurrentTenant,
        //     icon: 'add',
        //     click: async (_) => await this.addActivityToCurrentTenant(_)
        //   },
        //   {
        //     visible: (_) => !_.isNew(),
        //     textInMenu: terms.activityDetails,
        //     icon: 'edit',
        //     click: async (_) => await this.showActivityDetails(_)
        //   },
        //   {
        //     visible: (_) => !_.isNew() && !this.remult.user.isReadOnly,
        //     textInMenu: terms.cancelActivity,
        //     icon: 'cancel',
        //     click: async (_) => await this.cancelActivity(_)
        //   }
        // ]
      }
    );

  }

}
