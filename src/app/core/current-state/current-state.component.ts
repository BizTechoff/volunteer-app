import { Component, OnInit } from '@angular/core';
import { DataControl } from '@remult/angular';
import { ChartOptions, ChartType } from 'chart.js';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { BackendMethod, Field, getFields, Remult } from 'remult';
import { DialogService } from '../../common/dialog';
import { terms } from '../../terms';
import { Roles } from '../../users/roles';
import { Activity, ActivityDayPeriod, ActivityPurpose, ActivityStatus } from '../activity/activity';
import { Branch } from '../branch/branch';
// import { Referrer } from '../tenant/tenant';
export interface stateResult {
  activitiesByBranches: { id: string, name: string, count: number }[];
  activitiesByStatus: { id: string, status: ActivityStatus, count: number }[];
  activitiesByPurpose: { id: string, purpose: ActivityPurpose, count: number }[];
  activitiesByDayPeriods: { id: string, period: ActivityDayPeriod, count: number }[];
  activitiesByWeekDay: { id: string, day: number, count: number }[];
};
@Component({
  selector: 'app-current-state',
  templateUrl: './current-state.component.html',
  styleUrls: ['./current-state.component.scss']
})
export class CurrentStateComponent implements OnInit {

  activitiesResult!: stateResult;

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

  public pieChartOptionsByBranches: ChartOptions = {
    responsive: true,
    // onClick: (event: MouseEvent, legendItem: any) => {
    //   // this.openActivitiesByStatuses()
    //   return false;
    // },//type PositionType = 'left' | 'right' | 'top' | 'bottom' | 'chartArea';
    title: { text: terms.activitiesByBranches, display: true },
    // maintainAspectRatio: false,
    // layout: { padding: { left: +28 } },
    legend: {
      // align: 'start',
      rtl: true,
      textDirection: 'rtl',
      position: 'right',
      // onClick: (event: MouseEvent, legendItem: any) => {
      //   // this.currentStatFilter = this.pieChartStatObjects[legendItem.index];

      //   return false;
      // }
    },
  };


