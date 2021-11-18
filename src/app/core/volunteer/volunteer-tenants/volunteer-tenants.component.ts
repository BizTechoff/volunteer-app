import { Component, OnInit } from '@angular/core';
import { GridSettings, openDialog } from '@remult/angular';
import { Remult } from 'remult';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { ActivityDetailsComponent } from '../../activity/activity-details/activity-details.component';
import { Tenant } from '../../tenant/tenant';

@Component({
  selector: 'app-volunteer-tenants',
  templateUrl: './volunteer-tenants.component.html',
  styleUrls: ['./volunteer-tenants.component.scss']
})
export class VolunteerTenantsComponent implements OnInit {

  tenants = new GridSettings<Tenant>(
    this.remult.repo(Tenant),
    {
      where: row => row.defVids.contains(this.remult.user.id),
      columnSettings: row =>[
        row.name,
        row.age,
        row.mobile,
        row.langs,
        row.address
      ],
      gridButtons: [
        {
          textInMenu: () => terms.refresh,
          icon: 'refresh',
          click: async () => { await this.refresh(); }
        }
      ],
      rowButtons: [
        {
          visible: (_) => !_.isNew() && !this.isDonor(),
          textInMenu: terms.addActivity,
          icon: 'add',
          click: async (_) => await this.openActivity(_)
        }
      ]
    });
  constructor(private remult: Remult) { }

  async ngOnInit() {
    await this.refresh();
  }

  isDonor() {
    return this.remult.isAllowed(Roles.donor);
  }

  async refresh() {
    this.tenants.reloadData();
  }

  async openActivity(tnt: Tenant) {
    let changes = await openDialog(ActivityDetailsComponent,
      _ => _.args = { bid: tnt.bid, tid: tnt },
      _ => _ ? _.args.changed : false);
    if (changes) {
      await this.refresh();
    }
  }

}
