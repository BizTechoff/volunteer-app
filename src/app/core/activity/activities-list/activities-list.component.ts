import { Component, OnInit } from '@angular/core';
import { GridSettings, openDialog } from '@remult/angular';
import { Remult } from 'remult';
import { terms } from '../../../terms';
import { Activity } from '../activity';
import { ActivityDetailsComponent } from '../activity-details/activity-details.component';

@Component({
  selector: 'app-activities-list',
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.scss']
})
export class ActivitiesListComponent implements OnInit {

  activities: GridSettings<Activity> = new GridSettings<Activity>(
    this.remult.repo(Activity),
    {
      allowInsert: true,// this.remult.isAllowed([Roles.manager, Roles.admin]) as boolean,
      allowDelete: true,
      allowUpdate: true,// this.remult.isAllowed(Roles.manager),
      // allowSelection: true,
      numOfColumnsInGrid: 10,
      columnSettings: _ => [_.title, _.subTitle, _.tid, _.vids, _.purpose, _.fh, _.th, _.date, _.status],
      rowButtons: [
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.activityDetails,
          click: async (_) => await this.showActivityDetails(_)
        }
      ]
    }
  );

  constructor(private remult: Remult) { }

  ngOnInit(): void {
  }

  private async showActivityDetails(act: Activity) {
    let changes = await openDialog(ActivityDetailsComponent);
  }
}
