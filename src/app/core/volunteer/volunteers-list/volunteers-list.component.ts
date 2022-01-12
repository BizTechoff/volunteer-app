import { Component, OnInit } from '@angular/core';
import { DataControl, DataControlInfo, GridSettings, openDialog } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { InputAreaComponent } from '../../../common/input-area/input-area.component';
import { SelectTenantComponent } from '../../../common/select-tenant/select-tenant.component';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Users } from '../../../users/users';
import { Activity } from '../../activity/activity';
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
      where: () => ({
        volunteer: true,
        bid:this.remult.branchAllowedForUser(),
        name: this.search ? { $contains: this.search } : undefined
      }),
      newRow: _ => _.volunteer = true,
      allowCrud: false,
      // allowSelection: true,
      numOfColumnsInGrid: 10,
      columnSettings: u => {
        let f = [] as DataControlInfo<Users>[];
        if (this.isBoard()) {
          f.push(u.bid!);
        }
        f.push(
          { field: u.name, caption: terms.name },
          u.langs,
          u.age,
          u.email,
          u.mobile,
          u.birthday,
          u.points
        );
        return f;
      }, //[
      // { field: _.bid, caption: 'סניף' },
      // { field: _.name, caption: 'שם' },
      // _.langs,
      // _.mobile,
      // _.email,
      // _.birthday//,
      // { field: _.defTid, caption: terms.defaultTenant },
      // ],
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
          click: async (u) => await this.addVolunteer(u.id)
        },
        // {
        //   //  visible: (v) => { return  this.showActivities(v)},
        //   textInMenu: terms.showActivities,
        //   icon: 'list'
        // },
        // {
        //   //  visible: (v) => { return  this.showActivities(v)},
        //   textInMenu: terms.showAssignTenants,
        //   icon: 'assignment_ind'
        // },
        // {
        //   visible: (_) => !_.isNew() && !this.isDonor(),
        //   textInMenu: terms.transferVolunteer,
        //   icon: 'reply',
        //   click: async (_) => await this.transferVolunteer(_)
        // },
        {
          visible: (_) => !_.isNew() && !this.isDonor(),
          textInMenu: terms.deleteVolunteer,
          icon: 'delete',//,
          click: async (_) => await this.deleteVolunteer(_)
        }
      ]
    }
  );

  constructor(private remult: Remult, private dialog: DialogService) { }

  ngOnInit(): void {
  }

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  isDonor() {
    return this.remult.isAllowed(Roles.donor);
  }

  async refresh() {
    await this.volunteers.reloadData();
  }

  async transferVolunteer(v: Users) {

  }

  async showActivities(user: Users) {
    return true;
  }

  async deleteVolunteer(u: Users) {
    let yes = await this.dialog.confirmDelete(terms.volunteer);
    if (yes) {
      let count = await this.remult.repo(Activity).count({ vids: { $contains: u.id } });
      if (count > 0) {
        this.dialog.error('לא ניתן למחוק מתנדב עם פעילויות');
      }
      else {
        await u.delete();
        this.dialog.info('המתנדב נמחק בהצלחה');
        await this.refresh();
      }
    }
  }

  async addVolunteer(vid: string) {
    let isNew = false;
    let title = terms.tenantDetails;
    let u!: Users;
    if (vid && vid.length > 0) {
      u = await this.remult.repo(Users).findId(vid, { useCache: false });
    }
    if (!u) {
      u = this.remult.repo(Users).create();
      u.volunteer = true;
      u.bid = this.isBoard() ? undefined : await this.remult.repo(Branch).findId(this.remult.user.bid);
    }
    let changed = await openDialog(InputAreaComponent,
      _ => _.args = {
        disableClose: u.isNew(),
        title: (u!.isNew() ? terms.addVolunteer : terms.volunteerDetails) + (this.isDonor() ? '(לקריאה בלבד)' : ''),
        fields: () => [
          { field: u!.$.bid, visible: (r, v) => this.isBoard() }, 
          { field: u!.$.branch2, visible: (r, v) => this.isBoard() && u!.hasBranch2() },
          { field: u!.$.name, caption: terms.name },
          u!.$.mobile,
          u!.$.email,
          [
            u!.$.birthday,
            { field: u!.$.age, width: '60', visible: (r, v) => this.remult.isAllowed(Roles.manager) },
          ],
          u!.$.langs,
          { field: u!.$.points, readonly: true }//,
          // { field: u!.$.defTid, clickIcon: 'search', click: async () => await this.openTenants(u!) }
        ],
        ok: async () => {
          if (!this.isDonor()) { await (u!.isNew() ? u!.create() : u!.save()); }
        }
      },
      _ => _ ? _.ok : false);
    if (changed) {
      await this.refresh();
    }
  }

  // async openTenants(u: Users) {
  //   await openDialog(SelectTenantComponent, x => x.args = {
  //     bid: u.bid!,
  //     onSelect: t => u.defTid = t,
  //     title: 'דייר',// f.metadata && f.metadata.caption?f.metadata.caption:'בחירה',
  //     tenantLangs: []
  //   });
  // }

}
