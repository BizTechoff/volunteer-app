import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataAreaSettings, openDialog } from '@remult/angular';
import { getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { SelectTenantComponentComponent } from '../../../common/select-tenant-component/select-tenant-component.component';
import { EmailSvc } from '../../../common/utils';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Users } from '../../../users/users';
import { Branch } from '../../branch/branch';
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
  lastVids = [] as string[];
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

  isBoard() {
    return this.remult.isAllowed(Roles.board);
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
    }
    this.top = new DataAreaSettings({
      fields: () => [
        [
          { field: this.activity.$.bid, visible: (r, v) => this.isBoard() },
          { field: this.activity.$.status },//, readonly: true }
        ]
      ]
    })
    this.fields = new DataAreaSettings({
      fields: () => [
        { field: this.activity.$.tid, clickIcon: 'search', click: async () => await this.openTenants() },//, readonly: true },
        { field: this.activity.$.vids, clickIcon: 'search', click: async () => await this.openAssignment() },
        // { field: this.activity.$.volids, clickIcon: 'search', click: async () => await this.openAssignment() },
        this.activity.$.purpose,
        this.activity.$.purposeDesc,
        this.activity.$.date,
        [this.activity.$.fh, this.activity.$.th],
        { field: this.activity.$.remark, caption: terms.commentAndSummary }
      ]
    });
  }

  async openTenants() {
    await openDialog(SelectTenantComponentComponent, x => x.args = {
      bid: this.activity.bid,
      onSelect: t => this.activity.tid = t,
      title: 'בחירה',// f.metadata && f.metadata.caption?f.metadata.caption:'בחירה',
      tenantLangs: []
    });
  }

  async openAssignment() {

    let bidOk = (this.activity.bid && this.activity.bid.id && this.activity.bid.id.length > 0)!;
    if (bidOk) {
      let volids = await openDialog(VolunteersAssignmentComponent,
        input => input.args = {
          bid: this.activity.bid,
          aid: this.activity.id,
          tname: this.activity.tid.name,
          langs: this.activity.tid?.langs,// this.t.langs, 
          vids: this.activity.vids//,
          // volids: this.activity.volids
        },
        output => output ? (output.args.changed ? output.args.volids : undefined) : undefined);

      if (volids) {
        if (volids.length > 0) {
          this.activity.status = ActivityStatus.w4_start;
        }
        // await this.refresh();
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

  async saveAndClose() {
    await this.activity.save();
    this.args.changed = true;
    this.args.aid = this.activity.id;
    // await this.sendEmails();
    this.close();
  }
  // SEND EMAIL TO VOLUNTEERS + INVITETION.ics
  close() {
    this.win.close();
  }

  async sendEmails() {
    if (this.lastVids !== this.activity.vids) {
      let yes = await this.dialog.yesNoQuestion('האם לשלוח אימייל למתנדבים');
      if (yes) {
        this.lastVids.forEach(async id => {
          let u = await this.remult.repo(Users).findId(id);
          if (u) {
            let text = '';
            let email = u.email;
            if (u.clickedLink) {
              // send update mail
              text = 'עדכון למייל קיים בין המתנדב לדייר';
            }
            else {
              //send new mail
              text = terms.voulnteerNewAssign
                .replace('!name!', this.activity.tid.name)
                .replace('!date!', this.activity.date.toLocaleDateString())
                .replace('!from!', this.activity.fh)
                .replace('!to!', this.activity.th)
                .replace('!address!', this.activity.tid.address);
            }
            await EmailSvc.SendEmail(email, text);
          }
        });// this.lastVids, this.activity.vids)
      }
    }
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
