import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BusyService } from '@remult/angular';
import { Field, getFields, Remult } from 'remult';
import { AuthService } from '../../auth.service';
import { DialogService } from '../../common/dialog';
import { terms } from '../../terms';

@Component({
  selector: 'app-user-verification',
  templateUrl: './user-verification.component.html',
  styleUrls: ['./user-verification.component.scss']
})
export class UserVerificationComponent implements OnInit {

  args: {
    in: { mobile: string },
    out?: { verified: boolean }
  } = { in: { mobile: '' }, out: { verified: false } };

  @Field({ caption: terms.verificationCode })
  code!: number;

  sending = true
  showLoginAsVolunteer = false
  isLoginAsVolunteer = false;

  constructor(
    public remult: Remult,
    private auth: AuthService,
    private busy: BusyService,
    private dialog: DialogService,
    private win: MatDialogRef<any>) {
    win.disableClose = true;
  }
  terms = terms;
  get $() { return getFields(this, this.remult) };

  async ngOnInit() {
    if (!this.args) {
      this.args = { in: { mobile: '' }, out: { verified: false } };
    }
    if (!this.args.out) {
      this.args.out = { verified: false };
    }

    // setTimeout(() => this.sendVerificationCode(), 10*1000);

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    this.busy.donotWait(() =>
      wait(1000)
        .then(async () => await this.sendVerificationCode())
        .catch(err => console.debug(`donotWait.sendVerificationCode.Error: ${err}`)));
  }

  async sendVerificationCode() {
    this.sending = true
    // console.log('sendVerificationCode')
    let response = await this.auth.sendVerifyCode(this.args.in.mobile)
    // console.log('response', response)
    this.showLoginAsVolunteer = response.managerAsVolunteer
    if (response.success) {
      this.dialog.info(terms.verificationCodeSuccesfullySent);
    }
    else {
      this.dialog.info(`${terms.verificationCodeSendFailed}: ${response.error}`);
    }
    this.sending = false
  }

  async signIn() {
    if (this.code && this.code > 0) {
      let success = await this.auth.signIn(
        this.args.in.mobile,
        this.code.toString(),
        this.isLoginAsVolunteer);
      if (success) {
        this.args.out!.verified = true;
        this.close();
      }
      else {
        this.dialog.info('כניסה נכשלה');
      }
    }
    else {
      this.dialog.info('לא הוזן קוד');
    }
  }

  close() {
    this.win.close();
  }

}
