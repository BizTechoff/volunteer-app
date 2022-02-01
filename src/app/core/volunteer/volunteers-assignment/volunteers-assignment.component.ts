import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { DataAreaSettings, DataControl, DataControlInfo, GridSettings } from '@remult/angular';
import { EntityFilter, Field, getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { OnlyVolunteerEditActivity } from '../../../common/globals';
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


  contains(l2: Langs[]) {
    let result: EntityFilter<Users> = { $or: [] };
    for (const l of l2) {
      result.$or!.push({
        langs: { $contains: l.id.toString() }
      })
    }
    return result
  }

  args: {
    allowChange: boolean,
    branch: Branch,
    explicit: UserIdName[],
    langs: Langs[],
    title: string,
    selected: UserIdName[],
    changed?: boolean,
    organizer: string /* user-id */
  } = { allowChange: true, branch: undefined!, title: '', langs: [], changed: false, explicit: [] as UserIdName[], selected: [] as UserIdName[], organizer: '' };

  @DataControl<VolunteersAssignmentComponent>({ valueChange: async (r) => await r.refresh() })
  @Field((col, rmt) => { col.caption = rmt.user.isVolunteer ? `${terms.serachByName}` : `${terms.serachForVolunteerHere}` })
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

  constructor(public remult: Remult, private dialog: DialogService, private win: MatDialogRef<any>) {
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
    return this.remult.user.isReadOnly;
  }

  isManager() {
    return this.remult.user.isManagerOrAbove;
  }

  async ngOnInit() {
    this.lgDesc = this.args.langs.map(_ => _.caption).join(', ');
    if (!this.args.selected) {
      this.args.selected = [] as UserIdName[];
    }
    await this.initGrid();
    await this.refresh();
  }

  async initGrid() {
    this.volunteers = new GridSettings<Users>(this.remult.repo(Users),
      {
        where: () => {
          let result: EntityFilter<Users> = {
            volunteer: true,
            $and: []
          };
          if (this.filterBtTenantLangs) {
            result.$and!.push(this.contains(this.args.langs));
          }
          if (this.search) {
            result.$and!.push({ name: { $contains: this.search } });
          }
          if (this.args.selected.length > 0) {
            result.$and!.push({ id: { $ne: this.args.selected.map(u => u.id) } });
          }
          // if (this.args.explicit) {
          //   result.$and!.push({ id: this.args.explicit.map(x => x.id) });
          // }
          // else {
          result.$and!.push({ bid: this.args.branch });
          // }
          return result;
        },
        allowCrud: false,
        // allowSelection: true,
        // selectedChanged: () => {},
        columnSettings: (u) => {
          // this.args.selected.map(u => u.id)
          let f = [] as DataControlInfo<Users>[]
          f.push({ field: u.name, caption: 'שם', width: '150' })
          if (!this.remult.user.isVolunteer) {
            f.push(u.langs, u.email);
          }
          return f
        },
        gridButtons: [
          {
            //  visible: () => {},
            textInMenu: () => terms.refresh,
            icon: 'refresh',
            click: async () => { await this.refresh(); }
          }
        ],
        rowButtons: [
          {
            visible: (row) => { return this.args.selected.find(r => r.id === row.id) ? false : true; },
            textInMenu: () => terms.addVolunteerToTenant,
            showInLine: true,
            icon: 'person_add',
            click: async (row) => { await this.addVolunteer(row); }
          }
          // ,
          // {
          //   visible: (row) => { return this.args.selected.find(r => r.id === row.id) ? true : false; },
          //   textInMenu: () => terms.removeVolunteerFromTenant,
          //   showInLine: true,
          //   icon: 'person_remove',
          //   click: async (row) => { await this.removeVolunteer(row.id); }
          // }
        ]
      });
  }

  getSelectedNames() {
    return this.args.selected.map(s => s.name).join(", ");
  }

  async refresh() {
    await this.volunteers.reloadData();
  }

  async checkedChanged(ce: MatCheckboxChange) {
    this.filterBtTenantLangs = ce.checked;
    await this.refresh();
  }

  async addVolunteer(v: Users) {
    let f = this.args.selected.find(r => r.id === v.id);
    if (!f) {
      this.args.selected.push({ id: v.id, name: v.name });
      // this.volunteers.filterHelper.addToFindOptions({load:})
      this.refresh()
    }
  }

  async removeVolunteer(uid: string) {
    let f = this.args.selected.find(r => r.id === uid);
    if (f) {
      if (this.args.organizer && this.args.organizer.length > 0 && f.id === this.args.organizer) {
        this.dialog.info(terms.canNotRemoveActivityOrganizer)
        return;
      }
      let index = this.args.selected.indexOf(f);
      this.args.selected.splice(index, 1);
      await this.refresh();
    }
  }

  select() {
    this.args.changed = true;
    this.win.close();
  }

}
