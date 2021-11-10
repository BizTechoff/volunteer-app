import { Component, OnInit } from '@angular/core';
import { openDialog } from '@remult/angular';
import { Remult } from 'remult';
import { terms } from '../../../terms';
import { Langs } from '../../../users/users';
import { Activity, ActivityStatus } from '../../activity/activity';
import { PhotosAlbumComponent } from '../../photo/photos-album/photos-album.component';

@Component({
  selector: 'app-volunteer-activities',
  templateUrl: './volunteer-activities.component.html',
  styleUrls: ['./volunteer-activities.component.scss']
})
export class VolunteerActivitiesComponent implements OnInit {

  activities = [] as Activity[];
  constructor(private remult: Remult) { }

  terms = terms;
  AcitivityStatus = ActivityStatus;

  async ngOnInit(): Promise<void> {
    await this.refresh();

  }

  async openPhotosAlbum(a: Activity) {
    let changes = await openDialog(PhotosAlbumComponent,
      _ => _.args = { bid: a.bid, entityId: a.id },
      _ => _ ? _.args.changed : false);
    if (changes) {
      // await this.refresh();
    }
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
        where: row => row.vids.contains(this.remult.user.id)
      })) {
        await a.$.tid.load();
        as.push(a);
      } 
      this.activities.splice(0);
      this.activities.push(...as);
      this.refreshing = false;
    }  
  }

  getLang(langs: Langs[]) {
    let result = 'לא צויינו';
    if (langs && langs.length > 0) {
      result = langs.map(l => l.caption).join(', ');
    }
    return result;
  }

  async setNextStatus(a: Activity, status: ActivityStatus) {
    let next = a.status.next();
    if (!next) {
      next = status;
    }
    if (next !== a.status) {
      a.status = next;
      await a.save();
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
