import { Component, OnInit } from '@angular/core';
import { GridSettings, openDialog } from '@remult/angular';
import { getFields, Remult } from 'remult';
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

  get $() { return getFields(this, this.remult) };
  terms = terms;
  tenants: GridSettings<Tenant> = new GridSettings<Tenant>(
    this.remult.repo(Tenant),
    {
      allowInsert: true,// this.remult.isAllowed([Roles.manager, Roles.admin]) as boolean,
      allowDelete: true,
      allowUpdate: true,// this.remult.isAllowed(Roles.manager),
      // allowSelection: true,
      numOfColumnsInGrid: 10,
      columnSettings: _ => [_.name, _.mobile, _.address],
      rowButtons: [
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.addActivity,
          click: async (_) => await this.addActivity(_)
        }
      ]
    }
  );

  constructor(private remult: Remult) { }

  ngOnInit(): void {
  }

  async refresh() {
    await this.tenants.reloadData();
  }

  async addActivity(tnt: Tenant) {
    let changes = await openDialog(ActivityDetailsComponent,
      _ => _.args = { tid: tnt.id },
      _ => _ ? _.args.changed : false);
    if (changes) {
      await this.refresh();
    }
  }
isBoard(){
  return this.remult.isAllowed(Roles.board);
}
  async addTenant() {
    let t = this.remult.repo(Tenant).create();
    let changed = await openDialog(InputAreaComponent,
      _ => _.args = {
        title: terms.addTenant,
        fields: () => [
          { field: t.$.bid, visible: () => this.isBoard() },
          t.$.name, 
          t.$.mobile, 
          t.$.address, 
          t.$.birthday, 
          t.$.defVids],
        ok: async () => { await t.save(); }
      },
      _ => _ ? _.args.ok : false);
    if (changed) {
      await this.refresh();
    }
  }

}
