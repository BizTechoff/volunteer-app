import { Component, OnInit } from '@angular/core';
import { GridSettings, openDialog } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { FILTER_IGNORE } from '../../../common/globals';
import { InputAreaComponent } from '../../../common/input-area/input-area.component';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Users } from '../../../users/users';

@Component({
  selector: 'app-volunteers-list',
  templateUrl: './volunteers-list.component.html',
  styleUrls: ['./volunteers-list.component.scss']
})
export class VolunteersListComponent implements OnInit {

  // @DataControl({ clickIcon: 'search', allowClick: () => true, click: () => {} })
  @Field({ caption: `${terms.serachForVolunteerHere}` })
  search: string = ''

  get $() { return getFields(this, this.remult) };
  terms = terms;

  volunteers: GridSettings<Users> = new GridSettings<Users>(
    this.remult.repo(Users),
    {
      where: _ => _.volunteer.isEqualTo(true)
        .and(this.isBoard() ? FILTER_IGNORE : _.bid.isEqualTo(this.remult.user.bid)),
      newRow: _ => _.volunteer = true,
      allowCrud: false,
      // allowSelection: true,
      numOfColumnsInGrid: 10,
      columnSettings: _ => [
        { field: _.bid, caption: 'סניף' },
        { field: _.name, caption: 'שם' },
        _.mobile,
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

  async showActivities(user: Users) {
    return true;
  }

  async addVolunteer(u?: Users) {
    if (!u) {
      u = this.remult.repo(Users).create();
      u.volunteer = true;
      u.bid = this.isBoard() ? '' : this.remult.user.bid;
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
          { field: u!.$.defTid, caption: terms.defaultTenant }],
        ok: async () => { await u!.create(); }
      },
      _ => _ ? _.ok : false);
    if (changed) {
      await this.refresh();
    }
  }

}
