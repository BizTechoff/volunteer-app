import { Component, OnInit } from '@angular/core';
import { DataControl, GridSettings, openDialog } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { FILTER_IGNORE } from '../../../common/globals';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
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
  @Field({ caption: terms.branch })
  bid: string = '';
  activities: GridSettings<Activity> = new GridSettings<Activity>(
    this.remult.repo(Activity),
    {
      where: _ => _.status.isIn(this.status.statuses)
        .and(this.bid && this.bid.length > 0 && this.bid !== '0' ? _.bid.isEqualTo(this.bid) : FILTER_IGNORE)
        .and(this.isBoard() ? FILTER_IGNORE : _.bid.isEqualTo(this.remult.user.bid)),
      allowCrud: false,// this.remult.isAllowed([Roles.manager, Roles.admin]) as boolean,
      // allowSelection: true,
      numOfColumnsInGrid: 20,
      columnSettings: _ => [
        { field: _.bid, visible: (r, v) => this.remult.isAllowed(Roles.board) },
        _.tid,
        _.vids,
        _.volids,
        _.status,
        _.date,
        _.fh,
        _.th,
        _.purpose,
        _.purposeDesc,
        _.remark,
        _.created,
        _.createdBy,
        _.modifiedBy,
        _.modified],
      gridButtons: [
        {
          textInMenu: () => terms.refresh,
          icon: 'refresh',
          click: async () => { await this.refresh(); }
        }
      ],
      rowButtons: [
        {
          visible: (_) => !_.isNew(),
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
          visible: (_) => !_.isNew(),
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

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  async refresh() {
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
    act.status = ActivityStatus.cancel;
    await act.save();
    await this.refresh();
  }
}
