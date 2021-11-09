import { Component, OnInit } from '@angular/core';
import { openDialog } from '@remult/angular';
import { Remult } from 'remult';
import { terms } from '../../../terms';
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
      _ => _.args = { entityId: a.id },
      _ => _ ? _.args.changed : false);
    if (changes) {
      // await this.refresh();
    }
  }

  showClosedActivitySign(a: Activity) {
    return !ActivityStatus.openStatuses().find(s => s === a.status)!;
  }

  ActivityStatus = ActivityStatus;

  async refresh() {
    this.activities.splice(0);
    for await (const a of this.remult.repo(Activity).iterate({
      where: row => row.vids.contains(this.remult.user.id)
    })) {
      await a.$.tid.load();
      console.log(a.tid ? a.tid.name : 'NULL');
      this.activities.push(a);
    }
  }

  async setNextStatus(a: Activity, status: ActivityStatus) {
    let next = a.status.next();
    if (!next) {
      next = a.status;
    } 
    if (next !== a.status) {
      a.status = next;
      await a.save();
    }
  }

}
