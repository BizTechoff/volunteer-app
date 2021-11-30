import { Component, OnInit } from '@angular/core';
import { DataControl } from '@remult/angular';
import { ChartOptions, ChartType } from 'chart.js';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { Field, getFields, Remult } from 'remult';
import { DialogService } from '../../common/dialog';
import { FILTER_IGNORE } from '../../common/globals';
import { terms } from '../../terms';
import { Roles } from '../../users/roles';
import { Activity, ActivityDayPeriod, ActivityPurpose, ActivityStatus } from '../activity/activity';
import { Branch } from '../branch/branch';
import { Referrer } from '../tenant/tenant';

@Component({
  selector: 'app-current-state',
  templateUrl: './current-state.component.html',
  styleUrls: ['./current-state.component.scss']
})
export class CurrentStateComponent implements OnInit {

  

  // colors = {
  //   blue2: '36a2eb'
  //   , purple: 'cc65fe' 
  //   , yellow2: 'ffce56',
  //   yellow: '#FDE098'//yello
  //   , orange: '#FAC090'//orange
  //   , blue: '#84C5F1'//blue
  //   , green: '#91D7D7'//green
  //   , red: '#FD9FB3'//red
  //   , red2: 'ff6384'

  // }; 
  colors = [
    '#91D7D7',//green
    '#FAC090',//orange
    '#FDE098',//yello
    '#84C5F1',//blue
    '#FD9FB3',//red
    'ffce56',//yellow2
    'cc65fe',//purple
    '36a2eb',//blue2
    'ff6384',//red2
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

  public pieChartOptionsByReferrer: ChartOptions = {
    responsive: true,
    // onClick: (event: MouseEvent, legendItem: any) => {
    //   return false;
    // },
    title: { text: terms.activitiesByReferrer, display: true },
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

  public pieChartLabelsReferrer: Label[] = [];
  public pieChartDataReferrer: SingleDataSet = [];

  refreshedTime = '00:00';
  weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  maxLabelLength = 25;

  activitiesByStatus: { branch: Branch, status: ActivityStatus, count: number }[] = [];
  activitiesByPurpose: { branch: Branch, purpose: ActivityPurpose, count: number }[] = [];
  activitiesByDayPeriods: { branch: Branch, period: ActivityDayPeriod, count: number }[] = [];
  activitiesByWeekDay: { branch: Branch, day: number, count: number }[] = [];
  activitiesByReferrer: { branch: Branch, referrer: Referrer, count: number }[] = [];

  @DataControl<CurrentStateComponent>({ valueChange: async (r, v) => await r.refresh() })
  @Field({ caption: terms.branch })
  branch?: Branch = null!;

  constructor(private remult: Remult, private dialog: DialogService) {

  }

  terms = terms;
  get $() { return getFields(this, this.remult) };

  async ngOnInit() {
    let b = await this.remult.repo(Branch).findId(this.remult.user.bid);
    if (b) {
      this.branch = b;
    }
    await this.refresh();
    // else{
    //   await this.refresh();
    // }
    // await this.refresh();
  }

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  isRefreshing = false;
  async refresh() {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.activitiesByStatus = [];
      this.activitiesByPurpose = [];
      this.activitiesByWeekDay = [];
      this.activitiesByDayPeriods = [];
      this.activitiesByReferrer = [];
      var options = { hour12: false };
      // console.log(date.toLocaleString('en-US', options));
      this.refreshedTime = new Date().toLocaleTimeString('en-US', options);
      for await (const a of this.remult.repo(Activity).iterate({
        where: row => this.branch ? row.bid.isEqualTo(this.branch) : FILTER_IGNORE
      })) {
        // By Staus
        let foundStatus = this.activitiesByStatus.find(itm => itm.status === a.status);
        if (!foundStatus) {
          foundStatus = { branch: a.bid, status: a.status, count: 0 };
          this.activitiesByStatus.push(foundStatus);
        }
        ++foundStatus.count;

        // By Purpose
        a.purposes.forEach(p => {
          let foundPurpose = this.activitiesByPurpose.find(itm => itm.purpose.id === p.id);
          if (!foundPurpose) {
            foundPurpose = { branch: a.bid, purpose: p, count: 0 };
            this.activitiesByPurpose.push(foundPurpose);
          }
          ++foundPurpose.count;
        });


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

        // By Purpose
        // let referrer = this.activitiesByReferrer.find(itm => itm.referrer === a.tid.referrer);
        // if (!referrer) {
        //   referrer = { branch: a.bid, referrer: a.tid.referrer, count: 0 };
        //   this.activitiesByReferrer.push(referrer);
        // }
        // ++referrer.count;
        this.isRefreshing = false;
      }
    }

    this.activitiesByStatus.sort((a1, a2) => a1.status.id - a2.status.id);
    this.activitiesByWeekDay.sort((a1, a2) => a1.day - a2.day);
    this.activitiesByDayPeriods.sort((a1, a2) => a1.period.id - a2.period.id);
    this.activitiesByPurpose.sort((a1, a2) => a1.purpose.id - a2.purpose.id);
    this.activitiesByReferrer.sort((a1, a2) => a1.referrer.id - a2.referrer.id);


    // let c = this.activitiesByWeekDay.reduce((sum, current) => sum + current.count, 0);
    // this.pieChartOptionsByWeekDay.title =  { text: terms.activitiesByWeekDay + ` (${c})`, display: true };

    this.setChart();
  }

  setChart() {
    // Chart.plugins.register({
    //   afterDraw: function (chart) {
    //     if (chart) {
    //       if (chart.data.datasets.length === 0) {
    //         // No data is present
    //         var ctx = chart.chart.ctx;
    //         var width = chart.chart.width;
    //         var height = chart.chart.height
    //         chart.clear();

    //         ctx.save();
    //         ctx.textAlign = 'center';
    //         ctx.textBaseline = 'middle';
    //         ctx.font = "16px normal 'Helvetica Nueue'";
    //         ctx.fillText('No data to display', width / 2, height / 2);
    //         ctx.restore();
    //       }
    //     }
    //   }
    // });
    this.pieChartColors = [{ backgroundColor: this.colors }];
    this.pieChartLabelsStatuses = [];
    this.pieChartDataStatuses = [];
    this.pieChartLabelsPurposes = [];
    this.pieChartDataPurposes = [];
    this.pieChartLabelsWeekDay = [];
    this.pieChartDataWeekDay = [];
    this.pieChartLabelsDayPeriods = [];
    this.pieChartDataDayPeriods = [];
    this.pieChartLabelsReferrer = [];
    this.pieChartDataReferrer = [];

    for (const a of this.activitiesByStatus) {
      let label = a.status.caption;
      if (a.status === ActivityStatus.problem) {
        label = label;
      }
      label += ` (${a.count})`;
      this.pieChartLabelsStatuses.push(label.padEnd(20));
      this.pieChartDataStatuses.push(a.count);
    }

    for (const a of this.activitiesByPurpose) {
      let label = (a.purpose.caption + ` (${a.count})`);
      // if (a.purpose === ActivityPurpose.fail) {
      //   label = terms.activities + ' ' + label;
      // }
      this.pieChartLabelsPurposes.push(label.padEnd(20));
      this.pieChartDataPurposes.push(a.count);
    }
    // (this.pieChartColors[0].backgroundColor as string[]).push(...this.colors2);

    for (const a of this.activitiesByDayPeriods) {
      let label = a.period.caption + ` (${a.count})`;
      // if (a.purpose === ActivityPurpose.fail) {
      //   label = terms.activities + ' ' + label;
      // }
      this.pieChartLabelsDayPeriods.push(label.padEnd(20));
      this.pieChartDataDayPeriods.push(a.count);
    }

    for (const a of this.activitiesByReferrer) {
      let label = a.referrer.caption + ` (${a.count})`;
      // if (a.purpose === ActivityPurpose.fail) {
      //   label = terms.activities + ' ' + label;
      // }
      this.pieChartLabelsReferrer.push(label.padEnd(20));
      this.pieChartDataReferrer.push(a.count);
    }

    for (const a of this.activitiesByWeekDay) {
      if (a.day >= 6) {// ללא שבת
        continue;
      }
      let label = 'יום ' + this.weekDays[a.day] + ` (${a.count})`;
      // if (a.purpose === ActivityPurpose.fail) {
      //   label = terms.activities + ' ' + label;
      // }
      this.pieChartLabelsWeekDay.push(label.padEnd(20));
      this.pieChartDataWeekDay.push(a.count);
    }
    // (this.pieChartColors[0].backgroundColor as string[]).push(...this.colors2);
  }

  public async chartClicked(e: any) {
    // console.log(e);
    // if (e.active && e.active.length > 0) {
    //   let index = e.active[0]._index;
    //   let act = this.activitiesByStatus[index];
    //   // this.selectedStatus = this.statuses.statuses[index];
    //   // this.refreshDeliveries();
    //   if (this.isBoard()) {
    //     //dril-down to view by branches
    //   }
    //   await this.openActivities(act.branch, act.status);
    // }
  }

  async openActivities(bid: string, status: ActivityStatus) {
    let list = [];
    for await (const a of this.remult.repo(Activity).iterate({
      where: row => row.bid.contains(bid)
        .and(row.status.isEqualTo(status))
    })) {
      list.push(`${a.date.toLocaleDateString()} (${a.fh} - ${a.th})`);
    }
    this.dialog.error(list);
    // this.dialog.info('פתיחת רשימה לסטטוסים מסוג: ' + status.caption + ' בסניף: ' + bid)
  }

  // async sendEmail() {
  //   let ok = await CurrentStateComponent.TestSendEmail('noam.honig@gmail.com', 'Welcome Volunteer', 'test', '');
  //   this.dialog.info(`שליחת מייל ${ok ? 'הצליחה' : 'נכשלה'}`);
  // }
  // @BackendMethod({ allowed: true })
  // static async TestSendEmail(to: string, subject: string, text: string, link: string, remult?: Remult) {
  //   return await EmailSvc.sendMail(to, subject, text, link, remult!);
  // } 

}