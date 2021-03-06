import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BusyService, openDialog } from '@remult/angular';
import { Remult } from 'remult';
import { Branch } from '../../core/branch/branch';
import { terms } from '../../terms';
import { Roles } from '../../users/roles';
import { Users } from '../../users/users';
import { InputAreaComponent } from '../input-area/input-area.component';

@Component({
  selector: 'app-select-branch',
  templateUrl: './select-branch.component.html',
  styleUrls: ['./select-branch.component.scss']
})
export class SelectBranchComponent implements OnInit {
  searchString = '';
  args: {
    canSelectAll?: boolean,
    title?: string,
    explicit?: string[],
    onSelect: (b?: Branch) => void
  } = { canSelectAll: true, title: '', explicit: [], onSelect: undefined! }
  constructor(public remult: Remult, private busy: BusyService, private dialogRef: MatDialogRef<any>) { }
  branches: Branch[] = [];
  terms = terms;
  ngOnInit() {
    // console.log(this.args.canSelectAll)
    // this.args.canSelectAll = true
    if (!this.args.explicit) {
      this.args.explicit = [] as string[]
    }
    this.loadBranchs();
  }
  async loadBranchs() {
    let bids = [] as string[]
    let uid = this.remult.user.id
    let u = await this.remult.repo(Users).findId(uid)
    if (u) {
      if (u.bid) {
        bids.push(u.bid.id)
      }
      if (u.branch2) {
        bids.push(u.branch2.id)
      }
    }
    // console.log('this.args.explicit',this.args.explicit)
    this.branches = await this.remult.repo(Branch).find({
      where: {
        name: this.searchString ? { $contains: this.searchString } : undefined!,
        id: bids.length > 0 ? bids : undefined! // {} [] - no-one-selected
        // id: this.args.explicit && this.args.explicit.length > 0 ? this.args.explicit : undefined
      }
    });
  }
  async doSearch() {
    await this.busy.donotWait(async () => this.loadBranchs());
  }

  select(p: Branch) {
    this.args.onSelect(p);
    this.dialogRef.close();
  }
  selectFirst() {
    if (this.branches.length > 0)
      this.select(this.branches[0]);
  }
  isBoard() {
    return this.remult.user.isBoardOrAbove
  }
  async clear() {
      this.args.onSelect(undefined!);
  }
  async create() {
    let t = this.remult.repo(Branch).create();
    let changed = await openDialog(InputAreaComponent,
      _ => _.args = {
        title: terms.addBranch,
        fields: () => [
          t!.$.name,
          t!.$.address
        ],
        ok: async () => {
          await t!.save();
          this.select(t);
        }
      },
      _ => _ ? _.ok : false);
    // if (changed) {
    // await this.loadBranchs();
    // if (await this.dialog.yesNoQuestion(terms.shouldAddActivity.replace('!t.name!', t.name))) {
    //   this.openActivity(t);
    // }
    // }


    // let Branch = this.remult.repo(Branch).create({
    //   name: this.searchString,
    //   type: this.filterBranch
    // });
    // openDialog(EditBranchComponent, x => x.args = {
    //   Branch,
    //   ok: () => {
    //     this.select(Branch);
    //   }
    // });
  }

}
