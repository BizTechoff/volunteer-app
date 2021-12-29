import { Component, OnInit } from '@angular/core';
import { GridSettings } from '@remult/angular';
import { BackendMethod, Remult } from 'remult';
import { DialogService } from '../common/dialog';
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

  users: GridSettings<Users> = new GridSettings<Users>(this.remult.repo(Users), {
    allowDelete: true,
    allowInsert: true,
    allowUpdate: true,
    numOfColumnsInGrid: 10,

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
            user.volunteer = false;
          }
        }
      },
      {
        field: users.volunteer, width: '80', valueChange: user => {//, width: '80'
          if (users.volunteer) {
            user.admin = false;
            user.donor = false;
            user.board = false;
            user.manager = false;
          }
        }
      },
      { field: users.bid, caption: terms.branch },//, width: '80' //, readonly: this.remult.isAllowed(Roles.board)
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
      {
        name: terms.resetPassword,
        click: async () => {

          if (await this.dialog.yesNoQuestion("Are you sure you want to delete the password of " + this.users.currentRow.name)) {
            await UsersComponent.resetPassword(this.users.currentRow.id);
            this.dialog.info(terms.passwordReset);
          };
        }
      },
      {
        textInMenu: terms.sendWelcomeSms,
        click: async () => await this.sendWelcomeMeesage(
          this.users.currentRow.name,
          this.users.currentRow.mobile)
      }
    ],
    confirmDelete: async (h) => {
      return await this.dialog.confirmDelete(h.name)
    },
  });

  ngOnInit() {
  }

  async refresh() {
    await this.users.reloadData();
  }

  async sendWelcomeMeesage(name: string, mobile: string) {

    let yes = await this.dialog.yesNoQuestion(
      `לשלוח ל${name} (${mobile}) מסרון עם פרטי התחברות לאפליקציה`);
    if (yes) {
      let message = '';
      message += 'bit.ly/eshel-app ';
      message += '\n';
      message += `שם משתמש: ${name} `;
      message += '\n';
      message += 'סיסמא נמסרת טלפונית';
      message += '\n';
      message += 'תודה לך';

      // let sent = await NotificationService.sendSms({
      //   uid: this.remult.user.id,
      //   mobile: mobile,
      //   message: message
      // });

      // if (sent) {
      //   this.dialog.info(terms.smsSuccefullySent);
      // }
      // else {
      //   this.dialog.info(terms.smsFailSent);
      // }
    };
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
