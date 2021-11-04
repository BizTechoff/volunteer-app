import { Component, OnInit } from '@angular/core';
import { GridSettings, openDialog } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { FILTER_IGNORE } from '../../../common/globals';
import { InputAreaComponent } from '../../../common/input-area/input-area.component';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { ActivityDetailsComponent } from '../../activity/activity-details/activity-details.component';
import { Tenant } from '../tenant';

@Component({
  selector: 'app-tenants-list',
  templateUrl: './tenants-list.component.html',
  styleUrls: ['./tenants-list.component.scss']
})
export class TenantsListComponent implements OnInit {

  // @DataControl({ clickIcon: 'search', allowClick: () => true, click: () => {} })
  @Field({ caption: `${terms.serachForTenantNameHere}` })
  search: string = ''

  get $() { return getFields(this, this.remult) };
  terms = terms;
  tenants: GridSettings<Tenant> = new GridSettings<Tenant>(
    this.remult.repo(Tenant),
    {
      where: _ => this.isBoard() ? FILTER_IGNORE : _.bid.isEqualTo(this.remult.user.bid),
      // where: _ => this.isBoard() ? FILTER_IGNORE : _.bid.isEqualTo(this.remult.user.bid),
      allowInsert: true,// this.remult.isAllowed([Roles.manager, Roles.admin]) as boolean,
      allowDelete: true,
      allowUpdate: false,// this.remult.isAllowed(Roles.manager),
      // allowSelection: true,
      numOfColumnsInGrid: 10,
      columnSettings: t => [
        { field: t.bid, visible: () => false },
        t.name,
        t.mobile,
        t.address,
        t.birthday,
        t.defVids],
      gridButtons: [
        {
          textInMenu: () => terms.refresh,
          icon: 'refresh',
          click: async () => { await this.refresh(); }
        }
      ],
      rowButtons: [
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.addActivity,
          click: async (_) => await this.openActivity(_)
        },
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.tenantDetails,
          click: async (_) => await this.addTenant(_)
        }
      ]
    }
  );

  constructor(private remult: Remult, private dialog: DialogService) { }

  ngOnInit(): void {
  }

  async refresh() {
    await this.tenants.reloadData();
  }

  async openActivity(tnt: Tenant) {
    let changes = await openDialog(ActivityDetailsComponent,
      _ => _.args = { bid: tnt.bid, tid: tnt.id },
      _ => _ ? _.args.changed : false);
    if (changes) {
      await this.refresh();
    }
  }

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  async addTenant(t?: Tenant) {
    if (!t) {
      t = this.remult.repo(Tenant).create();
    }
    let changed = await openDialog(InputAreaComponent,
      _ => _.args = {
        title: terms.addTenant,
        fields: () => [
          { field: t!.$.bid, visible: (r, v) => this.remult.isAllowed(Roles.board) },
          t!.$.name,
          t!.$.mobile,
          t!.$.address,
          t!.$.birthday,
          t!.$.defVids],
        ok: async () => { await t!.save(); }
      },
      _ => _ ? _.ok : false);
    if (changed) {
      await this.refresh();
      if (await this.dialog.yesNoQuestion(terms.shouldAddActivity.replace('!t.name!', t.name))) {
        this.openActivity(t);
      }
    }
  }

}
