import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Field, getFields, Remult } from 'remult';
import { DialogService } from '../../common/dialog';
import { NotificationService } from '../../common/utils';
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
  sent!: Date;
  randomCode!: number;

  validResponseMinutes = 1;

  constructor(private remult: Remult, private dialog: DialogService, private win: MatDialogRef<any>) { }
  terms = terms;
  get $() { return getFields(this, this.remult) };

  async ngOnInit() {
    if (!this.args) {
      this.args = { in: { mobile: '' }, out: { verified: false } };
    }
    if (!this.args.out) {
      this.args.out = { verified: false };
    }
    await this.sendVerificationCode();
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

  signIn() {
    if (this.sent) {
      let now = new Date();
      let minValidTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes() - this.validResponseMinutes);
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
  }

  close() {
    this.win.close();
  }

}
