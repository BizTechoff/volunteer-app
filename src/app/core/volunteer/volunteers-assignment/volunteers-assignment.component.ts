import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { DataAreaSettings, DataControl, GridSettings } from '@remult/angular';
import { ContainsFilterFactory, Field, getFields, Remult } from 'remult';
import { FILTER_IGNORE, OnlyVolunteerEditActivity } from '../../../common/globals';
import { UserIdName } from '../../../common/types';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Langs, Users } from '../../../users/users';
import { Branch } from '../../branch/branch';

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
    allowChange: boolean,
    branch: Branch,
    explicit: UserIdName[],
    langs: Langs[],
    title: string,
    selected: UserIdName[],
    changed?: boolean
  } = {allowChange: true, branch: undefined!, title: '', langs: [], changed: false, explicit: [] as UserIdName[], selected: [] as UserIdName[] };

  @DataControl<VolunteersAssignmentComponent>({ valueChange: async (r) => await r.refresh() })
  @Field({ caption: `${terms.serachForVolunteerHere}` })
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
  volunteers: GridSettings<Users> = undefined!;

  constructor(private remult: Remult, private win: MatDialogRef<any>) {
  }

  get $() { return getFields(this, this.remult) };
  terms = terms;

  isAllowEdit() {
    if (this.isDonor() || (OnlyVolunteerEditActivity && this.isManager() && !this.args.allowChange)) {
      return false;
    }
    return true;
  }
  isDonor() {
    return this.remult.isAllowed(Roles.donor);
  }

  isManager() {
    return this.remult.isAllowed(Roles.manager);
  }

  async ngOnInit() {
    this.lgDesc = this.args.langs.map(_ => _.caption).join(', ');
    if (!this.args.selected) {
      this.args.selected = [] as UserIdName[];
    }
    await this.initGrid();
    await this.refresh();
  }
   
  async initGrid(){
    this.volunteers = new GridSettings<Users>(this.remult.repo(Users),
      {
        where: u => {
          let result = FILTER_IGNORE;
          result = result.and(u.volunteer.isEqualTo(true));
          if (this.filterBtTenantLangs) {
            result = result.and(this.contains(u.langs, this.args.langs));
          }
          if (this.search) {
            result = result.and(u.name.contains(this.search));
          }
          if (this.args.explicit) {
            result = result.and(u.id.isIn(this.args.explicit.map(x => x.id)));
          }
          else {
            result = result.and(u.bid!.isEqualTo(this.args.branch));
          }
          return result;
        },
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
  }

  async refresh() {
    await this.volunteers.reloadData();
    this.setGridSelected();
  }

  setSelected() {
    // this.args.selected.splice(0);
    // if (this.volunteers.selectedRows.length > 0) {
    //   for (const v of this.volunteers.selectedRows) {
    //     this.args.selected.push({ id: v.id, name: v.name });
    //   } 
    // }
    // console.log('this.volunteers.selectedRows.length', this.volunteers.selectedRows.length);
  }

  setGridSelected() {
    this.volunteers.selectedRows = [] as Users[];
    if (this.args.selected.length > 0) {
      // console.log(1);
      
      let ids = this.args.selected.map(x => x.id);
      // console.log(2);
      if (ids.length > 0) {
        let items = this.volunteers.items.filter(itm => ids.includes(itm.id));
        // console.log(3);
        if (items) {
          this.volunteers.selectedRows.push(...items);
        }
      }
    }
  }


  async checkedChanged(ce: MatCheckboxChange) {
    this.filterBtTenantLangs = ce.checked;
    await this.refresh();
  }

  select() {
    this.args.changed = true;
    this.args.selected = [] as UserIdName[];
    for (const u of this.volunteers.selectedRows) {
      this.args.selected.push({ id: u.id, name: u.name });
    }
    this.win.close();
  }

}
