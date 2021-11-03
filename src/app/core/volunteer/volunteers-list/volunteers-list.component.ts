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
  @Field({ caption: `${terms.serachForTenantNameHere}` })
  search: string = ''

  get $() { return getFields(this, this.remult) };
  terms = terms;

  volunteers: GridSettings<Users> = new GridSettings<Users>(
    this.remult.repo(Users),
    {
      where: _ => _.volunteer.isEqualTo(true)
        .and(this.isBoard() ? FILTER_IGNORE : _.bid.isEqualTo(this.remult.user.bid)),
      newRow: _ => _.volunteer = true,
      allowInsert: true,// this.remult.isAllowed([Roles.manager, Roles.admin]) as boolean,
      allowDelete: true,
      allowUpdate: true,// this.remult.isAllowed(Roles.manager),
      // allowSelection: true,
      numOfColumnsInGrid: 10,
      columnSettings: _ => [
        { field: _.bid, caption: 'סניף' },
        { field: _.name, caption: 'שם' },
        _.mobile,
        _.birthday,
        { field: _.defTid, caption: terms.defaultTenant },],
      rowButtons: [
        {
          //  visible: (v) => { return  this.showActivities(v)},
          textInMenu: terms.showActivities
        },
        {
          textInMenu: terms.volunteerDetails
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

  async addVolunteer() {
    let t = this.remult.repo(Users).create();
    t.volunteer = true;
    // t.bid = this.remult.user.bid;
    let changed = await openDialog(InputAreaComponent,
      _ => _.args = {
        title: terms.addVolunteer,
        fields: () => [
          { field: t.$.bid, visible: (r, v) => this.remult.isAllowed(Roles.board) },
          { field: t.$.name, caption: terms.name },
          t.$.mobile,
          t.$.email,
          t.$.birthday,
          { field: t.$.defTid, caption: terms.defaultTenant }],
        ok: async () => { /*await t.save();*/ }
      },
      _ => _ ? _.args.ok : false);
    if (changed) {
      await this.refresh();
    }
  }

}
