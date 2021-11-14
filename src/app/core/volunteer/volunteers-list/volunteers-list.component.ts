import { Component, OnInit } from '@angular/core';
import { DataControl, GridSettings, openDialog } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { FILTER_IGNORE } from '../../../common/globals';
import { InputAreaComponent } from '../../../common/input-area/input-area.component';
import { SelectTenantComponentComponent } from '../../../common/select-tenant-component/select-tenant-component.component';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Users } from '../../../users/users';
import { Branch } from '../../branch/branch';

@Component({
  selector: 'app-volunteers-list',
  templateUrl: './volunteers-list.component.html',
  styleUrls: ['./volunteers-list.component.scss']
})
export class VolunteersListComponent implements OnInit {

  @DataControl<VolunteersListComponent>({ valueChange: async (r) => await r.refresh() })
  @Field({ caption: `${terms.serachForVolunteerHere}` })
  search: string = ''

  get $() { return getFields(this, this.remult) };
  terms = terms;

  volunteers: GridSettings<Users> = new GridSettings<Users>(
    this.remult.repo(Users),
    {
      where: _ => _.volunteer.isEqualTo(true)
        .and(this.isBoard() ? FILTER_IGNORE : _.bid!.contains(this.remult.user.bid))
        .and(this.search ? _.name.contains(this.search) : FILTER_IGNORE),
      newRow: _ => _.volunteer = true,
      allowCrud: false,
      // allowSelection: true,
      numOfColumnsInGrid: 10,
      columnSettings: _ => [
        { field: _.bid, caption: 'סניף' },
        { field: _.name, caption: 'שם' },
        _.mobile,
        _.langs,
        _.birthday,
        { field: _.defTid, caption: terms.defaultTenant },],
      gridButtons: [
        {
          textInMenu: () => terms.refresh,
          icon: 'refresh',
          click: async () => { await this.refresh(); }
        }
      ],
      rowButtons: [
        {
          textInMenu: terms.volunteerDetails,
          icon: 'edit',
          click: async (u) => await this.addVolunteer(u)
        },
        {
          //  visible: (v) => { return  this.showActivities(v)},
          textInMenu: terms.showActivities,
          icon: 'list'
        },
        {
          visible: (_) => !_.isNew(),
          textInMenu: terms.transferVolunteer,
          icon: 'reply',
          click: async (_) => await this.transferVolunteer(_)
        },
        { 
          visible: (_) => !_.isNew(),
          textInMenu: terms.deleteVolunteer,
          icon: 'delete',//,
          // click: async (_) => await this.addTenant(_)
        }
      ]
    }
  );

  constructor(private remult: Remult) { }

  ngOnInit(): void {
  }

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  async refresh() {
    await this.volunteers.reloadData();
  }

  async transferVolunteer(v: Users) {

  } 

  async showActivities(user: Users) {
    return true;
  }

  async addVolunteer(u?: Users) {
    if (!u) {
      u = this.remult.repo(Users).create();
      u.volunteer = true;
      u.bid = this.isBoard() ? undefined : await this.remult.repo(Branch).findId(this.remult.user.bid);
    }
    let changed = await openDialog(InputAreaComponent,
      _ => _.args = {
        title: u!.isNew() ? terms.addVolunteer : terms.volunteerDetails,
        fields: () => [
          { field: u!.$.bid, visible: (r, v) => this.remult.isAllowed(Roles.board) },
          { field: u!.$.name, caption: terms.name },
          u!.$.mobile,
          u!.$.langs,
          u!.$.birthday,
          u!.$.email,
          { field: u!.$.defTid, clickIcon: 'search', click: async () => await this.openTenants(u!) }
        ],
        ok: async () => { await (u!.isNew() ? u!.create() : u!.save()); }
      },
      _ => _ ? _.ok : false);
    if (changed) {
      await this.refresh();
    }
  }

  async openTenants(u: Users) {
    await openDialog(SelectTenantComponentComponent, x => x.args = {
      bid: u.bid!,
      onSelect: t => u.defTid = t,
      title: 'דייר',// f.metadata && f.metadata.caption?f.metadata.caption:'בחירה',
      tenantLangs: []
    });
  }

}
