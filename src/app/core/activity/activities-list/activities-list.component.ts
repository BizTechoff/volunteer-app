import { Component, OnInit } from '@angular/core';
import { DataControl, DataControlInfo, GridSettings, openDialog } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Branch } from '../../branch/branch';
import { Activity, ActivityGeneralStatus, ActivityStatus } from '../activity';
import { ActivityDetailsComponent } from '../activity-details/activity-details.component';

@Component({
  selector: 'app-activities-list',
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.scss']
})
export class ActivitiesListComponent implements OnInit {

  terms = terms;
  get $() { return getFields(this, this.remult) };
  @DataControl<ActivitiesListComponent, ActivityGeneralStatus>({ valueChange: async (r, v) => await r.refresh() })
  @Field({ caption: terms.status })
  status: ActivityGeneralStatus = ActivityGeneralStatus.opens;
  @DataControl<ActivitiesListComponent, Branch>({ valueChange: async (r, v) => await r.refresh() })
  @Field({ caption: terms.branch })
  bid?: Branch;
  activities: GridSettings<Activity> = new GridSettings<Activity>(
    this.remult.repo(Activity),
    {
      where: () => ({
        status: this.status.statuses,
        bid: this.remult.branchAllowedForUser()
        // bid: this.bid ? this.bid : this.isBoard() ? undefined : { $contains: this.remult.user.bid }
      })
      ,
      allowCrud: false,// this.remult.isAllowed([Roles.manager, Roles.admin]) as boolean,
      // allowSelection: true,
      numOfColumnsInGrid: 20,
      columnSettings: a => {

        let f = [] as DataControlInfo<Activity>[];
        if (this.isBoard()) {
          f.push(a.bid!);
        }
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
      },
      gridButtons: [
        {
          textInMenu: () => terms.refresh,
          icon: 'refresh',
          click: async () => { await this.refresh(); }
        }
      ],
      rowButtons: [
        {
          visible: (_) => !_.isNew() && !this.remult.user.isReadOnly && _.status === ActivityStatus.w4_start,
          textInMenu: terms.markAsStarted,
          icon: 'check',
          click: async (_) => await this.markActivityAs(_, ActivityStatus.w4_end)
        },
        {
          visible: (_) => !_.isNew() && !this.remult.user.isReadOnly && _.status === ActivityStatus.w4_end,
          textInMenu: terms.markAsEnded,
          icon: 'done_all',
          click: async (_) => await this.markActivityAs(_, ActivityStatus.success)
        },
        {
          visible: (_) => !_.isNew() && !this.remult.user.isReadOnly,
          textInMenu: terms.addActivityToCurrentTenant,
          icon: 'add',
          click: async (_) => await this.addActivityToCurrentTenant(_)
        },
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.activityDetails,
          icon: 'edit',
          click: async (_) => await this.showActivityDetails(_)
        },
        {
          visible: (_) => !_.isNew() && !this.remult.user.isReadOnly,
          textInMenu: terms.cancelActivity,
          icon: 'cancel',
          click: async (_) => await this.cancelActivity(_)
        }
      ]
    }
  );

  constructor(private remult: Remult, private dialog: DialogService) { }

  ngOnInit(): void {
  }

  async markActivityAs(a: Activity, status: ActivityStatus) {
    let yes = await this.dialog.yesNoQuestion(terms.doYouSureMarkActivityAs.replace('!status!', status.caption));
    if (yes) {
      a.status = status;
      await a.save();
      await this.refresh();
    }
  }

  isBoard() {
    return this.remult.user.isBoardOrAbove;
  }

  async refresh() {
    // console.log('refresh');
    await this.activities.reloadData();
  }

  async addActivityToCurrentTenant(act?: Activity) {
    let changes = await openDialog(ActivityDetailsComponent,
      _ => _.args = { bid: act?.bid, tid: act?.tid },
      _ => _ ? _.args.changed : false);
    if (changes) {
      await this.refresh();
    }
  }

  async showActivityDetails(act?: Activity) {
    let id = act && act.id && act.id.length > 0 ? act.id : '';
    let changes = await openDialog(ActivityDetailsComponent,
      input => input.args = { aid: id },
      output => output ? output.args.changed : false);
    if (changes) {
      await this.refresh();
    }
  }

  private async cancelActivity(act: Activity) {
    act.status.onChanging(act, ActivityStatus.cancel, null!);
    await act.save();
    await this.refresh();
  }
}
