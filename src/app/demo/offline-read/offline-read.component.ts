import { Component, OnInit } from '@angular/core';
import { DataControl } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { DialogService } from '../../common/dialog';
import { Branch } from '../../core/branch/branch';

@Component({
  selector: 'app-offline-read',
  templateUrl: './offline-read.component.html',
  styleUrls: ['./offline-read.component.scss']
})
export class OfflineReadComponent implements OnInit {
 
  @DataControl<OfflineReadComponent, Branch>({
    valueChange: async (r, v) => {
      console.log('CurrentStateComponent.valueChange')
      await r.switchBranch();
    }
  })
  @Field({ caption: 'סניף לתצוגה' })

  branch: Branch = undefined!;
  constructor(private remult: Remult, private dialog: DialogService) { }

  async ngOnInit() {
  }
  get $() { return getFields(this, this.remult) };

  async switchBranch() {
    if (this.branch && this.branch.id.length > 0) {
      this.remult.user.bid = this.branch.id;
      // window?.location?.reload();
      this.dialog.info('סניף הוחלף בהצלחה');
    }
  }

}