  public pieChartOptionsByStatuses: ChartOptions = {
    responsive: true,
    // onClick: (event: MouseEvent, legendItem: any) => {
    //   // this.openActivitiesByStatuses()
    //   return false;
    // },//type PositionType = 'left' | 'right' | 'top' | 'bottom' | 'chartArea';
    title: { text: terms.activitiesByStatuses, display: true },
    // maintainAspectRatio: false,
    // layout: { padding: { left: +28 } },
    legend: {
      // align: 'start',
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
    // layout: { padding: 12 },
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

  // public pieChartOptionsByReferrer: ChartOptions = {
  //   responsive: true,
  //   // onClick: (event: MouseEvent, legendItem: any) => {
  //   //   return false;
  //   // },
  //   title: { text: terms.activitiesByReferrer, display: true },
  //   // maintainAspectRatio: false,
  //   // layout: { padding: 12 },
  //   legend: {
  //     rtl: true,
  //     textDirection: 'rtl',
  //     position: 'right',
  //     // onClick: (event: MouseEvent, legendItem: any) => {
  //     //   // this.currentStatFilter = this.pieChartStatObjects[legendItem.index];

  //     //   return false;
  //     // }
  //   },
  // };

  public pieChartOptionsByPurpose: ChartOptions = {
    responsive: true,
    title: { text: terms.activitiesByPurpose, display: true },
    // maintainAspectRatio: false,
    // layout: { padding: 12 },
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
    // layout: { padding: 12 },
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

  public pieChartLabelsBranches: Label[] = [];
  public pieChartDataBranches: SingleDataSet = [];

  public pieChartLabelsPurposes: Label[] = [];
  public pieChartDataPurposes: SingleDataSet = [];

  public pieChartLabelsDayPeriods: Label[] = [];
  public pieChartDataDayPeriods: SingleDataSet = [];

  public pieChartLabelsWeekDay: Label[] = [];
  public pieChartDataWeekDay: SingleDataSet = [];

  // public pieChartLabelsReferrer: Label[] = [];
  // public pieChartDataReferrer: SingleDataSet = [];

  refreshedTime = '00:00';
  weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  maxLabelLength = 0;

  @DataControl<CurrentStateComponent, Branch>({
    valueChange: async (r, v) => {
      
    console.log('CurrentStateComponent.valueChange')
      // console.log('branchv.alueChanged');
      // console.log('v.value', v.value);
      // console.log('r.branch?.id', r.branch?.id);
      await r.refresh();
    }
  })
  @Field({ caption: terms.branch })
  branch: Branch = undefined!;

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
  }

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  isRefreshing = false;
  async refresh() {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      var options = { hour12: false };
      // console.log(date.toLocaleString('en-US', options));
      this.refreshedTime = new Date().toLocaleTimeString('en-US', options);
      this.activitiesResult = await CurrentStateComponent.retrieveGraphes(
        this.branch?.id);
      this.isRefreshing = false;
      this.setChart();
    }
  }

  @BackendMethod({ allowed: rml => rml.authenticated() })
  static async retrieveGraphes(branchId?: string, remult?: Remult) {
    const result: stateResult = {
      activitiesByBranches: [],
      activitiesByDayPeriods: [],
      activitiesByPurpose: [],
      activitiesByStatus: [],
      activitiesByWeekDay: []
    };
    for await (const a of remult!.repo(Activity).query({
      where: ({ bid: remult?.branchAllowedForUser() })// branchId ? { $id: branchId } : undefined })
    })) {

      // By Branch
      let foundBranch = result.activitiesByBranches.find(itm => itm.id === a.bid.id);
      if (!foundBranch) {
        foundBranch = { id: a.bid.id, name: a.bid.name, count: 0 };
        result.activitiesByBranches.push(foundBranch);
      }
      ++foundBranch.count;

      // By Staus
      let foundStatus = result.activitiesByStatus.find(itm => itm.status === a.status);
      if (!foundStatus) {
        foundStatus = { id: a.bid.id, status: a.status, count: 0 };
        result.activitiesByStatus.push(foundStatus);
      }
      ++foundStatus.count;

      // By Purpose
      a.purposes.forEach(p => {
        let foundPurpose = result.activitiesByPurpose.find(itm => itm.purpose.id === p.id);
        if (!foundPurpose) {
          foundPurpose = { id: a.bid.id, purpose: p, count: 0 };
          result.activitiesByPurpose.push(foundPurpose);
        }
        ++foundPurpose.count;
      });


      // By Purpose
      let foundDayPeriod = result.activitiesByDayPeriods.find(itm => itm.period === a.period());
      if (!foundDayPeriod) {
        foundDayPeriod = { id: a.bid.id, period: a.period(), count: 0 };
        result.activitiesByDayPeriods.push(foundDayPeriod);
      }
      ++foundDayPeriod.count;

      // By Purpose
      let foundDayWeekDay = result.activitiesByWeekDay.find(itm => itm.day === a.date.getDay());
      if (!foundDayWeekDay) {
        foundDayWeekDay = { id: a.bid.id, day: a.date.getDay(), count: 0 };
        result.activitiesByWeekDay.push(foundDayWeekDay);
      }
      ++foundDayWeekDay.count;

      // By Purpose
      // let referrer = this.activitiesByReferrer.find(itm => itm.referrer === a.tid.referrer);
      // if (!referrer) {
      //   referrer = { branch: a.bid, referrer: a.tid.referrer, count: 0 };
      //   this.activitiesByReferrer.push(referrer);
      // }
      // ++referrer.count;
    }

    result.activitiesByBranches.sort((a1, a2) => a1.name.localeCompare(a2.name));
    result.activitiesByStatus.sort((a1, a2) => a1.status.id - a2.status.id);
    result.activitiesByWeekDay.sort((a1, a2) => a1.day - a2.day);
    result.activitiesByDayPeriods.sort((a1, a2) => a1.period.id - a2.period.id);
    result.activitiesByPurpose.sort((a1, a2) => a1.purpose.id - a2.purpose.id);

    return result;
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
    this.pieChartLabelsBranches = [];
    this.pieChartDataBranches = [];
    this.pieChartLabelsWeekDay = [];
    this.pieChartDataWeekDay = [];
    this.pieChartLabelsDayPeriods = [];
    this.pieChartDataDayPeriods = [];
    // this.pieChartLabelsReferrer = [];
    // this.pieChartDataReferrer = [];

    for (const a of this.activitiesResult.activitiesByStatus) {
      let label = a.status.caption;//.replace('ממתין', 'לא');
      // if (a.status === ActivityStatus.problem) {
      //   label = label;
      // }
      label += ` (${a.count})`;
      this.pieChartLabelsStatuses.push(label.replace('הסתיים ב', ''));
      this.pieChartDataStatuses.push(a.count);
    }

    for (const a of this.activitiesResult.activitiesByBranches) {
      let label = (a.name + ` (${a.count})`);
      // if (a.purpose === ActivityPurpose.fail) {
      //   label = terms.activities + ' ' + label;
      // }
      this.pieChartLabelsBranches.push(label);
      this.pieChartDataBranches.push(a.count);
    }

    for (const a of this.activitiesResult.activitiesByPurpose) {
      let label = (a.purpose.caption + ` (${a.count})`);
      // if (a.purpose === ActivityPurpose.fail) {
      //   label = terms.activities + ' ' + label;
      // }
      this.pieChartLabelsPurposes.push(label);
      this.pieChartDataPurposes.push(a.count);
    }
    // (this.pieChartColors[0].backgroundColor as string[]).push(...this.colors2);

    for (const a of this.activitiesResult.activitiesByDayPeriods) {
      let label = a.period.caption + ` (${a.count})`;
      // if (a.purpose === ActivityPurpose.fail) {
      //   label = terms.activities + ' ' + label;
      // }
      this.pieChartLabelsDayPeriods.push(label);
      this.pieChartDataDayPeriods.push(a.count);
    }

    // for (const a of this.activitiesByReferrer) {
    //   let label = a.referrer.caption + ` (${a.count})`;
    //   // if (a.purpose === ActivityPurpose.fail) {
    //   //   label = terms.activities + ' ' + label;
    //   // }
    //   this.pieChartLabelsReferrer.push(label);
    //   this.pieChartDataReferrer.push(a.count);
    // }

    for (const a of this.activitiesResult.activitiesByWeekDay) {
      if (a.day >= 6) {// ללא שבת
        continue;
      }
      let label = this.weekDays[a.day] + ` (${a.count})`;
      // if (a.purpose === ActivityPurpose.fail) {
      //   label = terms.activities + ' ' + label;
      // }
      this.pieChartLabelsWeekDay.push(label);
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
    for await (const a of this.remult.repo(Activity).query({
      where: {
        bid: { $id: bid },
        status
      }
    }
    )) {
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