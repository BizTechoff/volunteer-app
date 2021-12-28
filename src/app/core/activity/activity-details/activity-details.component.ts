import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataAreaFieldsSetting, DataAreaSettings, openDialog } from '@remult/angular';
import { getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { OnlyVolunteerEditActivity } from '../../../common/globals';
import { SelectTenantComponent } from '../../../common/select-tenant/select-tenant.component';
import { UserIdName } from '../../../common/types';
import { NotificationService } from '../../../common/utils';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Branch } from '../../branch/branch';
import { Photo } from '../../photo/photo';
import { PhotosAlbumComponent } from '../../photo/photos-album/photos-album.component';
import { Tenant } from '../../tenant/tenant';
import { VolunteersAssignmentComponent } from '../../volunteer/volunteers-assignment/volunteers-assignment.component';
import { Activity, ActivityStatus } from '../activity';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss'],
  animations: [
    trigger("shakeit", [
      transition("void => *", [
        animate('770ms 3500ms ease-in', keyframes([
          style({ transform: 'translate3d(-1px, 0, 0)', offset: 0.1 }),
          style({ transform: 'translate3d(2px, 0, 0)', offset: 0.2 }),
          style({ transform: 'translate3d(-17px, 0, 0)', offset: 0.3 }),
          style({ transform: 'translate3d(17px, 0, 0)', offset: 0.4 }),
          style({ transform: 'translate3d(-17px, 0, 0)', offset: 0.5 }),
          style({ transform: 'translate3d(17px, 0, 0)', offset: 0.6 }),
          style({ transform: 'translate3d(-17px, 0, 0)', offset: 0.7 }),
          style({ transform: 'translate3d(2px, 0, 0)', offset: 0.8 }),
          style({ transform: 'translate3d(-1px, 0, 0)', offset: 0.9 }),
        ])
        )
      ])//,
      // transition("* => void", [
      //   animate('500ms ease-out', style({ transform: 'translateX(300%) scale(0) rotate(360deg)' }))
      // ])
    ])
    /*
    trigger('shakeit', [
      state('shakestart', style({
        transform: 'scale(1)',
      })),
      state('shakeend', style({
        transform: 'scale(1)',
      })),
      transition('shakestart => shakeend', animate('1000ms ease-in', keyframes([
        style({ transform: 'translate3d(-1px, 0, 0)', offset: 0.1 }),
        style({ transform: 'translate3d(2px, 0, 0)', offset: 0.2 }),
        style({ transform: 'translate3d(-4px, 0, 0)', offset: 0.3 }),
        style({ transform: 'translate3d(4px, 0, 0)', offset: 0.4 }),
        style({ transform: 'translate3d(-4px, 0, 0)', offset: 0.5 }),
        style({ transform: 'translate3d(4px, 0, 0)', offset: 0.6 }),
        style({ transform: 'translate3d(-4px, 0, 0)', offset: 0.7 }),
        style({ transform: 'translate3d(2px, 0, 0)', offset: 0.8 }),
        style({ transform: 'translate3d(-1px, 0, 0)', offset: 0.9 }),
      ]))),
    ])
    */
  ]
})
export class ActivityDetailsComponent implements OnInit {

  args: {
    bid?: Branch,
    aid?: string,
    tid?: Tenant,
    readonly?: boolean,
    changed?: boolean
  } = { bid: undefined, aid: '', tid: undefined, readonly: false, changed: false };
  today = new Date();
  activity!: Activity;
  top = new DataAreaSettings({});
  fields = new DataAreaSettings({});
  images: Photo[] = [];
  terms = terms;
  lastVids = [] as UserIdName[];
  // @Field({ caption: terms.branch })
  // bid: string = '';
  get $() { return getFields(this, this.remult) };

  constructor(private remult: Remult, private dialog: DialogService, private win: MatDialogRef<any>) { }

  async ngOnInit() {
    if (!this.args) {
      this.args = { aid: '', tid: undefined, readonly: false, changed: false };
    }
    if (!this.args.tid) {
      this.args.tid = undefined;
    }
    if (!this.args.aid) {
      this.args.aid = '';
    }
    this.args.changed = false;
    await this.retrieve();


    if (this.isShowDeliveredFoodToShabat() && this.didntCheckedFoodDelivery()) {

      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
 
      wait(100)
        .then(async () => this.dialog.info(terms.reminder4FoodDelivery, 2300))
        .catch(err => console.debug(err));

      wait(3500)
        .then(async () => this.applyNotifications())
        .catch(err => console.debug(err));
    }
  }

