import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BusyService } from '@remult/angular';
import * as fetch from 'node-fetch';
import { getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { mediaAllowedUploadFileTypes, OnlyVolunteerEditActivity, uploadS3WithFileExtention } from '../../../common/globals';
import { terms } from '../../../terms';
import { Users } from '../../../users/users';
import { Branch } from '../../branch/branch';
import { Photo } from '../photo';

// import { v4 as uuidv4 } from 'uuid'; 

@Component({
  selector: 'app-photos-album',
  templateUrl: './photos-album.component.html',
  styleUrls: ['./photos-album.component.scss']
})
export class PhotosAlbumComponent implements OnInit {

  // @Input()
  // entityId: string = '';

  args: {
    bid: Branch,
    aid: string,
    // tid: string,
    changed?: boolean
  } = { bid: undefined!, aid: '' /*, tid: ''*/, changed: false };

  photos = [] as Photo[];
  terms = terms;
  // @Field({ caption: terms.branch })
  // bid: string = '';
  get $() { return getFields(this, this.remult) };

  constructor(
    private remult: Remult,
    private dialog: DialogService,
    private busy: BusyService,
    private win: MatDialogRef<any>) { }


  isAllowEdit() {
    if (this.isDonor() || (OnlyVolunteerEditActivity && this.isManager())) {
      return false;
    }
    return true;
  }

  isManager() {
    return this.remult.user.isManagerOrAbove;
  }

  isDonor() {
    return this.remult.user.isReadOnly;
  }
  async ngOnInit() {
    if (!this.args) {
      this.args = { bid: undefined!, aid: '' /*, tid: ''*/, changed: false };
    }
    if (!this.args.aid) {
      this.args.aid = '';
    }
    // if (!this.args.tid) {
    //   this.args.tid = '';
    // }
    // if (!this.entityId) {
    //   this.entityId = '';
    // }
    // if (this.entityId.length > 0) {
    //   this.args.aid = this.entityId;
    // }
    this.args.changed = false;
    await this.refresh();
  }

  async refresh() {
    this.photos.splice(0);
    if (this.isValidEntityId()) {
      for await (const p of this.remult.repo(Photo).query({
        where: { eid: this.args.aid },
        orderBy: { created: 'desc' }
      })) {
        this.photos.push(p);
      }
      // let aids = [] as string[];
      // // if (this.args.tid && this.args.tid.length > 0) {
      // //   //  let ts = await this.remult.repo(Activity).find({
      // //   //    where: {tid: }
      // //   //  })
      // //   for await (const a of this.remult.repo(Activity).query({
      // //     where: { tid: { $id: [this.args.tid] } }
      // //   })) {
      // //     aids.push(a.id)
      // //     // console.log(JSON.stringify(a))
      // //   }
      // // }
      // // else 
      // if (this.args.aid && this.args.aid.length > 0) {
      //   aids.push(this.args.aid)
      // }
      // // console.log(aids)
      // if (aids.length > 0) {
      //   for await (const p of this.remult.repo(Photo).query({
      //     where: { eid: aids },
      //     orderBy: { created: 'desc' }
      //   })) {
      //     this.photos.push(p);
      //   }
      // }
    }
    // console.log('this.photos',this.photos.length);
  }

  isValidEntityId() {
    return this.args.aid && this.args.aid.length > 0// || this.args.tid && this.args.tid.length > 0;
  }

  getBranchFromEmail(email: string) {
    //eshel.app.hulon@gmail.com
    let result = '';
    if (email && email.length > 0) {
      result = email.split('@')[0];
    }
    return result;
  }

  async onFileInput(e: any) {//eshel.app.hulon@gmail.com
    let branch = this.getBranchFromEmail(this.args.bid.email);//this.args.bid?.id// 
    if (branch && branch.length > 0) {
      let changed = await this.loadFiles(e.target.files, branch);
      if (changed) {
        await this.refresh();
      }
    }
    else {
      this.dialog.error(`Invalid Branch`)
    }
  }

  private async loadFiles(files: any, branch: string) {
    let points = 0;
    if (files && files.length > 0) {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (!mediaAllowedUploadFileTypes.includes(file.type)) {
          console.debug(`loadFiles(${file.name}): file type ${file.type} not allowed to upload`)
          continue;
        }
        // let f: File = file; 
        // console.log('success-0', false)
        let success = await this.upload(file, branch);
        // console.log('success-1', success)
        if (success!) {
          // console.log(file.type);
          points += this.getPointByFileType(file.type);
        }
      }
      if (points > 0) {
        let u = await this.remult.repo(Users).findId(this.remult.user.id);
        if (u) {
          u.points += points;
          await u.save();
          this.dialog.info(terms.youGotMorePoint.replace('!points!', points.toString()).replace('!sum!', u.points.toString()));
          return true;
        }
      }
    }
    return false;
  }

  getPointByFileType(type: string) {
    let result = 200;
    if (type.includes('video')) {
      result = 500;
    }
    return result;
  }

  async upload(f: any, branch: string): Promise<boolean> {
    let p = new Promise<boolean>(async (resolve, reject) => {
      let message = '';
      let result = false;
      const { v4: uuidv4 } = require('uuid');
      let id = uuidv4()

      let fileName = `${id}`
      if (uploadS3WithFileExtention) {
        let split = f.type.split('/')
        if (split.length > 1) {
          fileName += `.${split[1]}`
        }
      }

      // console.log('upload.uuid',id)
      // get secure url from our server//'http://localhost:3000' + 
      const s3SignUrl = `/api/s3Url?key=${'eshel-app-s3-key'}&f=${encodeURI(fileName)}&branch=${encodeURI(branch)}`;
      // console.log('s3SignUrl', s3SignUrl)
      const signRes = await fetch.default(s3SignUrl);

      if (signRes.ok) {
        // coso
        let link = await signRes.json();// JSON.parse(await url.text());// as AwsS3SignUrlResponse;
        // console.log('link', link)
        if (link && link.url && link.url.length > 0)
        // post the image direclty to the s3 bucket
        {
          const linkRes = await fetch.default(link.url, {
            method: "PUT",
            body: f
          })

          if (linkRes.ok) {
            // console.log('linkRes.linkRes', linkRes)
            const imageUrl = link.url.split('?')[0]
            // console.log(imageUrl)
            await this.addPhoto(id, f.name, f.type, imageUrl)
            result = true;
          }
          else {
            // console.log('NOT OK')
            message = `upload.link(${link}): { status: ${linkRes.status}, statusText: ${linkRes.statusText} }`;
            // console.debug(message);
          }
        } else {
          // console.log('NOT OK')
          message = `upload(${f.name}): upSigning Url Failed`;
          // console.debug(message);
        }
      }
      else {
        message = `upload(${f.name}): { status: ${signRes.status}, statusText: ${signRes.statusText} }`;
        // console.debug(message);
      }
      if (message.length > 0) {
        console.debug(message);
      }
      resolve(result)
      // if (result) {
      //   resolve(result)
      // }
      // else {
      //   reject(message)
      // }
    });
    let closeBusy = this.busy.showBusy();
    let ret = await p;
    closeBusy();
    return ret;
  }

  async removePhoto(img: Photo) {
    let yes = await this.dialog.confirmDelete(terms.photo)!;
    if (yes) {
      await img.delete();
      this.args.changed = true;
      var index = this.photos.indexOf(img);
      if (index >= 0) {
        this.photos.splice(index, 1);
        this.dialog.info('התמונה הוסרה בהצלחה');
      }
    }
  }

  async addPhoto(id: string, name: string, type: string, link: string): Promise<Photo> {
    let result = this.remult.repo(Photo).create();
    result.id = id;
    result.bid = this.args.bid;
    result.eid = this.args.aid;
    result.title = name;
    result.type = type;
    result.link = link;
    // console.log('result.id.1', result.id)
    await result.save();
    // console.log('result.id.2', result.id)
    this.args.changed = true;
    return result;
  }

}
