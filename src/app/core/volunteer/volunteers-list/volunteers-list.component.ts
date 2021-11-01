import { Component, OnInit } from '@angular/core';
import { GridSettings } from '@remult/angular';
import { Remult } from 'remult';
import { terms } from '../../../terms';
import { Users } from '../../../users/users';

@Component({
  selector: 'app-volunteers-list',
  templateUrl: './volunteers-list.component.html',
  styleUrls: ['./volunteers-list.component.scss']
})
export class VolunteersListComponent implements OnInit {

  volunteers: GridSettings<Users> = new GridSettings<Users>(
    this.remult.repo(Users),
    {
      where: _ => _.volunteer.isEqualTo(true),
      newRow: _ => _.volunteer = true,
      allowInsert: true,// this.remult.isAllowed([Roles.manager, Roles.admin]) as boolean,
      allowDelete: true,
      allowUpdate: true,// this.remult.isAllowed(Roles.manager),
      // allowSelection: true,
      numOfColumnsInGrid: 10,
      columnSettings: _ => [{ field: _.bid, caption: 'שם' }, { field: _.name, caption: 'שם' }, _.mobile, _.birthday, { field: _.defTid, caption: terms.defaultTenant },]
    }
  );

  constructor(private remult: Remult) { }

  ngOnInit(): void {
  }

}
