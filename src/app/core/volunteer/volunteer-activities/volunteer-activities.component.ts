import { Component, OnInit } from '@angular/core';
import { Remult } from 'remult';
import { Activity } from '../../activity/activity';

@Component({
  selector: 'app-volunteer-activities',
  templateUrl: './volunteer-activities.component.html',
  styleUrls: ['./volunteer-activities.component.scss']
})
export class VolunteerActivitiesComponent implements OnInit {

  activities = [] as Activity[];
  constructor(private remult: Remult) { }

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  async refresh() {
    this.activities.splice(0);
    for await (const a of this.remult.repo(Activity).iterate({
      where: row => row.vids.contains(this.remult.user.id)
    })) {
      this.activities.push(a);
    }
  }

}
