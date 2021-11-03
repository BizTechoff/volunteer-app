import { Component, OnInit } from '@angular/core';
import { BackendMethod, DateOnlyField, Field, getFields, Remult } from 'remult';
import { Activity } from '../../core/activity/activity';
import { terms } from '../../terms';
import { Roles } from '../../users/roles';

@Component({
  selector: 'app-activity-daily',
  templateUrl: './activity-daily.component.html',
  styleUrls: ['./activity-daily.component.scss']
})
export class ActivityDailyComponent implements OnInit {

  activities = [] as Activity[];

  constructor(private remult: Remult) { }

  terms = terms;
  get $() { return getFields(this, this.remult) };

  @DateOnlyField({ caption: terms.selectDate })
  selectedDate: Date = new Date();

  ngOnInit(): void {
  }

  async retrieve() {
    this.activities = await this.getDailyActivities(this.selectedDate, this.remult);
  }

  async print(){
    window.print();
  }

  // @BackendMethod({ allowed: Roles.manager })
  async getDailyActivities(date: Date, remult?: Remult) {
    var result = [] as Activity[];
    for await (const a of remult!.repo(Activity).iterate({
      where: row => row.date.isEqualTo(date)
    })) { 
      result.push(a);
    }
    return result;
  }

}
