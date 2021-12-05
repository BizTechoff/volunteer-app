import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BusyService, openDialog } from '@remult/angular';
import { Remult } from 'remult';
import { Branch } from '../../core/branch/branch';
import { Tenant } from '../../core/tenant/tenant';
import { terms } from '../../terms';
import { Roles } from '../../users/roles';
import { Langs } from '../../users/users';
import { FILTER_IGNORE } from '../globals';
import { InputAreaComponent } from '../input-area/input-area.component';

@Component({
  selector: 'app-select-tenant',
  templateUrl: './select-tenant.component.html',
  styleUrls: ['./select-tenant.component.scss']
})
export class SelectTenantComponent implements OnInit {
  searchString = '';
  langs = [Langs.russian];
  options = [
    Langs.hebrew, Langs.english, Langs.russian, Langs.french
  ]
  args!: {
    title?: string,
    // uid: Users,
    bid: Branch,
    tenantLangs: Langs[],
    onSelect: (p: Tenant) => void;
  }
  constructor(private remult: Remult, private busy: BusyService, private dialogRef: MatDialogRef<any>) { }
  tenants: Tenant[] = [];
  terms = terms;
  ngOnInit() {
    this.langs = this.args.tenantLangs;
    this.loadTenants();
  }
  async loadTenants() {
    this.tenants = await this.remult.repo(Tenant).find({
      where: t =>
        // if there is a search value, search by it
        // t.langs.isIn([this.langs])
        t.active.isEqualTo(true)
          .and(this.isManager() ? FILTER_IGNORE : t.defVids.contains(this.remult.user.id))//@@@@@@@@@@@2
          .and(this.isBoard() ? FILTER_IGNORE : t.bid.isEqualTo(this.args.bid))
          .and(
            this.searchString ? t.name.contains(this.searchString)
              : undefined!)
    });
  }
  async doSearch() {
    await this.busy.donotWait(async () => this.loadTenants());
  }

  select(p: Tenant) {
    this.args.onSelect(p);
    this.dialogRef.close();
  }
  selectFirst() {
    if (this.tenants.length > 0)
      this.select(this.tenants[0]);
  }
  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }
  isManager() {
    return this.remult.isAllowed(Roles.manager);
  }
  async create() {
    let t = this.remult.repo(Tenant).create();
    if (!this.isBoard()) {
      t.bid = await this.remult.repo(Branch).findId(this.remult.user.bid);
    }
    let changed = await openDialog(InputAreaComponent,
      _ => _.args = {
        title: terms.addTenant,
        fields: () => [
          { field: t!.$.bid, visible: (r, v) => this.isBoard() },
          t!.$.name,
          t!.$.mobile,
          t!.$.address,
          t!.$.birthday,
          t!.$.langs,
          t!.$.defVids],
        ok: async () => {
          await t!.save();
          this.select(t);
        }
      },
      _ => _ ? _.ok : false);
    // if (changed) {
    // await this.loadTenants();
    // if (await this.dialog.yesNoQuestion(terms.shouldAddActivity.replace('!t.name!', t.name))) {
    //   this.openActivity(t);
    // }
    // }


    // let Tenant = this.remult.repo(Tenant).create({
    //   name: this.searchString,
    //   type: this.filterTenant
    // });
    // openDialog(EditTenantComponent, x => x.args = {
    //   Tenant,
    //   ok: () => {
    //     this.select(Tenant);
    //   }
    // });
  }

}
