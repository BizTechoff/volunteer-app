import { Component, OnInit } from '@angular/core';
import { GridSettings, openDialog } from '@remult/angular';
import { BackendMethod, Remult } from 'remult';
import { DialogService } from '../common/dialog';
import { InputAreaComponent } from '../common/input-area/input-area.component';
import { Activity } from '../core/activity/activity';
import { Tenant } from '../core/tenant/tenant';
import { terms } from '../terms';
import { Roles } from './roles';
import { Users } from './users';



@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  constructor(private dialog: DialogService, public remult: Remult) {
  }
  isAdmin() {
    return this.remult.isAllowed(Roles.admin);
  }

  users!: GridSettings<Users>;

  async ngOnInit() {
    this.users = await this.initGrid();
    // await this.refresh();
  }

  async initGrid() {
    return new GridSettings<Users>(this.remult.repo(Users), {
      allowDelete: false,
      allowInsert: true,
      allowUpdate: true,
      numOfColumnsInGrid: 10,

      where: {
        $or: [
          { bid: this.remult.branchAllowedForUser() },
          { branch2: this.remult.branchAllowedForUser() }
          // { bid: { $id: this.remult.user.branch } },
          // { branch2: { $id: this.remult.user.branch } }
        ]
      },

      columnSettings: users => [
        users.name,
        {
          field: users.admin, width: '80', //width: '80',
          valueChange: user => {
            if (user.admin) {
              user.donor = false;
              user.board = false;
              user.manager = false;
              user.volunteer = false;
            }
          }
        },
        {
          field: users.donor, width: '80',
          valueChange: user => {//, width: '80'
            if (users.donor) {
              user.admin = false;
              user.board = false;
              user.manager = false;
              user.volunteer = false;
            }
          }
        },
        {
          field: users.board, width: '80',
          valueChange: user => {//, width: '80'
            if (users.board) {
              user.admin = false;
              user.donor = false;
              user.manager = false;
              user.volunteer = false;
            }
          }
        },
        {
          field: users.manager, width: '80', valueChange: user => {//, width: '80'
            if (users.manager) {
              user.admin = false;
              user.donor = false;
              user.board = false;
              // user.volunteer = false;
            }
          }
        },
        {
          field: users.volunteer, width: '80', valueChange: user => {//, width: '80'
            if (users.volunteer) {
              user.admin = false;
              user.donor = false;
              user.board = false;
              // user.manager = false;
            }
          }
        },
        {
          field: users.bid, caption: terms.branch,
          getValue: (_, f) => f.value ? f.value.name + (_.branch2 ? ' (+1)' : '') : ''
        },//, width: '80' //, readonly: this.remult.isAllowed(Roles.board)
        // { field: users.branch2, caption: terms.branch2 },//, width: '80' //, readonly: this.remult.isAllowed(Roles.board)
        { field: users.email },
        { field: users.mobile }//, width: '100'
      ],
      gridButtons: [
        {
          textInMenu: () => terms.refresh,
          icon: 'refresh',
          click: async () => { await this.refresh(); }
        }
      ],
      rowButtons: [
        // {
        //   name: terms.resetPassword,
        //   icon: 'password',
        //   click: async () => {

        //     if (await this.dialog.yesNoQuestion("Are you sure you want to delete the password of " + this.users.currentRow.name)) {
        //       await UsersComponent.resetPassword(this.users.currentRow.id);
        //       this.dialog.info(terms.passwordReset);
        //     };
        //   }
        // }, 
        {
          visible: (row) => this.remult.user.isAdmin && row.volunteer && !row.manager,
          textInMenu: terms.addBranch,
          icon: 'domain_add',//,
          click: async (_) => await this.addBranch(_)
        },
        {
          visible: (_) => this.remult.isAllowed(Roles.admin),
          textInMenu: terms.deleteUser,
          icon: 'delete',//,
          click: async (_) => await this.deleteUser(_)
        }
        // ,
        // {
        //   textInMenu: terms.sendWelcomeSms,
        //   click: async () => await this.sendWelcomeMeesage(
        //     this.users.currentRow.name,
        //     this.users.currentRow.mobile)
        // }
      ],
      confirmDelete: async (h) => {
        return await this.dialog.confirmDelete(h.name)
      },
    });
  }

  async refresh() {
    await this.users.reloadData();
  }

  async addBranch(u: Users) {
    if (u && u.id) {
      let clone = await this.remult.repo(Users).findId(u.id)
      openDialog(InputAreaComponent,
        _ => _.args = {
          title: terms.addSecondBranch.replace('!user!', clone.name),
          fields: () => [clone.$.branch2!],
          ok: async () => { await clone.save(); await this.refresh() }
        });
    }
  }

  async deleteUser(u: Users) {
    let yes = await this.dialog.confirmDelete(`יוזר: ${u.name}`);
    if (yes) {
      let count = await this.remult.repo(Activity).count({ vids: { $contains: u.id } });
      if (count > 0) {
        this.dialog.error('לא ניתן למחוק יוזר עם פעילויות');
      }
      else {
        count = await this.remult.repo(Tenant).count({ defVids: { $contains: u.id } });
        if (count > 0) {
          this.dialog.error('לא ניתן למחוק יוזר שמשוייך לדייר');
        }
        else {
          await u.delete();
          this.dialog.info('היוזר נמחק בהצלחה');
          await this.refresh();
        }
      }
    }
  }

  @BackendMethod({ allowed: Roles.admin })
  static async resetPassword(userId: string, remult?: Remult) {
    let u = await remult!.repo(Users).findId(userId);
    if (u) {
      let pass = process.env.DEFAULT_PASSWORD;
      await u.updatePassword(pass!);
      await u._.save();
    }
  }

}
