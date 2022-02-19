import { Component, OnInit } from '@angular/core';
import { DataControlInfo, GridSettings } from '@remult/angular';
import { Remult, SqlDatabase } from 'remult';
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
      where: () => ({
        id: this.remult.user.branch?.length > 0 ? this.remult.user.branch : undefined,
        // $and: [
        // //  Branch.nameStartsWith("א")
        // Branch.hasVolunteer("אבי")
        // ]
        // id: this.remult.branchAllowedForUser()
        // bid: this.isBoard() ? undefined : { $co
      }),
      numOfColumnsInGrid: 10,
      columnSettings: row => {
        let f = [] as DataControlInfo<Branch>[];
        f.push({ field: row.name, width: '130' });
        f.push({ field: row.address });//, width: '155' 
        f.push({ field: row.volunteersCount, width: '90', readonly: true });
        f.push({ field: row.tenantsCount, width: '90', readonly: true });
        f.push({ field: row.assignCount, width: '90', readonly: true });
        f.push({ field: row.activitiesCount, width: '90', readonly: true })
        // f.push({ field: row.foodDeliveries, width: '90', readonly: true });
        // f.push({ field: row.photosCount, width: '90', readonly: true })

        // row.volunteersCount = await this.remult.repo(Users).count({volunteer: true});

        // getValue: (r, v) => {
        //   // for await (const p of this.remult.repo(Tenant).query({
        //   //   where: { bid: row }
        //   // })) {

        //   // }
        //   // let cmd: SqlCommand;
        //   // cmd.execute(`select count(*) from tenants where bid = ${r.id}`);
        //   return 0; /*r.getVolunteersCount()*/
        // }
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

// export class myDummySQLCommand implements SqlCommand {

//   execute(sql: string): Promise<SqlResult> {
//       remu
//   }
//   addParameterAndReturnSqlToken(val: any): string {
//     throw new Error("Method not implemented.");
//       // if (val === null)
//       //     return "null";
//       // if (val instanceof Date)
//       //     val = val.toISOString();
//       // if (typeof (val) == "string") {
//       //     return new SqlBuilder(undefined).str(val);
//       // }
//       // return val.toString();
//   }


// }