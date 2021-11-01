import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataAreaSettings } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { terms } from '../../../terms';
import { Photo } from '../../photo';
import { Activity } from '../activity';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss']
})
export class ActivityDetailsComponent implements OnInit {

  args: {
    aid?: string,
    tid: string,
    readonly?: boolean,
    changed?: boolean
  } = { aid: '', tid: '', readonly: false, changed: false };
  today = new Date();
  activity = this.remult.repo(Activity).create({
    purposeDesc: 'לארח חברה לספר ולהקשיב',
    date: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + 1),
    fh: '14:00',
    th: '16:00'
  });
  top = new DataAreaSettings({});
  fields = new DataAreaSettings({});
  images: Photo[] = [];
  terms = terms;
  @Field({ caption: terms.branch })
  bid: string = '';
  get $() { return getFields(this, this.remult) };

  constructor(private remult: Remult, private win: MatDialogRef<any>) { }

  async ngOnInit() {
    if (!this.args) {
      this.args = { aid: '', tid: '', readonly: false, changed: false };
    }
    if (!this.args.tid) {
      this.args.tid = '';
    }
    this.args.changed = false;
    await this.retrieve();
  }

  async retrieve() {
    this.activity.tid = this.args.tid;
    if (this.args.aid && this.args.aid.length > 0) {
      this.activity = await this.remult.repo(Activity).findId(
        this.args.aid);
    }
    console.log(1);
    this.top = new DataAreaSettings({
      fields: () => [
        [this.activity.$.status]//, this.$.bid]
      ]
    }) 
    console.log(2);
    this.fields = new DataAreaSettings({
      fields: () => [
        this.activity.$.purpose,
        this.activity.$.purposeDesc,
        {field: this.activity.$.tid, readonly: true },
        this.activity.$.vids,
        this.activity.$.date,
        [this.activity.$.fh, this.activity.$.th],
        { field: this.activity.$.remark, caption: terms.commentAndSummary }
      ]
    });
  }
  
  async saveAndClose(){
    await this.activity.save();
    this.args.changed = true;
    this.close();
  }

  close(){
    this.win.close();
  }

}
