import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BusyService, openDialog } from '@remult/angular';
import { Remult } from 'remult';
import { Branch } from '../../core/branch/branch';
import { terms } from '../../terms';
import { Roles } from '../../users/roles';
import { Langs } from '../../users/users';
import { InputAreaComponent } from '../input-area/input-area.component';

@Component({
  selector: 'app-select-branch',
  templateUrl: './select-branch.component.html',
  styleUrls: ['./select-branch.component.scss']
})
export class SelectBranchComponent implements OnInit {
  searchString = '';
  options = [
    Langs.hebrew, Langs.english, Langs.russian, Langs.french
  ]
  args!: {
    title?: string,
    onSelect: (p: Branch) => void;
  }
  constructor(private remult: Remult, private busy: BusyService, private dialogRef: MatDialogRef<any>) { }
  branches: Branch[] = [];
  terms = terms;
  ngOnInit() {
    this.loadBranchs();
  }
  async loadBranchs() {
    this.branches = await this.remult.repo(Branch).find({
      where: t =>
        this.searchString
          ? t.name.contains(this.searchString)
          : undefined!
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
    return this.remult.isAllowed(Roles.board);
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
