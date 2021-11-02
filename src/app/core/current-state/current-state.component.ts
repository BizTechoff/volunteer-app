import { Component, OnInit } from '@angular/core';
import { BackendMethod, Remult } from 'remult';
import { DialogService } from '../../common/dialog';
import { EmailSvc } from '../../common/utils';
import { ChartType, ChartOptions, Chart } from 'chart.js';
import { SingleDataSet, Label, Color } from 'ng2-charts';
import { terms } from '../../terms';

@Component({
  selector: 'app-current-state',
  templateUrl: './current-state.component.html',
  styleUrls: ['./current-state.component.scss']
})
export class CurrentStateComponent implements OnInit {

  public pieChartOptions: ChartOptions = {
    responsive: true, defaultColor: 'red'
  };
  public pieChartColors: Color[] = [
    // { backgroundColor: 'pink' },
    // { backgroundColor: 'blue' },
    // { backgroundColor: 'yellow' },
    // { backgroundColor: 'red' }
  ];
  public pieChartLegend = true;
  public pieChartLabels: Label[] = [
    terms.activities + ' ' + terms.opens,
    terms.activities + ' ' + terms.inProgress,
    terms.activities + ' ' + terms.endSuccess,
    terms.problems];
  public pieChartData: SingleDataSet = [300, 500, 100, 25];
  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [];

  constructor(private remult: Remult, private dialog: DialogService) {

  }

  ngOnInit() {
   
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