  didntCheckedFoodDelivery() {
    let result = false;
    if (this.activity && !this.activity.foodDelivered!) {
      result = true;
    }
    return result;
  }

  applyNotifications() {

    try {
      this.beep();
      navigator.vibrate(200);
    }
    catch (err) {
      console.debug('applyNotifications.error', err);
    }
  }

  beep() {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    snd.play();
  }

  isAllowEdit() {
    if (this.isDonor() || (OnlyVolunteerEditActivity && this.isManager())) {
      return false;
    }
    return true;
  }

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  isDonor() {
    return this.remult.isAllowed(Roles.donor);
  }

  isManager() {
    return this.remult.isAllowed(Roles.manager);
  }

  isOnlyVolunteer() {
    return this.remult.isAllowed(Roles.volunteer) && this.remult.user.roles.length == 1;
  }

  isShowDeliveredFoodToShabat() {
    return this.activity &&
      !this.activity.isNew() &&
      this.activity.date &&
      // ActivityStatus.inProgressStatuses().includes( this.activity.status) &&
      [3, 4].includes(this.activity.date.getDay());//יום רביעי וחמישי
  }

  async retrieve() {
    let validId = this.args.aid && this.args.aid.length > 0;
    if (validId) {
      let found = await this.remult.repo(Activity).findId(this.args.aid!, { useCache: false });
      if (found) {
        this.activity = found;
        this.lastVids.push(...this.activity.vids);
      }
    }
    if (!this.activity) {
      let branch = undefined;
      if (this.isBoard()) {
        if (this.args.bid) {
          branch = this.args.bid;
        }
      }
      else {
        branch = await this.remult.repo(Branch).findId(this.remult.user.bid);
      }
      let hour = this.today.getHours();
      let min = this.today.getMinutes();

      console.log(this.today);
      console.log(hour);
      console.log(min);

      console.log((hour + 1).toString().padStart(2, '0') + ':' + '00');



      this.activity = this.remult.repo(Activity).create({
        bid: branch,
        tid: this.args.tid,//await this.remult.repo(Tenant).findId(this.args.tid!),
        // purposeDesc: terms.defaultPurposeDesc6,
        date: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate()),
        fh: ((hour + 1) % 24).toString().padStart(2, '0') + ':' + '00',
        th: ((hour + 3) % 24).toString().padStart(2, '0') + ':' + '00'
      });

      if (!this.activity.vids) {
        this.activity.vids = [] as UserIdName[];
      }
      this.addCurrentUserToVids();

    }
    this.top = new DataAreaSettings({
      fields: () => {
        let f:DataAreaFieldsSetting<Activity>[] = [];
        // if(this.isShowDeliveredFoodToShabat()){
        //   f.push(this.activity.$.foodDelivered);
        // }
        if (this.isBoard()) {
          f.push({field: this.activity.$.bid, readonly: this.activity.status.isClosed()});
        }
        if (this.isManager()) {
          f.push({field: this.activity.$.status, readonly: this.activity.status.isClosed()});
        }
        return f;
      }
    })
    this.fields = new DataAreaSettings({
      fields: () => [
        { field: this.activity.$.tid, readonly: this.activity.status.isClosed(), clickIcon: 'search', click: async () => await this.openTenants() },//, readonly: true },
        {
          field: this.activity.$.vids,
          hideDataOnInput: true,
          getValue: (x, col) => col.displayValue,
          readonly: () => this.activity.tid && this.activity.tid.id && this.activity.tid.id.length > 0 ? this.activity.status.isClosed() : true,
          clickIcon: 'search',
          click: async () => await this.openAssignment()
        },//, displayValue: () => {return this.activity.$.vids && this.activity.$.vids.value ? this.activity.$.vids.value.map(i => i.name).join(', ').trim() : '';} },
        // { field: this.activity.$.volids, clickIcon: 'search', click: async () => await this.openAssignment() },
        { field: this.activity.$.date, readonly: this.activity.status.isClosed()},
        [{ field: this.activity.$.fh, readonly: this.activity.status.isClosed()}, 
          { field: this.activity.$.th, readonly: this.activity.status.isClosed()}],
        { field: this.activity.$.purposes, readonly: this.activity.status.isClosed()},
        { field: this.activity.$.purposeDesc, readonly: this.activity.status.isClosed()},
        { field: this.activity.$.remark, readonly: this.activity.status.isClosed()}
      ]
    }); 
  }

  async openTenants() {
    await openDialog(SelectTenantComponent, x => x.args = {
      bid: this.activity.bid,
      onSelect: t => {
        if (!this.activity.tid || this.activity.tid.id !== t.id) {
          this.activity.tid = t;
          this.activity.vids.splice(0);
          this.addCurrentUserToVids();
        }
        console.log(9);
      },
      title: 'דייר',// f.metadata && f.metadata.caption?f.metadata.caption:'בחירה',
      tenantLangs: []
    });
  }

  async openAssignment() {

    let bidOk = (this.activity.bid && this.activity.bid.id && this.activity.bid.id.length > 0)!;
    if (bidOk) {
      let explicit = [] as UserIdName[];
      // if (this.isOnlyVolunteer()) {
      for (const v of this.activity.tid.defVids) {
        explicit.push({ id: v.id, name: v.name });
      }
      // if(explicit.length == 0){
      //   explicit = undefined!;
      // }
      // }
      let selected = [] as UserIdName[];
      for (const v of this.activity.vids) {
        selected.push({ id: v.id, name: v.name });
      }
      let volids = await openDialog(VolunteersAssignmentComponent,
        input => input.args = {
          allowChange: !this.isManager(),
          branch: this.activity.bid,
          explicit: explicit,
          title: this.activity.tid.name,
          langs: this.activity.tid?.langs,// this.t.langs, 
          selected: selected.map(s => s),//clone
          organizer: this.activity.isNew() ? this.remult.user.id : this.activity.createdBy?.id
        },
        output => output && output.args && output.args.changed ? output.args.selected : undefined);
      if (volids) {
        this.activity.vids.splice(0);
        this.activity.vids.push(...volids);
      }

      this.addCurrentUserToVids();
      if (this.activity.vids.length > 0) {
        if (this.activity.status === ActivityStatus.w4_assign) {
          this.activity.status = ActivityStatus.w4_start;
        }
      }
    }
    else {
      await this.dialog.error(terms.mustSetBidForThisAction);
    }
  }

  async openPhotosAlbum() {
    let changes = await openDialog(PhotosAlbumComponent,
      _ => _.args = { bid: this.activity.bid, entityId: this.activity.id },
      _ => _ ? _.args.changed : false);
    if (changes) {
      // await this.refresh();
    }
  }

  addCurrentUserToVids() {
    let found = false;
    if (!this.isManager()) {
      this.activity.vids.forEach(v => {
        if (v.id === this.remult.user.id) {
          found = true;
        }
      });
      if (!found) {
        this.activity.vids.push({ id: this.remult.user.id, name: this.remult.user.name });
      }
    }
  }

  async saveAndClose() {
    let alreadySaved = false;
    if (this.activity.vids.length > 0) {
      if (this.activity.status === ActivityStatus.w4_assign) {
        await this.activity.status.onChanging(this.activity, ActivityStatus.w4_start, this.remult.user.id);
        alreadySaved = true;
      }
    }
    else {
      await this.activity.status.onChanging(this.activity, ActivityStatus.w4_assign, this.remult.user.id);
      alreadySaved = true;
    }
    if (!alreadySaved) {
      await this.activity.save();
    }
    // console.log('isnew',this.activity.isNew());
    this.args.changed = true;
    this.args.aid = this.activity.id;
    // let success = await EmailSvc.toCalendar(this.activity.id);
    let success = await NotificationService.SendCalendar(this.activity.id);
    // let success = await this.sendEmails();
    this.close();
  }
  // SEND EMAIL TO VOLUNTEERS + INVITETION.ics
  close() {
    this.win.close();
  }

  async CheckConflictsVolenteersOrTenant() {
    return false;
  }

  // async sendEmails() {
  //   // console.log('1');
  //   let emails: { uid: string, name: string, email: string, type: NotificationsTypes }[] =
  //     [] as { uid: string, name: string, email: string, type: NotificationsTypes }[];

  //   // console.log('2');
  //   // get volunteers that already sent email, to cancel them.
  //   let vols = await this.remult.repo(NotificationActivity).find({
  //     where: row => row.activity.isEqualTo(this.activity)
  //       .and(row.sentAssigned.isEqualTo(true))
  //   });

  //   // console.log('3');
  //   let removed = 0;
  //   // for each one, send cancel if not in current-volunteers.
  //   vols.forEach(async v => {
  //     let f = this.activity.vids.find(itm => itm.id === v.id);
  //     if (!f) {
  //       let u = await this.remult.repo(Users).findId(v.id);
  //       emails.push({ uid: u.id, name: u.name, email: u.email, type: NotificationsTypes.EmailCancelAssign });
  //       ++removed;
  //     }
  //   });

  //   // console.log('4-', this.activity.vids.length);
  //   // console.log(emails);
  //   let added = 0;

  //   for (const v of this.activity.vids) {
  //     // console.log('4.1', v.name);
  //     let u = await this.remult.repo(Users).findId(v.id);
  //     let f = emails.find(itm => itm.email === u.email);
  //     if (f) {
  //       // console.log('4.2', v.name);
  //       let i = emails.indexOf(f);
  //       emails.splice(i, 1);//dont send again.
  //       --removed;
  //       // f.type = NotificationsTypes.EmailAssign;
  //     }
  //     else {
  //       // console.log('4.3', v.name);
  //       emails.push({ uid: u.id, name: u.name, email: u.email, type: NotificationsTypes.EmailNewAssign });
  //       ++added;
  //     }
  //     // console.log('4.4', v.name);
  //   }

  //   return await this.sendMail(emails);
  // console.log('5', emails.length);

  // if (emails.length > 0) {
  // console.log('6');
  // console.log('emails', emails);
  // console.log('11111');

  // let message = `האם לשלוח אמייל` +
  //   `\n` +
  //   (removed > 0 ? `ל- ${removed} מתנדבים לגבי ביטול השתתפותם בפעילות` : '') +
  //   `\n` +
  //   (added > 0 ? (added > 0 ? 'ו' : '') + `ל- ${added} מתנדבים זימון השתתפות בפעילות` : '');
  // console.log('message', message);

  // console.log('7');
  // console.log('22222');
  // let yes = true;// await this.dialog.yesNoQuestion(message);
  // if (yes) {
  // console.log('8');
  // let users: { name: string, email: string }[] = [] as { name: string, email: string }[];
  // for (const e of emails) {
  //   users.push({
  //     name: e.name,
  //     email: e.email
  //   });
  // }
  // for (const e of emails) {
  // let ok = await this.sendMail(emails);
  // if (ok) {
  //   // let u = await this.remult.repo(Users).findId(e.uid);
  //   // let n = await this.remult.repo(NotificationActivity).findId({where: row => row.activity.isEqualTo(e.) e.uid});
  //   // n.
  // }
  // }
  // }
  // }
  // else{
  //   // send cancel
  //   let req: CalendarRequest;
  // return await EmailSvc.sendToCalendar(req);
  // }
  // }

  // async sendMail(emails: { uid: string, name: string, email: string, type: NotificationsTypes }[]) {
  //   // console.log('this.activity.bid.id', this.activity.bid.id, this.activity.bid.name, this.activity.bid.email, this.activity.bid.color);

  //   // async sendMail(email: string, type: NotificationsTypes, users: { name: string, email: string }[]) {
  //   // let b = await this.remult.repo(Branch).findId(this.activity.bid.id);
  //   let b = this.activity.bid;
  //   if (!emails) {
  //     emails = [] as { uid: string, name: string, email: string, type: NotificationsTypes }[];
  //   }
  //   let attendees = [] as AttendeeRequest[];
  //   for (const u of emails) {
  //     attendees.push(
  //       {
  //         name: u.name,
  //         email: u.email,
  //         rsvp: true,
  //         partstat: 'ACCEPTED',
  //         role: 'OPT-PARTICIPANT'
  //       });
  //   };

  //   let vidsNames = '';
  //   if (this.activity.vids.length > 1) {
  //     vidsNames = `לכם (${this.activity.$.vids.displayValue})`;
  //   }
  //   else if (this.activity.vids.length === 1) {
  //     vidsNames = `לך (${this.activity.$.vids.displayValue})`;
  //   }
  //   let subject = terms.voulnteerNewAssignSubject
  //     .replace('!tname!', this.activity.tid.name)
  //     .replace('!branch!', b.name);
  //   let html = terms.voulnteerNewAssign
  //     .replace('!vnames!', vidsNames)
  //     .replace('!purposeDesc!', this.activity.purposeDesc)
  //     .replace('!name!', this.activity.tid.name)
  //     .replace('!date!', DateUtils.toDateString(this.activity.date))
  //     .replace('!from!', this.activity.fh)
  //     .replace('!to!', this.activity.th)
  //     .replace('!address!', this.activity.tid.address);
  //   // let start
  //   // let split = this.activity.fh.split(':');
  //   // if(split.length > 0){

  //   // }
  //   // if (this.remult.isAllowed(Roles.))
  //   let req: CalendarRequest = {
  //     sender: b.email,
  //     email: {
  //       from: b.email,
  //       to: emails.map(e => e.email).join(','),
  //       cc: '',
  //       subject: subject,
  //       html: html
  //     },
  //     ics: {
  //       aid: this.activity.id,
  //       color: b.color,
  //       sequence: 2,// new Date().getTime(),
  //       title: subject,
  //       description: html,
  //       location: this.activity.tid.address,
  //       url: '',// 'bit.ly/eshel-app',
  //       start: {
  //         year: this.activity.date.getFullYear(),
  //         month: this.activity.date.getMonth() + 1,
  //         day: this.activity.date.getDate(),
  //         hours: parseInt(this.activity.fh.split(':')[0]),
  //         minutes: parseInt(this.activity.fh.split(':')[1])
  //       },
  //       duration: {
  //         hours: parseInt(this.activity.th.split(':')[0]) - parseInt(this.activity.fh.split(':')[0]),
  //         minutes: parseInt(this.activity.th.split(':')[1]) - parseInt(this.activity.fh.split(':')[1])
  //       },
  //       status: 'CONFIRMED',
  //       busyStatus: 'BUSY',
  //       organizer: {
  //         displayName: b.name, //u.name
  //         email: b.email // this.isManager() ? b.email : u.email
  //       },
  //       attendees: attendees
  //     }
  //   };

  //   // return await EmailSvc.SendEmail(req);//sendToCalendar(req);
  //   return await EmailSvc.sendToCalendar(req);

  // let message = type.text
  //   .replace('!name!', this.activity.tid.name)
  //   .replace('!date!', this.activity.date.toLocaleDateString())
  //   .replace('!from!', this.activity.fh)
  //   .replace('!to!', this.activity.th)
  //   .replace('!address!', this.activity.tid.address);

  // const datepipe: DatePipe = new DatePipe('en-US');//yyyyMMddTHHmmssZ
  // let fdate = datepipe.transform(this.activity.date, 'yyyyMMdd')! + 'T' + this.activity.fh.replace(':', '') + '00Z';
  // let tdate = datepipe.transform(this.activity.date, 'yyyyMMdd')! + 'T' + this.activity.th.replace(':', '') + '00Z';
  // let link = type.link
  //   .replace('!title!', encodeURI(type.subject))
  //   .replace('!fDate!', fdate)
  //   .replace('!tDate!', tdate)
  //   .replace('!location!', encodeURI(this.activity.tid.address))
  //   .replace('!details!', encodeURI('תודה!'));
  // let subject = type.subject.replace('!tname!', this.activity.tid.name);

  // return await EmailSvc.SendEmail(email, subject, message, link);
  // }

  async addPhoto() {

  }

  async onFileInput(e: any) {
    let changed = this.loadFiles(e.target.files);
    // if (changed) {
    //   await this.refresh();
    // }
  }

  private async loadFiles(files: any) {
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      let f: File = file;
      // console.log(f);
      // f.lastModified;
      // f.name;
      // f.size;
      // f.type;
      // f.webkitRelativePath;
      await new Promise((res) => {
        var fileReader = new FileReader();

        fileReader.onload = async (e: any) => {
          var img = new Image();

          var canvas = document.createElement("canvas");
          if (true) {
            img.onload = async () => {
              var ctx = canvas.getContext("2d");
              ctx!.drawImage(img, 0, 0);

              var MAX_WIDTH = 800;
              var MAX_HEIGHT = 600;
              var width = img.width;
              var height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              canvas.width = width;
              canvas.height = height;

              let margin = 50;
              // canvas.pad?

              var ctx = canvas.getContext("2d");
              ctx!.drawImage(img, 0, 0, width, height);

              var dataurl = canvas.toDataURL("image/png");
              //console.log(dataurl);
              //create row in db

              let uimg = await this.addImage(f.name, dataurl);
              this.images.push(uimg);

              // addImageInfo(imgId)


            }
            img.src = e.target.result.toString();
            // console.log(img.src)
          }
          //   this.image.image.value = e.target.result.toString();
          //   this.image.fileName.value = f.name;
          res({});
        };
        fileReader.readAsDataURL(f);
      });
    }
  }

  async removeImage(img: Photo) {
    let yes = await this.dialog.confirmDelete(terms.delete)!;
    if (yes) {
      await img.delete();
      var index = this.images.indexOf(img);
      if (index >= 0) {
        this.images.splice(index, 1);
        this.dialog.info('התמונה הוסרה בהצלחה');
      }
    }
  }

  async addImage(title: string, data: string): Promise<Photo> {
    let result = this.remult.repo(Photo).create();
    result.title = title;
    result.data = data;
    await result.save();
    return result;
  }
}
