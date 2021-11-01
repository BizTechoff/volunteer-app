import { Component, OnInit } from '@angular/core';
import { GridSettings, openDialog } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { terms } from '../../../terms';
import { Activity, ActivityStatus } from '../activity';
import { ActivityDetailsComponent } from '../activity-details/activity-details.component';

@Component({
  selector: 'app-activities-list',
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.scss']
})
export class ActivitiesListComponent implements OnInit {

  terms = terms;
  get $() { return getFields(this, this.remult) };
  @Field({ caption: terms.status })
  status: ActivityStatus = ActivityStatus.w4_assign;
  @Field({ caption: terms.branch })
  bid: string = '';
  activities: GridSettings<Activity> = new GridSettings<Activity>(
    this.remult.repo(Activity),
    {
      where: _ => _.status.isIn(ActivityStatus.openStatuses()),
      allowCrud: false,// this.remult.isAllowed([Roles.manager, Roles.admin]) as boolean,
      // allowSelection: true,
      numOfColumnsInGrid: 10,
      columnSettings: _ => [_.tid, _.status, _.purpose, _.purposeDesc, _.date, _.fh, _.th, _.vids],
      rowButtons: [
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.activityDetails,
          click: async (_) => await this.showActivityDetails(_)
        },
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.cancelActivity,
          click: async (_) => await this.cancelActivity(_)
        }
      ]
    }
  );

  constructor(private remult: Remult) { }

  ngOnInit(): void {
  }

  async refresh() {
    await this.activities.reloadData();
  }

  async showActivityDetails(act?: Activity) {
    let id = act ? act.id : '';
    let changes = await openDialog(ActivityDetailsComponent,
      _ => _.args = { tid: id },
      _ => _ ? _.args.changed : false);
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
