import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataControl, GridSettings } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { FILTER_IGNORE } from '../../../common/globals';
import { terms } from '../../../terms';
import { Langs, Users } from '../../../users/users';

@Component({
  selector: 'app-volunteers-assignment',
  templateUrl: './volunteers-assignment.component.html',
  styleUrls: ['./volunteers-assignment.component.scss']
})
export class VolunteersAssignmentComponent implements OnInit {
 
  args: {
    bid: string,
    aid: string,
    tname: string, 
    langs: Langs[],
    changed?: boolean,
    vids: string[]
  } = { bid: '', aid: '', tname: '', langs: [], changed: false, vids: [] };
  @DataControl<VolunteersAssignmentComponent>({ valueChange: async (r) => await r.refresh() })
  @Field({ caption: `${terms.serachForTenantNameHere}` })
  search: string = ''

  lgDesc = '';

  volunteers = new GridSettings<Users>(this.remult.repo(Users),
    {
      where: u => u.volunteer.isEqualTo(true)
        .and(u.bid.isEqualTo(this.args.bid))
        .and(this.search ? u.name.contains(this.search) : FILTER_IGNORE),
      allowCrud: false,
      allowSelection: true, 
      columnSettings: (u) => [{field: u.name, caption: 'שם'}, u.langs],
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
    this.lgDesc= this.args.langs.map(_ => _.caption).join(', ');
    if (this.args.vids.length > 0) {
      let vids = await this.remult.repo(Users).find({
        where: u => u.id.isIn(this.args.vids)
      });
      if (vids && vids.length > 0)
        this.volunteers.selectedRows.push(...vids);
    }
  }

  async refresh() {
    await this.volunteers.reloadData();
    // for (let i = 0; i < 30; ++i) {
    //   this.volunteers.addNewRow();
    // }
  }

  select() {
    this.args.changed = true;
    this.args.vids.splice(0);
    for (const u of this.volunteers.selectedRows) {
      this.args.vids.push(u.id);
    }
    this.win.close();
  }

}
