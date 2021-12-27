import { Component, OnInit } from '@angular/core';
import { DataControlInfo, GridSettings } from '@remult/angular';
import { Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Users } from '../../../users/users';
import { Activity } from '../../activity/activity';
import { Tenant } from '../../tenant/tenant';
import { Branch } from '../branch';

@Component({
  selector: 'app-branches-list',
  templateUrl: './branches-list.component.html',
  styleUrls: ['./branches-list.component.scss']
})
export class BranchesListComponent implements OnInit {

  branches = new GridSettings<Branch>(this.remult.repo(Branch),
    {
      allowCrud: false,
      // allowDelete: false,
      // allowInsert: this.remult.isAllowed(Roles.admin),
      allowUpdate: this.remult.isAllowed(Roles.admin),
      columnSettings: row => {
        let f = [] as DataControlInfo<Branch>[];
        f.push(row.name, row.address);
        // row.volunteersCount = await this.remult.repo(Users).count({volunteer: true});
        f.push({ field: row.volunteersCount, getValue: (r, v) => { 0 /*r.getVolunteersCount()*/ } });
      f.push({ field: row.tenantsCount, getValue: (r, v) => { 0 /*r.getTenantsCount()*/ } });
        // if (this.isAdmin()) { 
        //   f.push(row.email, row.color, row.frame);
        // }  
        return f;
      },
      gridButtons: [
        {
          textInMenu: () => terms.refresh,
          icon: 'refresh',
          click: async () => { await this.refresh(); }
        }
      ]//,
      // rowButtons: [
      //   {
      //     textInMenu: terms.delete,
      //     icon: 'delete',
      //     click: async (row) => await this.deleteBranch(row)
      //   },
      // ]
    }
  );

  constructor(private remult: Remult, private dialog: DialogService) { }

  isAdmin() {
    return this.remult.isAllowed(Roles.admin);
  }

  ngOnInit(): void {
  }

  async refresh() {
    await this.branches.reloadData();
  }

  async deleteBranch(b: Branch) {
    let count = await this.remult.repo(Users).count({ bid!: b });
    if (count > 0) {
      this.dialog.error(terms.canNotDeleteBrnachWhileRelationWithUsers);
      return;
    }
    count = await this.remult.repo(Tenant).count({ bid!: b });
    if (count > 0) {
      this.dialog.error(terms.canNotDeleteBrnachWhileRelationWithTenants);
      return;
    }
    count = await this.remult.repo(Activity).count({ bid!: b });
    if (count > 0) {
      this.dialog.error(terms.canNotDeleteBrnachWhileRelationWithActivities);
      return;
    }
    await b.delete();
    this.dialog.info(terms.branchDeleteSuccefully.replace('!bname!', b.name));
  }

}
