import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { BackendMethod, Field, getFields, Remult } from 'remult';
import { DialogService } from '../../common/dialog';
import { EmailSvc } from '../../common/utils';
import { terms } from '../../terms';
import { Roles } from '../../users/roles';
import { Activity, ActivityDayPeriod, ActivityPurpose, ActivityStatus } from '../activity/activity';

@Component({
  selector: 'app-current-state',
  templateUrl: './current-state.component.html',
  styleUrls: ['./current-state.component.scss']
})
export class CurrentStateComponent implements OnInit {

  terms = terms;
  get $() { return getFields(this, this.remult) };

  @Field({ caption: terms.branch })
  branch: string = '';

  colors = {
    blue2: '36a2eb'
    , purple: 'cc65fe'
    , yellow2: 'ffce56',
    yellow: '#FDE098'//yello
    , orange: '#FAC090'//orange
    , blue: '#84C5F1'//blue
    , green: '#91D7D7'//green
    , red: '#FD9FB3'//red
    , red2: 'ff6384'

  };
  colors2 = [
    '#FDE098',//yello
    '#FAC090',//orange
    '#84C5F1',//blue
    '#91D7D7',//green
    '#FD9FB3',//red
    'gray'
  ];

  public pieChartOptionsByStatuses: ChartOptions = {
    responsive: true,
    // onClick: (event: MouseEvent, legendItem: any) => {
    //   // this.openActivitiesByStatuses()
    //   return false;
    // },
    title: { text: terms.activitiesByStatuses, display: true },
    // maintainAspectRatio: false,
    layout: { padding: 12 },
    legend: {
      rtl: true,
      textDirection: 'rtl',
      position: 'right',
      // onClick: (event: MouseEvent, legendItem: any) => {
      //   // this.currentStatFilter = this.pieChartStatObjects[legendItem.index];

      //   return false;
      // }
    },
  };

  public pieChartOptionsByDayPeriods: ChartOptions = {
    responsive: true,
    // onClick: (event: MouseEvent, legendItem: any) => {
    //   return false;
    // },
    title: { text: terms.activitiesByDayPeriods, display: true },
    // maintainAspectRatio: false,
    layout: { padding: 12 },
    legend: {
      rtl: true,
      textDirection: 'rtl',
      position: 'right',
      // onClick: (event: MouseEvent, legendItem: any) => {
      //   // this.currentStatFilter = this.pieChartStatObjects[legendItem.index];

      //   return false;
      // }
    },
  };

  public pieChartOptionsByPurpose: ChartOptions = {
    responsive: true,
    title: { text: terms.activitiesByPurpose, display: true },
    // maintainAspectRatio: false,
    layout: { padding: 12 },
    legend: {
      rtl: true,
      textDirection: 'rtl',
      position: 'right',
      // onClick: (event: MouseEvent, legendItem: any) => {
      //   // this.currentStatFilter = this.pieChartStatObjects[legendItem.index];

      //   return false;
      // }
    },
  };

  public pieChartOptionsByWeekDay: ChartOptions = {
    responsive: true,
    title: { text: terms.activitiesByWeekDay, display: true },
    // maintainAspectRatio: false,
    layout: { padding: 12 },
    legend: {
      rtl: true,
      textDirection: 'rtl',
      position: 'right',
      // onClick: (event: MouseEvent, legendItem: any) => {
      //   // this.currentStatFilter = this.pieChartStatObjects[legendItem.index];

      //   return false;
      // }
    },
  };

  //   responsive: true, 
  //   defaultColor: 'red',
  //   title: { text: terms.activitiesByStatuses, display: true },
  //   legend: { labels: {  usePointStyle: true } }
  // };

  public pieChartColors: Color[] = [{ backgroundColor: [] }];
  public pieChartLabelsStatuses: Label[] = [];
  public pieChartDataStatuses: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  public pieChartLabelsPurposes: Label[] = [];
  public pieChartDataPurposes: SingleDataSet = [];

  public pieChartLabelsDayPeriods: Label[] = [];
  public pieChartDataDayPeriods: SingleDataSet = [];

  public pieChartLabelsWeekDay: Label[] = [];
  public pieChartDataWeekDay: SingleDataSet = [];

  refreshedTime = '00:00';
  weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  maxLabelLength = 20;

  activitiesByStatus: { branch: string, status: ActivityStatus, count: number }[] = [];
  activitiesByPurpose: { branch: string, purpose: ActivityPurpose, count: number }[] = [];
  activitiesByDayPeriods: { branch: string, period: ActivityDayPeriod, count: number }[] = [];
  activitiesByWeekDay: { branch: string, day: number, count: number }[] = [];

  constructor(private remult: Remult, private dialog: DialogService) {

  }

