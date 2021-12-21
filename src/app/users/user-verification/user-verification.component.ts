import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BusyService } from '@remult/angular';
import { BackendMethod, Field, getFields, Remult } from 'remult';
import { DialogService } from '../../common/dialog';
import { validVerificationCodeResponseMinutes } from '../../common/globals';
import { NotificationService } from '../../common/utils';
import { terms } from '../../terms';

@Component({
  selector: 'app-user-verification',
  templateUrl: './user-verification.component.html',
  styleUrls: ['./user-verification.component.scss']
})
export class UserVerificationComponent implements OnInit {

  args: {
    in: { uid: string, mobile: string },
    out?: { verified: boolean }
  } = { in: { uid: '', mobile: '' }, out: { verified: false } };

  @Field({ caption: terms.verificationCode })
  code!: number;
  sent!: Date;
  randomCode!: number;

  constructor(private remult: Remult, private busy: BusyService, private dialog: DialogService, private win: MatDialogRef<any>) {
    win.disableClose = true;
  }
  terms = terms;
  get $() { return getFields(this, this.remult) };

  async ngOnInit() {
    if (!this.args) {
      this.args = { in: { uid: '', mobile: '' }, out: { verified: false } };
    }
    if (!this.args.out) {
      this.args.out = { verified: false };
    }

    // setTimeout(() => this.sendVerificationCode(), 10*1000);

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    this.busy.donotWait(() =>
      wait(1000)
        .then(async () => await this.sendVerificationCode())
        .catch(err => console.debug(err)));
  }

  generateVerificationCode() {
    let min = 700000;
    let max = 999999
    let rnd = Math.floor(Math.random() * (max - min) + min);
    return rnd;
  }

  async sendVerificationCode() {
    this.randomCode = this.generateVerificationCode();
    let sent = await NotificationService.SendSms(
      {
        uid: this.args.in.uid,
        mobile: this.args.in.mobile,
        message: terms.notificationVerificationCodeMessage
          .replace('!code!', this.randomCode.toString())
      });
    if (sent) {
      this.sent = new Date();
      this.dialog.info(terms.verificationCodeSuccesfullySent);
    }
    else {
      this.dialog.info(terms.verificationCodeSendFailed);
    }
  }

  async signIn() {
    if (await UserVerificationComponent.isAdminCode(this.code)) {
      this.args.out!.verified = true;
      this.close();
    }
    else if (this.sent) {
      let now = new Date();
      let minValidTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes() - validVerificationCodeResponseMinutes);
      if (this.sent < minValidTime) {
        this.dialog.info(terms.validationCodeExpired);
      }
      else if (this.code === this.randomCode) {
        this.args.out!.verified = true;
        this.close();
      }
      else {
        this.dialog.info(terms.wrongVerificatiobCode);
      }
    }
    else {
      this.dialog.info(terms.verificatiobCodeNotSent);
    }
  }

  @BackendMethod({ allowed: true })
  static async isAdminCode(code: number) {
    if (code === parseInt(process.env.ADMIN_SMS_VERIFICATION_CODE!)) {
      return true;
    }
    return false;
  }

  close() {
    this.win.close();
  }

}
