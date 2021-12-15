import { Component, OnInit } from '@angular/core';
import { openDialog } from '@remult/angular';
import { Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { pointsEachSuccessActivity } from '../../../common/globals';
import { UserIdName } from '../../../common/types';
import { DateUtils } from '../../../common/utils';
import { terms } from '../../../terms';
import { Users } from '../../../users/users';
import { Activity, ActivityStatus } from '../../activity/activity';
import { ActivityDetailsComponent } from '../../activity/activity-details/activity-details.component';
import { PhotosAlbumComponent } from '../../photo/photos-album/photos-album.component';

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

  async openActivity(act?: Activity) {
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
      input => input.args = { bid: this.volunteer.bid, aid: id, tid: act?.tid },
      output => output ? output.args.changed : false);
    if (changes) {
      await this.refresh();
    }
  }

  async openPhotosAlbum(a: Activity) {
    a.photoed = new Date();
    await a.save();
    let changes = await openDialog(PhotosAlbumComponent,
      _ => _.args = { bid: a.bid, entityId: a.id },
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

  refreshing = false;
  async refresh() {
    if (!this.refreshing) {
      this.userMessage = terms.loadingYourActivities;
      this.refreshing = true;
      let as = [] as Activity[];
      for await (const a of this.remult.repo(Activity).iterate({
        where: row => row.status.isNotIn([this.AcitivityStatus.cancel])
          .and(row.vids.contains(this.remult.user.id)),
        orderBy: row => [row.status, row.date, row.fh, row.th]
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

  getVolunteers(a: Activity) {
    let voids = a.vids && a.vids.length > 0 ? a.vids : [] as UserIdName[];
    return voids.map(v => v.id === this.remult.user.id ? terms.you : v.name).join(', ');
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
        await this.openActivity(a);
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

  async openWaze(a: Activity) {
    let address = a?.tid?.address;
    if (address) {
      a.wazed = new Date();
      await a.save();
      let url = `waze://?q=${encodeURI(address)}&navigate=yes`;
      window.open(url, '_blank');
    }
  }

  async call(a: Activity) {
    let mobile = a?.tid?.mobile;
    if (mobile) {
      a.called = new Date();
      await a.save();
      let url = `tel:${mobile}`;
      window.open(url, '_blank');
    }
  }

}
