import { Component, OnInit } from '@angular/core';
import { DataControl, GridSettings } from '@remult/angular';
import { DateOnlyField, getFields, Remult } from 'remult';
import { Activity } from '../../core/activity/activity';
import { terms } from '../../terms';

@Component({
  selector: 'app-activity-daily',
  templateUrl: './activity-daily.component.html',
  styleUrls: ['./activity-daily.component.scss']
})
export class ActivityDailyComponent implements OnInit {

  activities = [] as Activity[];
  grid = new GridSettings<Activity>(this.remult.repo(Activity),
    {
      where: row => row.date.isEqualTo(this.selectedDate),
      allowCrud: false,
      columnSettings: (_) => [
        _.tid,
        _.vids,
        _.status,
        _.remark
      ],
      gridButtons: [
        {
          textInMenu: () => terms.refresh,
          icon: 'refresh',
          click: async () => { await this.refresh(); }
        },
        {
          textInMenu: () => terms.print,
          icon: 'print',
          click: async () => { await this.print(); }
        }
      ]
    });

  constructor(private remult: Remult) { }

  terms = terms;
  get $() { return getFields(this, this.remult) };

  @DataControl<ActivityDailyComponent>({ valueChange: async (r, v) => { await r.refresh(); } })
  @DateOnlyField({ caption: terms.selectDate })
  selectedDate: Date = new Date();

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    await this.grid.reloadData();
    // this.activities = await this.getDailyActivities(this.selectedDate, this.remult);
  }

  async print() {
    // this.grid.
    // var divToPrint = document.getElementById("data")!;
    let data = '';
    data = '<html><head><title></title></head><body>'
    '<table border="1" cellpadding="1">'
              '<tr>'
              '<th></th>'
              '</tr>'
              'DATA'
              '<tr>'
              '<td></td>'
              '</tr>'
          '</table>'
          '</body><html>';
    var newWin = window.open();
    newWin!.document.write(data);
    newWin!.print();
    newWin!.close();
    // window!.print();
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
