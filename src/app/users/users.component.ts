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

  users = new GridSettings(this.remult.repo(Users), {
    allowDelete: true,
    allowInsert: true,
    allowUpdate: true,
    numOfColumnsInGrid: 10,

    orderBy: h => [h.name],
    rowsInPage: 100,

    columnSettings: users => [
      users.name,
      {
        field: users.admin, valueChanged: () => {
          if (users.admin) {
            // users.board = false;
            // users.manager = false;
            // users.volunteer = false;
          }
        }
      },
      {
        field: users.board, valueChanged: () => {
          if (users.board) {
            // users.admin = false;
            // users.manager = false;
            // users.volunteer = false;
          }
        }
      },
      {
        field: users.manager, valueChanged: () => {
          if (users.manager) {
            // users.admin = false;
            // users.board = false;
            // users.volunteer = false;
          }
        }
      },
      {
        field: users.volunteer, valueChanged: () => {
          if (users.volunteer) {
            // users.admin = false;
            // users.board = false;
            // users.manager = false;
          }
        }
      },
      users.mobile,
      users.email,
      { field: users.bid, caption: terms.branch, readonly: !this.remult.isAllowed(Roles.admin) }
    ],
    rowButtons: [{
      name: terms.resetPassword,
      click: async () => {

        if (await this.dialog.yesNoQuestion("Are you sure you want to delete the password of " + this.users.currentRow.name)) {
          await UsersComponent.resetPassword(this.users.currentRow.id);
          this.dialog.info(terms.passwordReset);
        };
      }
    }
    ],
    confirmDelete: async (h) => {
      return await this.dialog.confirmDelete(h.name)
    },
  });
  @BackendMethod({ allowed: Roles.admin })
  static async resetPassword(userId: string, remult?: Remult) {
    let u = await remult!.repo(Users).findId(userId);
    if (u) {
      let pass = process.env.DEFAULT_PASSWORD;
      await u.updatePassword(pass!);
      await u._.save();
    }
  }



  ngOnInit() {
  }

}
