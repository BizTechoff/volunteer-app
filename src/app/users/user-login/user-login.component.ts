import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataAreaSettings, InputField } from '@remult/angular';
import { Remult } from 'remult';
import { AuthService } from '../../auth.service';
import { DialogService } from '../../common/dialog';
import { terms } from '../../terms';
import { PasswordControl } from '../users';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss']
})
export class UserLoginComponent implements OnInit {

  args: { out: { connected?: boolean, error?: string } } = { out: { connected: false, error: '' } }
  mobile = new InputField<string>({ caption: terms.mobile });
  // password = new PasswordControl();
  // area = new DataAreaSettings({
  //   fields: () => [
  //     this.mobile//,
  //     // this.password
  //   ]
  // });

  constructor(private remult: Remult, private auth: AuthService, private dialog: DialogService, private win: MatDialogRef<any>) { }
  terms = terms;

  ngOnInit(): void {
  }

  async signIn() {
    let success = await this.auth.signIn(this.mobile.value.trim());//, this.password.value);
    this.args.out.connected = success;
    this.close();
  }

  close() {
    this.win.close();
  }

  async frogotPassword() {
    // let user = await this.remult.repo(Users).findFirst({
    //   where: u => u.name.isEqualTo(this.userName.value)
    // });
    // if (user) {
    //   // if (user.email) {
    //   //   await EmailSvc.SendEmail(user.email, 'איפוס סיסמה');
    //   //   this.dialog.info(this.terms.passwordSentToYourEmail.replace('!email!', user.email));
    //   // }
    // }
  }

}
