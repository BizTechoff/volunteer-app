import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { InputField, openDialog } from '@remult/angular';
import { Remult } from 'remult';
import { AuthService } from '../../auth.service';
import { DialogService } from '../../common/dialog';
import { mobileToDb } from '../../common/globals';
import { terms } from '../../terms';
import { UserVerificationComponent } from '../user-verification/user-verification.component';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss']
})
export class UserLoginComponent implements OnInit {

  codeSent = false
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
    this.args.out.connected = false;
    if (this.mobile.value && this.mobile.value.length > 0) {
      let mobile = mobileToDb(this.mobile.value)
      if (mobile.length > 0) {
        let verified = await openDialog(UserVerificationComponent,
        _ => _.args = { in: { mobile: mobile } },
        _ => _ && _.args.out ? _.args.out.verified : false);
      if (verified!) {
        this.args.out.connected = true;
        this.close();
      }
      }
    }
  }

  close() {
    this.win.close();
  }

}
