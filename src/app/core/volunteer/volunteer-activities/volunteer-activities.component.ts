import { Component, OnInit } from '@angular/core';
import { openDialog } from '@remult/angular';
import { Remult, ValueListFieldType } from 'remult';
import { ValueListValueConverter } from 'remult/valueConverters';
import { DialogService } from '../../../common/dialog';
import { pointsEachSuccessActivity } from '../../../common/globals';
import { SelectCallComponent } from '../../../common/select-call/select-call.component';
import { SelectNavigatorComponent } from '../../../common/select-navigator/select-navigator.component';
import { UserIdName } from '../../../common/types';
import { DateUtils } from '../../../common/utils';
import { terms } from '../../../terms';
import { Users } from '../../../users/users';
import { Activity, ActivityStatus } from '../../activity/activity';
import { ActivityDetailsComponent } from '../../activity/activity-details/activity-details.component';
import { PhotosAlbumComponent } from '../../photo/photos-album/photos-album.component';

@ValueListFieldType({})
export class Navigators {
  static waze = new Navigators({
    getUrl: (address) => `waze://?q=${encodeURI(address)}&navigate=yes`,
    click: (address) => window.open(`waze://?q=${encodeURI(address)}&navigate=yes`, '_blank')
  });
  static gmaps = new Navigators({
    getUrl: (address) => `https://maps.google.com/maps?q=${encodeURI(address)}`,
    click: (address) => window.open(`https://maps.google.com/maps?q=${encodeURI(address)}`, '_blank')
  });
  constructor(public args?: {
    getUrl: (address: string) => string,
    click: (address: string) => void
  }) { }
  id!: string
  caption!: string
  icon: string = 'assets/waze.svg'

  static getOptions() {
    let op = new ValueListValueConverter(Navigators).getOptions();
    return op;
  }
}

@Component({
  selector: 'app-volunteer-activities',
  templateUrl: './volunteer-activities.component.html',
  styleUrls: ['./volunteer-activities.component.scss']
})
export class VolunteerActivitiesComponent implements OnInit {

  activities = [] as Activity[];
  volunteer!: Users;
  userMessage = terms.loadingYourActivities;
  constructor(private remult: Remult, private dialog: DialogService) { }

  terms = terms;
  AcitivityStatus = ActivityStatus;

  async ngOnInit(): Promise<void> {
    this.volunteer = await this.remult.repo(Users).findId(this.remult.user.id);
    await this.refresh();
  }

  async openActivity(act?: Activity, autoOpenPurposes = false) {
    // console.log(6);

    let id = act && act.id && act.id.length > 0 ? act.id : '';
    if (id.length == 0) { // request to create new activity
      // console.log(77);
      let today = new Date();
      today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      for (const a of this.activities) {
        if (a.date < today) {
          if (ActivityStatus.openStatuses().includes(a.status)) {
            await this.dialog.error(terms.mustCloseOldActivities.replace('!date!', DateUtils.toDateString(a.date)));
            return;
          }
        }
      }
    }
    let changes = await openDialog(ActivityDetailsComponent,
      input => input.args = { branch: this.volunteer.bid, aid: id, tid: act?.tid, autoOpenPuposes: autoOpenPurposes },
      output => output ? output.args.changed : false);
    if (changes) {
      await this.refresh();
    }
  }

  async openPhotosAlbum(a: Activity) {
    a.photoed = new Date();
    await a.save();
    let changes = await openDialog(PhotosAlbumComponent,
      _ => _.args = { bid: a.bid, aid: a.id },//, tid: '' },
      _ => _ ? _.args.changed : false);
    if (changes) {
      // await this.refresh();
    }
  }

  isFuture(a: Activity) {
    let today = new Date();
    let todayOnlyDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let result = a.date.getTime() > todayOnlyDate.getTime();
    if (result)//check also times
    {

    }
    return result;
  }

  showClosedActivitySign(a: Activity) {
    return !ActivityStatus.openStatuses().find(s => s === a.status)!;
  }

  ActivityStatus = ActivityStatus;
  Navigators = Navigators

