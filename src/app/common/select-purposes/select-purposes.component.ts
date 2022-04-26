import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivityPurpose } from '../../core/activity/activity';
import { terms } from '../../terms';

@Component({
  selector: 'app-select-purposes',
  templateUrl: './select-purposes.component.html',
  styleUrls: ['./select-purposes.component.scss']
})
export class SelectPurposesComponent implements OnInit {

  args: {
    purposes?: ActivityPurpose[],
    removeDelivery?: boolean
  } = { purposes: [], removeDelivery: false };
  allActivityPurpose: { l: ActivityPurpose, c: boolean }[] = [];
  constructor(private win: MatDialogRef<any>) { }
  ActivityPurpose=ActivityPurpose

  ngOnInit(): void {
    ActivityPurpose.getOptions(this.args.removeDelivery).forEach(lng => {
      this.allActivityPurpose.push({ l: lng, c: this.args.purposes?.find(_ => _.id === lng.id) ? true : false })
    });
  }

  terms = terms;

  selectedCount() {
    let count = 0
    for (const p of this.allActivityPurpose) {
      if (p.c) {
        ++count
      }
    }
    // console.log(`selectedCount: { count: ${count} }`)
    return count
  }

  close() {
    this.args.purposes?.splice(0);
    if (this.args.removeDelivery) {
      this.args.purposes?.push(ActivityPurpose.delivery)
    }
    this.allActivityPurpose.forEach(l => {
      if (l.c) {
        this.args.purposes?.push(l.l);
      }
    });
    this.win.close();
  }

  // isChecked(l: ActivityPurpose) {
  //   return this.args.ActivityPurpose?.find(_ => _.id === l.id) ? true : false;
  // }

  // ActivityPurposeelected(l: ActivityPurpose) {
  //   console.log('ActivityPurposeelected');
  // }

}
