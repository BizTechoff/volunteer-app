import { Component, OnInit } from '@angular/core';
import { DataControl, GridSettings, openDialog } from '@remult/angular';
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

  @DataControl<TenantsListComponent>({ valueChange: async (r) => await r.refresh() })
  @Field({ caption: `${terms.serachForTenantNameHere}` })
  search: string = ''

  get $() { return getFields(this, this.remult) };
  terms = terms;
  tenants: GridSettings<Tenant> = new GridSettings<Tenant>(
    this.remult.repo(Tenant),
    {
      where: _ => (this.isBoard() ? FILTER_IGNORE : _.bid.isEqualTo(this.remult.user.bid))
        .and(this.search ? _.name.contains(this.search) : FILTER_IGNORE),
      allowCrud: false,
      numOfColumnsInGrid: 10,
      columnSettings: t => [
        { field: t.bid, visible: () => false },
        t.name,
        t.mobile,
        t.address,
        t.birthday,
        t.langs,
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
          icon: 'add',
          click: async (_) => await this.openActivity(_)
        },
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.tenantDetails,
          icon: 'edit',
          click: async (_) => await this.addTenant(_)
        },
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.showActivities,
          icon: 'list',
          click: async (_) => await this.showActivities(_)
        },
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.deleteTenant,
          icon: 'delete',//,
          // click: async (_) => await this.addTenant(_)
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

  async showActivities(tnt: Tenant) {
    // let changes = await openDialog(ActivityDetailsComponent,
    //   _ => _.args = { bid: tnt.bid, tid: tnt.id },
    //   _ => _ ? _.args.changed : false);
    // if (changes) {
    //   await this.refresh();
    // }
  }

  async openActivity(tnt: Tenant) {
    let changes = await openDialog(ActivityDetailsComponent,
      _ => _.args = { bid: tnt.bid, tid: tnt },
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
      t.bid = this.isBoard() ? '' : this.remult.user.bid;
    }
    f1:Field;
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