  async ngOnInit() {
    await this.refresh();
  }

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  async refresh() {
    this.activitiesByStatus = [];
    this.activitiesByPurpose = [];
    var options = { hour12: false };
    // console.log(date.toLocaleString('en-US', options));
    this.refreshedTime = new Date().toLocaleTimeString('en-US', options);
    for await (const a of this.remult.repo(Activity).iterate({})) {
      // By Staus
      let foundStatus = this.activitiesByStatus.find(itm => itm.status === a.status);
      if (!foundStatus) {
        foundStatus = { branch: a.bid, status: a.status, count: 0 };
        this.activitiesByStatus.push(foundStatus);
      }
      ++foundStatus.count;

      // By Purpose
      let foundPurpose = this.activitiesByPurpose.find(itm => itm.purpose === a.purpose);
      if (!foundPurpose) {
        foundPurpose = { branch: a.bid, purpose: a.purpose, count: 0 };
        this.activitiesByPurpose.push(foundPurpose);
      }
      ++foundPurpose.count;

      // By Purpose
      let foundDayPeriod = this.activitiesByDayPeriods.find(itm => itm.period === a.period());
      if (!foundDayPeriod) {
        foundDayPeriod = { branch: a.bid, period: a.period(), count: 0 };
        this.activitiesByDayPeriods.push(foundDayPeriod);
      }
      ++foundDayPeriod.count;

      // By Purpose
      let foundDayWeekDay = this.activitiesByWeekDay.find(itm => itm.day === a.date.getDay());
      if (!foundDayWeekDay) {
        foundDayWeekDay = { branch: a.bid, day: a.date.getDay(), count: 0 };
        this.activitiesByWeekDay.push(foundDayWeekDay);
      }
      ++foundDayWeekDay.count;
    }

    this.setChart();
  }

  setChart() {
    this.pieChartColors = [{ backgroundColor: this.colors2 }];
    this.pieChartLabelsStatuses = [];
    this.pieChartDataStatuses = [];
    this.pieChartLabelsPurposes = [];
    this.pieChartDataPurposes = [];
    this.pieChartLabelsWeekDay = [];
    this.pieChartDataWeekDay = [];
    this.pieChartLabelsDayPeriods = [];
    this.pieChartDataDayPeriods = [];

    for (const a of this.activitiesByStatus) {
      let label = a.status.caption;
      if (a.status === ActivityStatus.fail) {
        label = label;
      }
      this.pieChartLabelsStatuses.push(label.padEnd(20));
      this.pieChartDataStatuses.push(a.count);
    }

    for (const a of this.activitiesByPurpose) {
      let label = a.purpose.caption.padEnd(20);
      // if (a.purpose === ActivityPurpose.fail) {
      //   label = terms.activities + ' ' + label;
      // }
      this.pieChartLabelsPurposes.push(label);
      this.pieChartDataPurposes.push(a.count);
    }
    // (this.pieChartColors[0].backgroundColor as string[]).push(...this.colors2);

    for (const a of this.activitiesByDayPeriods) {
      let label = a.period.caption.padEnd(20);
      // if (a.purpose === ActivityPurpose.fail) {
      //   label = terms.activities + ' ' + label;
      // }
      this.pieChartLabelsDayPeriods.push(label);
      this.pieChartDataDayPeriods.push(a.count);
    }

    for (const a of this.activitiesByWeekDay) {
      let label = 'יום ' + this.weekDays[a.day];
      // if (a.purpose === ActivityPurpose.fail) {
      //   label = terms.activities + ' ' + label;
      // }
      this.pieChartLabelsWeekDay.push(label.padEnd(20));
      this.pieChartDataWeekDay.push(a.count);
    }
    // (this.pieChartColors[0].backgroundColor as string[]).push(...this.colors2);
  }

  public async chartClicked(e: any) {
    console.log(e);
    if (e.active && e.active.length > 0) {
      let index = e.active[0]._index;
      let act = this.activitiesByStatus[index];
      // this.selectedStatus = this.statuses.statuses[index];
      // this.refreshDeliveries();
      if (this.isBoard()) {
        //dril-down to view by branches
      }
      await this.openActivities(act.branch, act.status);
    }
  }

  async openActivities(bid: string, status: ActivityStatus) {
    let list = [];
    for await (const a of this.remult.repo(Activity).iterate({
      where: row => row.bid.isEqualTo(bid)
        .and(row.status.isEqualTo(status))
    })) {
      list.push(`${a.date.toLocaleDateString()} (${a.fh} - ${a.th})`);
    }
    this.dialog.error(list);
    // this.dialog.info('פתיחת רשימה לסטטוסים מסוג: ' + status.caption + ' בסניף: ' + bid)
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