  refreshing = false;
  async refresh() {
    if (!this.refreshing) {
      this.userMessage = terms.loadingYourActivities;
      this.refreshing = true;
      let as = [] as Activity[];
      for await (const a of this.remult.repo(Activity).query({
        where: {
          bid: this.remult.branchAllowedForUser(),
          status: { $ne: [this.AcitivityStatus.cancel] },
          vids: { $contains: this.remult.user.id }
        },
        orderBy: { status: "asc", date: "asc", fh: "asc", th: "asc" }
      })) {
        await a.$.tid.load();
        as.push(a);
      }
      this.activities.splice(0);
      this.activities.push(...as);
      this.refreshing = false;
    }
    if (this.activities.length == 0) {
      this.userMessage = terms.volunteerNoActivities;
    }
  }

  getPurposes(a: Activity) {
    let result = 'לא צויינו מטרות';
    if (a && a.purposes && a.purposes.length > 0) {
      result = a.purposes.map(l => l.caption).join(', ');
    }
    return result;
  }

  getTanantRemark(a: Activity) {
    let result = ''
    if (a.tid.apartment && a.tid.apartment.length > 0) {
      result += ` דירה ${a.tid.apartment} `
    }

    if (a.tid.floor && a.tid.floor.length > 0) {
      result += ` קומה ${a.tid.floor} `
    }

    if (a.tid.addressRemark && a.tid.addressRemark.length > 0) {
      result += ` ${a.tid.addressRemark} `
    }
    return result.trim()
  }

  getVolunteers(a: Activity) {
    let voids = a.vids && a.vids.length > 0 ? a.vids : [] as UserIdName[];
    return voids.map(v => v.id === this.remult.user.id ? terms.me : v.name).join(', ');
  }

  getLang(a: Activity) {
    let result = 'לא צויינו';
    if (a && a.tid && a.tid.langs && a.tid.langs.length > 0) {
      result = a.tid.langs.map(l => l.caption).join(', ');
    }
    return result;
  }

  async setNextStatus(a: Activity, toStatus: ActivityStatus) {
    if (toStatus === ActivityStatus.success) {
      if (a.purposes?.length === 0) {
        this.dialog.info(terms.youMustEnterPurposes);
        await this.openActivity(a, true);
        return;
      }
    }
    await a.status.onChanging(a, toStatus, this.remult.user.id);
    if (toStatus === ActivityStatus.success) {
      let u = await this.remult.repo(Users).findId(this.remult.user.id);
      if (u) {
        u.points += pointsEachSuccessActivity;
        await u.save();
        this.dialog.info(terms.youGotMorePoint.replace('!points!', pointsEachSuccessActivity.toString()).replace('!sum!', u.points.toString()));
      }
    }
    await this.refresh();
  }

  async navigate(a: Activity) {
    let nav = undefined
    if (a.tid?.address) {
      nav = await openDialog(SelectNavigatorComponent,
        dlg => dlg.args = {address: a.tid?.address},
        dlg => dlg ? dlg.args.selected : undefined)
    }
    if (nav) {
      a.wazed = new Date();
      await a.save();
      nav.args?.click(a?.tid?.address)
    }
  }

  // let selected = openDialog()
  // a.wazed = new Date();
  // await a.save();
  // nav.args?.click(a?.tid?.address)
  // let address = a?.tid?.address
  // if (address) {
  //   a.wazed = new Date();
  //   await a.save();
  //   let url = nav.args!.getUrl(address) // `waze://?q=${encodeURI(address)}&navigate=yes`;
  //   window.open(url, '_blank');
  // }

  openWaze() {
    // window.open('waze://?ll=' + this.e.longLat + "&q=" + encodeURI(this.e.theAddress) + '&navigate=yes');
  }
  openGoogleMap() {
    // window.open('https://maps.google.com/maps?q=' + this.e.longLat + '&hl=' + getLang(this.remult).languageCode, '_blank');
  }

  async call(a: Activity) {
    let number = ''
    if (a.tid?.mobile && a.tid?.phone) {
      number = await openDialog(SelectCallComponent,
        dlg => dlg.args = { options: [a.tid?.mobile, a.tid?.phone] },
        dlg => dlg ? dlg.args.selected! : '')
    }
    else if (a.tid?.mobile){
      number = a.tid?.mobile
    }
    else if (a.tid?.phone){
      number = a.tid?.phone
    }
    if (number && number.length > 0) {
      a.called = new Date();
      await a.save();
      let url = `tel:${number}`;
      window.open(url, '_blank');
    }
  }

}
