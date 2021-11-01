import { Component, OnInit } from '@angular/core';
import { BackendMethod, Remult } from 'remult';
import { DialogService } from '../../common/dialog';
import { EmailSvc } from '../../common/utils';
// import { ChartType, ChartOptions } from 'chart.js';
// import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';

@Component({
  selector: 'app-current-state',
  templateUrl: './current-state.component.html',
  styleUrls: ['./current-state.component.scss']
})
export class CurrentStateComponent implements OnInit {
  // Pie
  // public pieChartOptions: ChartOptions = {
  //   responsive: true,
  // };
  // public pieChartLegend = true;
  // public pieChartLabels: Label[] = [['Download', 'Sales'], ['In', 'Store', 'Sales'], 'Mail Sales'];
  // public pieChartData: SingleDataSet = [300, 500, 100];
  // public pieChartType: ChartType = 'pie';
  // public pieChartPlugins = [];

  constructor(private remult: Remult, private dialog:DialogService) {
    // monkeyPatchChartJsTooltip();
    // monkeyPatchChartJsLegend();
  }

  ngOnInit() {
  }

  async sendEmail(){
    let ok = await CurrentStateComponent.TestSendEmail('gxbreaker@gmail.com', 'Welcome Volunteer', this.remult);
    this.dialog.info('Sent Status: ' + ok);
  }
  @BackendMethod({ allowed: true })
  static async TestSendEmail(to: string, text: string, remult?: Remult) {
    return await EmailSvc.sendMail("test email", text, to, remult!);
  }
 
}