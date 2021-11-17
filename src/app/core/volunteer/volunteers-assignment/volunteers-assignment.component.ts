import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataControl, GridSettings } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { FILTER_IGNORE } from '../../../common/globals';
import { UserIdName } from '../../../common/types';
import { terms } from '../../../terms';
import { Langs, Users } from '../../../users/users';
import { Branch } from '../../branch/branch';

@Component({
  selector: 'app-volunteers-assignment',
  templateUrl: './volunteers-assignment.component.html',
  styleUrls: ['./volunteers-assignment.component.scss']
})
export class VolunteersAssignmentComponent implements OnInit {

  args: {
    bid: Branch,
    aid: string,
    tname: string,
    langs: Langs[],
    changed?: boolean,
    vids: UserIdName[]
  } = { bid: undefined!, aid: '', tname: '', langs: [], changed: false, vids: [] as UserIdName[] };
  @DataControl<VolunteersAssignmentComponent>({ valueChange: async (r) => await r.refresh() })
  @Field({ caption: `${terms.serachForTenantNameHere}` })
  search: string = ''

  lgDesc = '';

  volunteers = new GridSettings<Users>(this.remult.repo(Users),
    {
      where: u => u.volunteer.isEqualTo(true)
        .and(u.bid!.isEqualTo(this.args.bid))
        .and(this.search ? u.name.contains(this.search) : FILTER_IGNORE),
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

  async ngOnInit() {
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
