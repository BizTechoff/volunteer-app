import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { DataAreaSettings, DataControl, GridSettings } from '@remult/angular';
import { ContainsFilterFactory, Field, getFields, Remult } from 'remult';
import { FILTER_IGNORE } from '../../../common/globals';
import { UserIdName } from '../../../common/types';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Langs, Users } from '../../../users/users';
import { Branch } from '../../branch/branch';
import { Tenant } from '../../tenant/tenant';

@Component({
  selector: 'app-volunteers-assignment',
  templateUrl: './volunteers-assignment.component.html',
  styleUrls: ['./volunteers-assignment.component.scss']
})
export class VolunteersAssignmentComponent implements OnInit {

  
  contains(l1: ContainsFilterFactory<Langs[]>, l2: Langs[]) {
    let result = FILTER_IGNORE;
    for (const l of l2) {
      result = result.or(l1.contains(l.id.toString()));
    }
    return result;
  }

  args: {
    bid: Branch,
    aid: string,
    tenant: Tenant,
    tname: string,
    langs: Langs[],
    changed?: boolean,
    vids: UserIdName[]
  } = { bid: undefined!, aid: '', tenant: undefined!, tname: '', langs: [], changed: false, vids: [] as UserIdName[] };
  @DataControl<VolunteersAssignmentComponent>({ valueChange: async (r) => await r.refresh() })
  @Field({ caption: `${terms.serachForTenantNameHere}` })
  search: string = ''
  @DataControl<VolunteersAssignmentComponent>({
    valueChange: async (r, _) => { await r.refresh(); }
  })
  @Field<any, boolean>()
  filterBtTenantLangs = false;
  filterBtTenantLangsArea = new DataAreaSettings({
    fields: () => [this.$.filterBtTenantLangs]
  });
  lgDesc = '';
  volunteers = new GridSettings<Users>(this.remult.repo(Users),
    {
      where: u => u.volunteer.isEqualTo(true)
        .and(u.bid!.isEqualTo(this.args.bid))
        .and(this.filterBtTenantLangs ? this.contains(u.langs, this.args.langs) : FILTER_IGNORE)
        .and(this.search ? u.name.contains(this.search) : FILTER_IGNORE)
        .and(this.isManager() ? FILTER_IGNORE : u.id.isIn(this.args.tenant.defVids.map(x=>x.id))),
      allowCrud: false,
      allowSelection: true,
      columnSettings: (u) => [{ field: u.name, caption: 'שם' }, u.langs, u.email],
      gridButtons: [
        {
          textInMenu: () => terms.refresh,
          icon: 'refresh',
          click: async () => { await this.refresh(); }
        }
      ],
    });

  constructor(private remult: Remult, private win: MatDialogRef<any>) { }

  get $() { return getFields(this, this.remult) };
  terms = terms;

  isManager(){
    return this.remult.isAllowed(Roles.manager);
  }

  async ngOnInit() {
    console.log(this.args.tenant.defVids);
    this.lgDesc = this.args.langs.map(_ => _.caption).join(', ');
    if (!this.args.vids) {
      this.args.vids = [] as UserIdName[];
    }
    if (this.args.vids.length > 0) {
      console.log('this.args.vids', this.args.vids);
      let ids = this.args.vids.map(x => x.id);
      if (ids.length > 0) {
        let us = await this.remult.repo(Users).find({
          where: row => row.id.isIn(ids)
        });
        this.volunteers.selectedRows.push(...us);
      }
    }
  }

  async refresh() {
    await this.volunteers.reloadData();
  }


  async checkedChanged(ce: MatCheckboxChange) {
    this.filterBtTenantLangs = ce.checked;
    await this.refresh();
  }

  select() {
    this.args.changed = true;
    if (this.args.vids.length > 0) {
      this.args.vids.splice(0);
    }
    // this.args.volids.splice(0);
    for (const u of this.volunteers.selectedRows) {
      this.args.vids.push({ id: u.id, name: u.name });//, email: u.email, sent: false });
      // this.args.volids.push(u);
      console.log(this.args.vids);
    }
    this.win.close();
  }

}
