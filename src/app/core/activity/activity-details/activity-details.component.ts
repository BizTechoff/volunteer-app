import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataAreaSettings, openDialog } from '@remult/angular';
import { getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { OnlyVolunteerEditActivity } from '../../../common/globals';
import { SelectTenantComponentComponent } from '../../../common/select-tenant-component/select-tenant-component.component';
import { AttendeeRequest, CalendarRequest, UserIdName } from '../../../common/types';
import { DateUtils, EmailSvc } from '../../../common/utils';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Users } from '../../../users/users';
import { Branch } from '../../branch/branch';
import { NotificationActivity, NotificationsTypes } from '../../notification/notifications-list/notification';
import { Photo } from '../../photo/photo';
import { PhotosAlbumComponent } from '../../photo/photos-album/photos-album.component';
import { Tenant } from '../../tenant/tenant';
import { VolunteersAssignmentComponent } from '../../volunteer/volunteers-assignment/volunteers-assignment.component';
import { Activity, ActivityStatus } from '../activity';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss']
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
      this.activity = this.remult.repo(Activity).create({
        bid: branch,
        tid: this.args.tid,//await this.remult.repo(Tenant).findId(this.args.tid!),
        purposeDesc: terms.defaultPurposeDesc6,
        date: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + 1),
        fh: '14:00',
        th: '16:00'
      });

      if (!this.activity.vids) {
        this.activity.vids = [] as UserIdName[];
      }
      this.addCurrentUserToVids();

    }
    this.top = new DataAreaSettings({
      fields: () => {
        let f = [];
        if (this.isBoard()) {
          f.push(this.activity.$.bid);
        }
        if (this.isManager()) {
          f.push(this.activity.$.status);
        }
        return f;
      }
    })
    this.fields = new DataAreaSettings({
      fields: () => [
        { field: this.activity.$.tid, clickIcon: 'search', click: async () => await this.openTenants() },//, readonly: true },
        {
          field: this.activity.$.vids,
          hideDataOnInput: true,
          getValue: (x, col) => col.displayValue,
          readonly: () => this.activity.tid && this.activity.tid.id && this.activity.tid.id.length > 0 ? false : true,
          clickIcon: 'search',
          click: async () => await this.openAssignment()
        },//, displayValue: () => {return this.activity.$.vids && this.activity.$.vids.value ? this.activity.$.vids.value.map(i => i.name).join(', ').trim() : '';} },
        // { field: this.activity.$.volids, clickIcon: 'search', click: async () => await this.openAssignment() },
        this.activity.$.date,
        [this.activity.$.fh, this.activity.$.th],
        this.activity.$.purposes,
        this.activity.$.purposeDesc,
        this.activity.$.remark
      ]
    });
  }

  async openTenants() {
    await openDialog(SelectTenantComponentComponent, x => x.args = {
      bid: this.activity.bid,
      onSelect: t => {
        if (this.activity.tid.id !== t.id) {
          this.activity.tid = t;
          this.activity.vids.splice(0);
        }
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
          branch: this.activity.bid,
          explicit: explicit,
          title: this.activity.tid.name,
          langs: this.activity.tid?.langs,// this.t.langs, 
          selected: selected
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
    let success = await this.sendEmails();
    this.close();
  }
  // SEND EMAIL TO VOLUNTEERS + INVITETION.ics
  close() {
    this.win.close();
  }

  async CheckConflictsVolenteersOrTenant() {
    return false;
  }

  async sendEmails() {
    // console.log('1');
    let emails: { uid: string, name: string, email: string, type: NotificationsTypes }[] =
      [] as { uid: string, name: string, email: string, type: NotificationsTypes }[];

    // console.log('2');
    // get volunteers that already sent email, to cancel them.
    let vols = await this.remult.repo(NotificationActivity).find({
      where: row => row.activity.isEqualTo(this.activity)
        .and(row.sentAssigned.isEqualTo(true))
    });

    // console.log('3');
    let removed = 0;
    // for each one, send cancel if not in current-volunteers.
    vols.forEach(async v => {
      let f = this.activity.vids.find(itm => itm.id === v.id);
      if (!f) {
        let u = await this.remult.repo(Users).findId(v.id);
        emails.push({ uid: u.id, name: u.name, email: u.email, type: NotificationsTypes.EmailCancelAssign });
        ++removed;
      }
    });

    // console.log('4-', this.activity.vids.length);
    // console.log(emails);
    let added = 0;

    for (const v of this.activity.vids) {
      // console.log('4.1', v.name);
      let u = await this.remult.repo(Users).findId(v.id);
      let f = emails.find(itm => itm.email === u.email);
      if (f) {
        // console.log('4.2', v.name);
        let i = emails.indexOf(f);
        emails.splice(i, 1);//dont send again.
        --removed;
        // f.type = NotificationsTypes.EmailAssign;
      }
      else {
        // console.log('4.3', v.name);
        emails.push({ uid: u.id, name: u.name, email: u.email, type: NotificationsTypes.EmailNewAssign });
        ++added;
      }
      // console.log('4.4', v.name);
    }

    return await this.sendMail(emails);
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
  }

  async sendMail(emails: { uid: string, name: string, email: string, type: NotificationsTypes }[]) {
    // console.log('this.activity.bid.id', this.activity.bid.id, this.activity.bid.name, this.activity.bid.email, this.activity.bid.color);

    // async sendMail(email: string, type: NotificationsTypes, users: { name: string, email: string }[]) {
    // let b = await this.remult.repo(Branch).findId(this.activity.bid.id);
    let b = this.activity.bid;
    if (!emails) {
      emails = [] as { uid: string, name: string, email: string, type: NotificationsTypes }[];
    }
    let attendees = [] as AttendeeRequest[];
    for (const u of emails) {
      attendees.push(
        {
          name: u.name,
          email: u.email,
          rsvp: true,
          partstat: 'ACCEPTED',
          role: 'OPT-PARTICIPANT'
        });
    };

    let vidsNames = '';
    if (this.activity.vids.length > 1) {
      vidsNames = `לכם (${this.activity.$.vids.displayValue})`;
    }
    else if (this.activity.vids.length === 1) {
      vidsNames = `לך (${this.activity.$.vids.displayValue})`;
    }
    let subject = terms.voulnteerNewAssignSubject
      .replace('!tname!', this.activity.tid.name)
      .replace('!branch!', b.name);
    let html = terms.voulnteerNewAssign
      .replace('!vnames!', vidsNames)
      .replace('!purposeDesc!', this.activity.purposeDesc)
      .replace('!name!', this.activity.tid.name)
      .replace('!date!', DateUtils.toDateString(this.activity.date))
      .replace('!from!', this.activity.fh)
      .replace('!to!', this.activity.th)
      .replace('!address!', this.activity.tid.address);
    // let start
    // let split = this.activity.fh.split(':');
    // if(split.length > 0){

    // }
    // if (this.remult.isAllowed(Roles.))
    let req: CalendarRequest = {
      sender: b.email,
      email: {
        from: b.email,
        to: emails.map(e => e.email).join(','),
        cc: '',
        subject: subject,
        html: html
      },
      ics: {
        aid: this.activity.id,
        color: b.color,
        sequence: 2,// new Date().getTime(),
        title: subject,
        description: html,
        location: this.activity.tid.address,
        url: '',// 'bit.ly/eshel-app',
        start: {
          year: this.activity.date.getFullYear(),
          month: this.activity.date.getMonth() + 1,
          day: this.activity.date.getDate(),
          hours: parseInt(this.activity.fh.split(':')[0]),
          minutes: parseInt(this.activity.fh.split(':')[1])
        },
        duration: {
          hours: parseInt(this.activity.th.split(':')[0]) - parseInt(this.activity.fh.split(':')[0]),
          minutes: parseInt(this.activity.th.split(':')[1]) - parseInt(this.activity.fh.split(':')[1])
        },
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: {
          displayName: b.name, //u.name
          email: b.email // this.isManager() ? b.email : u.email
        },
        attendees: attendees
      }
    };

    // return await EmailSvc.SendEmail(req);//sendToCalendar(req);
    return await EmailSvc.sendToCalendar(req);

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
  }

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
