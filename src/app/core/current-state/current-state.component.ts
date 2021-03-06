import { Component, OnInit } from '@angular/core';
import { DataControl, DataControlInfo, GridSettings, openDialog } from '@remult/angular';
import { ChartOptions, ChartType } from 'chart.js';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { BackendMethod, DateOnlyField, EntityFilter, getFields, Remult } from 'remult';
import { DialogService } from '../../common/dialog';
import { GridDialogComponent } from '../../common/grid-dialog/grid-dialog.component';
import { DateUtils } from '../../common/utils';
import { terms } from '../../terms';
import { Activity, ActivityDayPeriod, ActivityPurpose, ActivityStatus } from '../activity/activity';
// import { Referrer } from '../tenant/tenant';

export class filterBy {
  static branch = new filterBy()
  static status = new filterBy()
  static purpose = new filterBy()
  static period = new filterBy()
  static day = new filterBy()
}

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

  @DataControl<CurrentStateComponent, Date>({
    valueChange: async (r, v) => {
      if (r.toDate < v.value) {
        r.toDate = v.value;
      }
      await r.refresh();
    }
  })
  @DateOnlyField({ caption: terms.fromDate })
  fromDate: Date = new Date();

  @DataControl<CurrentStateComponent>({
    valueChange: async (r, v) => {
      if (r.fromDate > v.value) {
        r.fromDate = v.value;
      }
      await r.refresh();
    }
  })
  @DateOnlyField({ caption: terms.toDate })
  toDate: Date = new Date();

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
    'ff6384'//red2
    // 'gray'
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
      // borderAlign: 10,
      // labels: { usePointStyle: true },
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

  public barChartOptionsByBranch: ChartOptions = {
    responsive: true,
    title: { text: terms.activitiesByBranches, display: true },
    // maintainAspectRatio: false,
    // layout: { padding: 12 },
    legend: {
      display: false,
      rtl: true,
      textDirection: 'rtl',
      position: 'right',
      // onClick: (event: MouseEvent, legendItem: any) => {
      //   // this.currentStatFilter = this.pieChartStatObjects[legendItem.index];

      //   return false;
      // }
    },
  };

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartLabelsBranches: Label[] = [];
  public barChartDataBranches: SingleDataSet = [];
  public barChartColors: Color[] = [{ backgroundColor: [] }];

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
  weekDays = ['??????????', '??????', '??????????', '??????????', '??????????', '????????', '??????'];
  maxLabelLength = 0;

  constructor(public remult: Remult, private dialog: DialogService) {
  }

  filterBy = filterBy
  terms = terms;
  get $() { return getFields(this, this.remult) };

  async ngOnInit() {
    this.fromDate = new Date(
      this.fromDate.getFullYear(),
      this.fromDate.getMonth(),
      this.fromDate.getDate() - this.fromDate.getDay());
    this.toDate = new Date(
      this.toDate.getFullYear(),
      this.toDate.getMonth(),
      this.fromDate.getDate() + 7 - 1);
    await this.refresh();
  }

  isBoard() {
    return this.remult.user.isBoardOrAbove
  }

  async prevWeek() {
    this.fromDate = new Date(// ?????? 1 = 0
      this.fromDate.getFullYear(),
      this.fromDate.getMonth(),
      this.fromDate.getDate() - this.fromDate.getDay() - 7);
    this.toDate = new Date(
      this.fromDate.getFullYear(),
      this.fromDate.getMonth(),
      this.fromDate.getDate() + 6);
    await this.refresh();
  }
  async nextWeek() {
    this.fromDate = new Date(
      this.fromDate.getFullYear(),
      this.fromDate.getMonth(),
      this.fromDate.getDate() - this.fromDate.getDay() + 7);
    this.toDate = new Date(
      this.fromDate.getFullYear(),
      this.fromDate.getMonth(),
      this.fromDate.getDate() + 6);
    await this.refresh();
  }

  getDayOfWeek(d: Date) {
    let days = ['??', '??', '??', '??', '??', '??', '??']
    return days[d.getDay()]
  }

  isRefreshing = false;
  async refresh() {
    // console.log('refresh')
    // if (!this.isRefreshing) {
    this.isRefreshing = true;
    var options = { hour12: false };
    // console.log(date.toLocaleString('en-US', options));
    this.refreshedTime = new Date().toLocaleTimeString('en-US', options);
    this.activitiesResult = await CurrentStateComponent.retrieveGraphes(
      this.fromDate, this.toDate);
    // this.branch?.id);
    this.isRefreshing = false;
    this.setChart();
    // }
  }

  @BackendMethod({ allowed: rml => rml.authenticated() })
  static async retrieveGraphes(fromDate?: Date, toDate?: Date, remult?: Remult) {
    const result: stateResult = {
      activitiesByBranches: [],
      activitiesByDayPeriods: [],
      activitiesByPurpose: [],
      activitiesByStatus: [],
      activitiesByWeekDay: []
    };
    for await (const a of remult!.repo(Activity).query({
      where: ({
        bid: remult?.branchAllowedForUser(),
        date: { ">=": fromDate!, "<=": toDate! },
      })
    })) {
      // branchId ? { $id: branchId } : undefined })
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
      let foundDayPeriod = result.activitiesByDayPeriods.find(itm => itm.period === a.dayPeriod);
      if (!foundDayPeriod) {
        foundDayPeriod = { id: a.bid.id, period: a.dayPeriod, count: 0 };
        result.activitiesByDayPeriods.push(foundDayPeriod);
      }
      ++foundDayPeriod.count;

      // By Purpose
      let foundDayWeekDay = result.activitiesByWeekDay.find(itm => itm.day === a.dayOfWeek);
      if (!foundDayWeekDay) {
        foundDayWeekDay = { id: a.bid.id, day: a.dayOfWeek, count: 0 };
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
    this.barChartColors = [{
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(143, 103, 89, 0.6)',
        'rgba(68, 54, 122, 0.6)',
        'rgba(206, 188, 189, 0.6)',
        'rgba(100, 128, 0, 0.6)',
        'rgba(100, 55, 100, 0.6)',
        'rgba(55, 100, 55, 0.6)',
        'rgba(100, 54, 22, 0.6)',
        'rgba(100, 208, 100, 0.6)',
        'rgba(68, 54, 122, 0.6)',
        'rgba(100, 103, 55, 0.6)',
        'rgba(100, 128, 45, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(155, 103, 22, 0.6)',
        'rgba(240, 255, 0, 0.6)',
        'rgba(102, 34, 204, 0.6)',
        'rgba(155, 24, 22, 0.6)',
        'rgba(255, 55, 22, 0.6)',
        'rgba(55, 103, 55, 0.6)',
        'rgba(128, 54, 22, 0.6)',
        ...this.colors
      ]
    }];
    this.pieChartLabelsStatuses = [];
    this.pieChartDataStatuses = [];
    this.pieChartLabelsPurposes = [];
    this.pieChartDataPurposes = [];
    this.barChartLabelsBranches = [];
    this.barChartDataBranches = [];
    this.pieChartLabelsWeekDay = [];
    this.pieChartDataWeekDay = [];
    this.pieChartLabelsDayPeriods = [];
    this.pieChartDataDayPeriods = [];
    // this.pieChartLabelsReferrer = [];
    // this.pieChartDataReferrer = [];

    for (const a of this.activitiesResult.activitiesByStatus) {
      let label = a.status.caption;//.replace('??????????', '????');
      if (label === '?????????? ????????????') {
        label = '???? ????????'
      }
      else if (label === '?????????? ????????????') {
        label = '???? ??????????'
      }
      else if (label === '?????????? ??????????') {
        label = '??????????'
      }
      else if (label === '???????????? ????????????') {
        label = '??????????'
      }
      else if (label === '???????????? ??????????') {
        label = '????????'
      }
      // if (a.status === ActivityStatus.problem) {
      //   label = label;
      // }
      label += ` (${a.count})`;
      this.pieChartLabelsStatuses.push(label.replace('???????????? ??', ''));
      this.pieChartDataStatuses.push(a.count);
    }

    for (const a of this.activitiesResult.activitiesByBranches) {
      let label = (a.name + ` (${a.count})`);
      // if (a.purpose === ActivityPurpose.fail) {
      //   label = terms.activities + ' ' + label;
      // }
      this.barChartLabelsBranches.push(label);
      this.barChartDataBranches.push(a.count);
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
      if (a.day >= 6) {// ?????? ??????
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

  public async chartClicked(by: filterBy, e: any) {

    if (e.active && e.active.length > 0) {
      console.log(e.active[0])
      let index = e.active[0]._index;
      let label = e.active[0]._model.label
      switch (by) {
        case filterBy.branch: {
          this.showClickedData({
            title: `${this.barChartOptionsByBranch.title!.text}: ${label}`,// ${this.activitiesResult.activitiesByStatus[index].status.caption}`,
            fromDate: this.fromDate,
            toDate: this.toDate,
            branch: this.activitiesResult.activitiesByBranches[index].id
          })
          break;
        }
        case filterBy.status: {
          this.showClickedData({
            title: `${this.pieChartOptionsByStatuses.title!.text}: ${label}`,// ${this.activitiesResult.activitiesByStatus[index].status.caption}`,
            fromDate: this.fromDate,
            toDate: this.toDate,
            status: this.activitiesResult.activitiesByStatus[index].status
          })
          break;
        }
        case filterBy.period: {
          // this.dialog.info('???? ???????? ??????????')
          this.showClickedData({
            title: `${this.pieChartOptionsByDayPeriods.title!.text}: ${label}`,//${this.activitiesResult.activitiesByDayPeriods[index].period.caption}`,
            fromDate: this.fromDate,
            toDate: this.toDate,
            period: this.activitiesResult.activitiesByDayPeriods[index].period
          })
          break;
        }
        case filterBy.day: {
          // this.dialog.info('???? ???????? ??????????')
          this.showClickedData({
            title: `${this.pieChartOptionsByWeekDay.title!.text}: ${label}`,//${this.weekDays[this.activitiesResult.activitiesByWeekDay[index].day]}`,
            fromDate: this.fromDate,
            toDate: this.toDate,
            day: this.activitiesResult.activitiesByWeekDay[index].day
          })
          break;
        }
        case filterBy.purpose: {
          this.showClickedData({
            title: `${this.pieChartOptionsByPurpose.title!.text}: ${label}`,//${this.activitiesResult.activitiesByPurpose[index].purpose.caption}`,
            fromDate: this.fromDate,
            toDate: this.toDate,
            purpose: this.activitiesResult.activitiesByPurpose[index].purpose
          })
          break;
        }
      }
    }
    // if (by === filterBy.day) {
    //   console.log('chartClicked', e, 'by', 'BRANCH');
    // }
    // else {
    //   console.log('chartClicked', e, 'by', by);
    // }
    // if (e.active && e.active.length > 0) {
    //   let index = e.active[0]._index;
    //   console.log(index)
    //   // let act = this.activitiesByStatus[index];
    //   // this.selectedStatus = this.statuses.statuses[index];
    //   // this.refreshDeliveries();
    //   // if (this.isBoard()) {
    //   //dril-down to view by branches
    //   // }
    //   // await this.openActivities(act.branch, act.status);
    // }
  }

  // async openActivities(bid: string, status: ActivityStatus) {
  //   let list = [];
  //   for await (const a of this.remult.repo(Activity).query({
  //     where: {
  //       bid: { $id: bid },
  //       status
  //     }
  //   }
  //   )) {
  //     list.push(`${a.date.toLocaleDateString()} (${a.fh} - ${a.th})`);
  //   }
  //   this.dialog.error(list);
  //   // this.dialog.info('?????????? ?????????? ???????????????? ????????: ' + status.caption + ' ??????????: ' + bid)
  // }

  showClickedData(
    params: {
      title: string,
      fromDate: Date,
      toDate: Date,
      branch?: string,
      status?: ActivityStatus,
      purpose?: ActivityPurpose,
      period?: ActivityDayPeriod,
      day?: number
    }) {
    console.log('params', params)

    openDialog(GridDialogComponent, gd => gd.args = {
      title: params.title + '\n' + ` ${DateUtils.toDateString(this.fromDate)} - ${DateUtils.toDateString(this.toDate)}`,
      settings: new GridSettings(this.remult.repo(Activity), {
        allowCrud: false,
        where: () => {
          let result: EntityFilter<Activity> = {
            $and: [
              { bid: params.branch ? { $contains: params.branch } : undefined },
              { bid: this.remult.branchAllowedForUser() }
            ],
            date: { ">=": params.fromDate!, "<=": params.toDate! },
            status: params.status,
            purposes: params.purpose ? { $contains: params.purpose?.id.toString() } : undefined,
            dayOfWeek: params.day,
            dayPeriod: params.period
          };

          // if (params.period) {
          //   if(!result.$and){
          //     result.$and = []
          //   }
          //   result.$and!.push(this.contains(this.args.langs));
          // }

          //   let result = ActivityDayPeriod.morning;
          // if (this.fh >= '07:00' && this.fh < '12:00')
          //     result = ActivityDayPeriod.morning;
          // else if (this.fh >= '12:00' && this.fh < '17:00')
          //     result = ActivityDayPeriod.afternoon;
          // else if (this.fh >= '17:00' && this.fh < '20:00')
          //     result = ActivityDayPeriod.evening;

          // return result;

          // if (params.period) {
          //   result.$and!.push(this.contains(this.args.langs));
          // }
          // if (params.day) {
          //   result.$and!.push({ name: { $contains: this.search } });
          // }
          return result;
        },
        numOfColumnsInGrid: 20,
        //  { defVids: { $contains: user.id } },
        columnSettings: a => //[//(r, v) => { return this.remult.user.isBoardOrAbove }
        {
          let f = [] as DataControlInfo<Activity>[];
          if (this.remult.user.isBoardOrAbove) {
            f.push(a.bid);
          }
          f.push(
            a.tid,
            a.vids,
            a.status,
            a.date,
            a.purposes,
            a.purposeDesc,
            a.fh,
            a.th,
            a.remark,
            a.createdBy,
            a.created,
            a.modifiedBy,
            a.modified)
          return f
        }//,
        // gridButtons:
        //   [
        //     {
        //       textInMenu: () => terms.refresh,
        //       icon: 'refresh',
        //       click: async () => { await this.settings; }
        //     }
        //   ]
      }),
      ok: () => { }
    })

    // openDialog(SelectActivitiesComponent,
    //   dlg => dlg.args = {
    //     branch: params.branch,
    //     status: params.status,
    //     purposes: params.purposes,
    //     period: params.period,
    //     day: params.day
    //   })

  }

  // contains(period: ActivityDayPeriod) {
  //   let result: EntityFilter<Activity> = { $or: [] };
  //     result.$or!.push({
  //       date: { : l.id.toString() }
  //     })
  //   return result
  // }


}


            // $and: [
            //   {
            //     $and:
            //       params.period
            //         ? params.period === ActivityDayPeriod.afternoon
            //           ? [
            //             { fh: { ">=": '12:00' } },
            //             { fh: { "<": '17:00' } }]
            //           : params.period === ActivityDayPeriod.evening
            //             ? [
            //               { fh: { ">=": '17:00' } },
            //               { fh: { "<": '20:00' } }]
            //             : [
            //               { fh: { ">=": '20:00' } },
            //               { fh: { "<": '12:00' } }]
            //         : [],

            //   },
            //   {
            //     $and:
            //       [
            //         { dayOfWeek: params.day }
            //       ]
            //   }
            // ]
