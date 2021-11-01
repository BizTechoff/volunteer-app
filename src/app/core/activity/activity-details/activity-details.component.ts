import { Component, OnInit } from '@angular/core';
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
    tid: string,
    readonly: boolean
  } = { tid: '', readonly: false };
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

  constructor(private remult: Remult) { }

  async ngOnInit() {
    if (!this.args) {
      this.args = { tid: '', readonly: false };
    }
    if (!this.args.tid) {
      this.args.tid = '';
    }
    await this.retrieve();
  }

  async retrieve() {
    if (this.args.tid.length > 0) {
      this.activity = await this.remult.repo(Activity).findId(
        this.args.tid);
    }
    this.top = new DataAreaSettings({
      fields: () => [
        [this.activity.$.status, this.$.bid]
      ]
    })
    this.fields = new DataAreaSettings({
      fields: () => [
        this.activity.$.purpose,
        this.activity.$.purposeDesc,
        this.activity.$.tid,
        this.activity.$.vids,
        this.activity.$.date,
        [this.activity.$.fh, this.activity.$.th],
        { field: this.activity.$.remark, caption: terms.commentAndSummary }
      ]
    });
  }

}
