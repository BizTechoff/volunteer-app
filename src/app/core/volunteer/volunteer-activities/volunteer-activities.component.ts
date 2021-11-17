import { Component, OnInit } from '@angular/core';
import { openDialog } from '@remult/angular';
import { Remult } from 'remult';
import { InputAreaComponent } from '../../../common/input-area/input-area.component';
import { UserIdName } from '../../../common/types';
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
  constructor(private remult: Remult) { }

  terms = terms;
  AcitivityStatus = ActivityStatus;

  async ngOnInit(): Promise<void> {
    this.volunteer = await this.remult.repo(Users).findId(this.remult.user.id);
    await this.refresh();
  }

  async openActivity(act?: Activity) {
    let id = act && act.id && act.id.length > 0 ? act.id : '';
    let changes = await openDialog(ActivityDetailsComponent,
      input => input.args = { bid: this.volunteer.bid, aid: id },
      output => output ? output.args.changed : false);
    if (changes) {
      await this.refresh();
    }
  }

  async openPhotosAlbum(a: Activity) {
    let changes = await openDialog(PhotosAlbumComponent,
      _ => _.args = { bid: a.bid, entityId: a.id },
      _ => _ ? _.args.changed : false);
    if (changes) {
      // await this.refresh();
    }
  }

  isToday(a: Activity) {
    let today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return a.date.getTime() === today.getTime();
  }

  showClosedActivitySign(a: Activity) {
    return !ActivityStatus.openStatuses().find(s => s === a.status)!;
  }

  ActivityStatus = ActivityStatus;

  refreshing = false;
  async refresh() {
    if (!this.refreshing) {
      this.refreshing = true;
      let as = [] as Activity[];
      for await (const a of this.remult.repo(Activity).iterate({
        where: row => row.status.isNotIn([this.AcitivityStatus.cancel])
          .and(row.vids.contains(this.remult.user.id))
      })) {
        await a.$.tid.load();
        as.push(a);
      }
      this.activities.splice(0);
      this.activities.push(...as);
      this.refreshing = false;
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

  async setNextStatus(a: Activity, status: ActivityStatus) {
    let next = a.status.next();
    if (!next) {
      next = status;
    }
    if (next !== a.status) {
      if (ActivityStatus.w4_start === a.status) {
        a.started = new Date();
        let changed = await openDialog(InputAreaComponent,
          _ => _.args = {
            title: terms.thankYou,
            fields: () => [a.$.started],
            ok: async () => { }
          })
      }
      else if (ActivityStatus.w4_end === a.status) {
        a.ended = new Date();
        let changed = await openDialog(InputAreaComponent,
          _ => _.args = {
            title: terms.thankYou,
            fields: () => [a.$.ended],
            ok: async () => { }
          })
      }
      a.status = next;
      await a.save();
      if (ActivityStatus.lastStatuses().find(s => s === a.status)) {
        let changed = await openDialog(InputAreaComponent,
          _ => _.args = {
            title: terms.thankYou,
            fields: () => [a.$.remark],
            ok: async () => { await a.save(); }
          })
      }
    }
  }

  openWaze(address: string) {
    let url = `waze://?q=${encodeURI(address)}&navigate=yes`;
    window.open(url, '_blank');
  }

  call(mobile: string) {
    let url = `tel:${mobile}`;
    window.open(url, '_blank');
  }

}
