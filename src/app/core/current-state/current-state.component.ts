import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { BackendMethod, Remult } from 'remult';
import { DialogService } from '../../common/dialog';
import { EmailSvc } from '../../common/utils';
import { terms } from '../../terms';
import { Activity, ActivityStatus } from '../activity/activity';

@Component({
  selector: 'app-current-state',
  templateUrl: './current-state.component.html',
  styleUrls: ['./current-state.component.scss']
})
export class CurrentStateComponent implements OnInit {

  public pieChartOptions: ChartOptions = {
    responsive: true, defaultColor: 'red'
  };
  public pieChartColors: Color[] = [];
  public pieChartLabels: Label[] = [];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  activities: { status: ActivityStatus, count: number }[] = [];

  constructor(private remult: Remult, private dialog: DialogService) {

  }

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    for await (const a of this.remult.repo(Activity).iterate({})) {
      let found = this.activities.find(itm => itm.status === a.status);
      if (!found) {
        found = { status: a.status, count: 0 };
        this.activities.push(found);
      }
      ++found.count;
    }

    this.pieChartColors = [{ backgroundColor: 'pink' }];
    this.pieChartLabels = [];
    this.pieChartData = [];
    for (const a of this.activities) {
      // this.pieChartColors.push( { backgroundColor: a.color });
      let label = a.status.caption;
      if (a.status === ActivityStatus.fail) {
        label = terms.activities + ' ' + label;
      }
      this.pieChartLabels.push(label);
      this.pieChartData.push(a.count);
    }
  }
  
  public chartClicked(e: any): void {
    if (e.active && e.active.length > 0) {
      let index = e.active[0]._index;
      // this.selectedStatus = this.statuses.statuses[index];
      // this.refreshDeliveries();
    }
  }

  async sendEmail() {
    let ok = await CurrentStateComponent.TestSendEmail('noam.honig@gmail.com', 'Welcome Volunteer');
    this.dialog.info('Sent Status: ' + ok);
  }
  @BackendMethod({ allowed: true })
  static async TestSendEmail(to: string, text: string, remult?: Remult) {
    return await EmailSvc.sendMail("test email", text, to, remult!);
  }

}