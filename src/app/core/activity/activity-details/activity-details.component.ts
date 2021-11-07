import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataAreaSettings, openDialog } from '@remult/angular';
import { getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Photo } from '../../photo';
import { VolunteersAssignmentComponent } from '../../volunteer/volunteers-assignment/volunteers-assignment.component';
import { Activity, ActivityStatus } from '../activity';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss']
})
export class ActivityDetailsComponent implements OnInit {

  args: {
    bid?: string,
    aid?: string,
    tid?: string,
    readonly?: boolean,
    changed?: boolean
  } = { bid: '', aid: '', tid: '', readonly: false, changed: false };
  today = new Date();
  activity!: Activity;
  top = new DataAreaSettings({});
  fields = new DataAreaSettings({});
  images: Photo[] = [];
  terms = terms;
  // @Field({ caption: terms.branch })
  // bid: string = '';
  get $() { return getFields(this, this.remult) };

  constructor(private remult: Remult, private dialog: DialogService, private win: MatDialogRef<any>) { }

  async ngOnInit() {
    if (!this.args) {
      this.args = { aid: '', tid: '', readonly: false, changed: false };
    }
    if (!this.args.tid) {
      this.args.tid = '';
    }
    if (!this.args.aid) {
      this.args.aid = '';
    }
    this.args.changed = false;
    await this.retrieve();
  }

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  async retrieve() {
    let validId = this.args.aid && this.args.aid.length > 0;
    if (validId) {
      let found = await this.remult.repo(Activity).findId(this.args.aid!);
      if (found) {
        this.activity = found;
      }
    }
    if (!this.activity) {
      this.activity = this.remult.repo(Activity).create({
        bid: this.isBoard() ? (this.args.bid ? this.args.bid : '0') : this.remult.user.bid,
        tid: this.args.tid,
        purposeDesc: terms.defaultPurposeDesc6,
        date: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + 1),
        fh: '14:00',
        th: '16:00'
      });
    }
    this.top = new DataAreaSettings({
      fields: () => [
        [
          { field: this.activity.$.tid, readonly: true },
          { field: this.activity.$.status }//, readonly: true }
        ]
      ]
    })
    this.fields = new DataAreaSettings({
      fields: () => [
        { field: this.activity.$.bid, visible: (r, v) => this.isBoard() },
        { field: this.activity.$.vids, clickIcon: 'search', click: async () => await this.openAssignment() },
        this.activity.$.purpose,
        this.activity.$.purposeDesc,
        this.activity.$.date,
        [this.activity.$.fh, this.activity.$.th],
        { field: this.activity.$.remark, caption: terms.commentAndSummary }
      ]
    });
  }

  async openAssignment() {

    let bidOk = (this.activity.bid && this.activity.bid.length > 0 && this.activity.bid !== '0')!;
    if (bidOk) { 
      let vids = await openDialog(VolunteersAssignmentComponent,
        input => input.args = { 
          bid: this.activity.bid, 
          aid: this.activity.id, 
          tname: this.activity.tid, 
          langs: '',// this.t.langs, 
          vids: this.activity.vids },
        output => output ? output.args.changed ? output.args.vids : undefined : undefined);
      console.log(vids);
      if (vids) {
        this.activity.vids = vids;
        if (vids.length > 0) {
          this.activity.status = ActivityStatus.w4_start;
        }
        // await this.refresh();
      }
    }
    else {
      await this.dialog.error(terms.mustSetBidForThisAction);
    }
  }

  async saveAndClose() {
    await this.activity.save();
    this.args.changed = true;
    this.args.aid = this.activity.id;
    this.close();
  }

  close() {
    this.win.close();
  }

}
