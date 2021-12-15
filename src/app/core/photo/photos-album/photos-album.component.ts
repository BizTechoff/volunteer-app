import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { OnlyVolunteerEditActivity, pointsEachSuccessPhoto } from '../../../common/globals';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Users } from '../../../users/users';
import { Branch } from '../../branch/branch';
import { Photo } from '../photo';
// import * as AWS from 'aws-sdk';
// import * as fs from 'fs';
// import { uploadFile } from '../../../../server/aws';

@Component({
  selector: 'app-photos-album',
  templateUrl: './photos-album.component.html',
  styleUrls: ['./photos-album.component.scss']
})
export class PhotosAlbumComponent implements OnInit {

  @Input()
  entityId: string = '';

  args: {
    bid: Branch,
    entityId: string,
    changed?: boolean
  } = { bid: undefined!, entityId: '', changed: false };

  photos = [] as Photo[];
  terms = terms;
  // @Field({ caption: terms.branch })
  // bid: string = '';
  get $() { return getFields(this, this.remult) };

  constructor(private remult: Remult, private dialog: DialogService, private win: MatDialogRef<any>) { }


  isAllowEdit() {
    if (this.isDonor() || (OnlyVolunteerEditActivity && this.isManager())) {
      return false;
    }
    return true;
  }

  isManager() {
    return this.remult.isAllowed(Roles.manager);
  }

  isDonor() {
    return this.remult.isAllowed(Roles.donor);
  }
  async ngOnInit() {
    if (!this.args) {
      this.args = { bid: undefined!, entityId: '', changed: false };
    }
    if (!this.args.entityId) {
      this.args.entityId = '';
    }
    if (!this.entityId) {
      this.entityId = '';
    }
    if (this.entityId.length > 0) {
      this.args.entityId = this.entityId;
    }
    this.args.changed = false;
    await this.refresh();
  }

  async refresh() {
    this.photos.splice(0);
    if (this.isValidEntityId()) {
      for await (const p of this.remult.repo(Photo).iterate({
        where: row => row.eid.isEqualTo(this.args.entityId)
      })) {
        this.photos.push(p);
      }
    }
    // console.log('this.photos',this.photos.length);
  }

  isValidEntityId() {
    return this.args.entityId && this.args.entityId.length > 0;
  }

  // @BackendMethod({allowed: true})
  // static uploadToAws(fileName:string){
  //   uploadFile(fileName);
  // }

  async onFileInput(e: any) {


    // for (let index = 0; index < e.target.files.length; index++) {
    //   const file = e.target.files[index];
    //   let f: File = file;
    //   PhotosAlbumComponent.uploadToAws(f.name);
    // }


    // s3.createBucket(params, function(err, data) {
    //     if (err) console.log(err, err.stack);
    //     else console.log('Bucket Created Successfully', data.Location);
    // }); 
    let changed = this.loadFiles(e.target.files);
    // if (changed) {
    //   await this.refresh();
    // }
  }
  //   private async loadFiles(files: any) {
  //     for (let index = 0; index < files.length; index++) {
  //       const file = files[index];
  //       let f: File = file;
  //       // console.log(f);
  //       // f.lastModified;
  //       // f.name;
  //       // f.size;
  //       // f.type;
  //       // f.webkitRelativePath;
  //       await new Promise((res) => {

  //     // Read content from the file
  //     const fileContent = fs.readFileSync(f.name);

  //     // Setting up S3 upload parameters
  //     const params = {
  //         Bucket: '',
  //         Key: 'cat.jpg', // File name you want to save as in S3
  //         Body: fileContent
  //     };

  //     // Uploading files to the bucket
  //     s3.upload(params, function(err, data) {
  //         if (err) {
  //             throw err;
  //         }
  //         console.log(`File uploaded successfully. ${data.Location}`);
  //     });
  // };
  //         });
  //         // fileReader.readAsDataURL(f);
  //       // });
  //     }
  //   }

  // private uploadFile(fileName: string){
  //   //https://stackabuse.com/uploading-files-to-aws-s3-with-node-js/
  //   // const AWS = require('aws-sdk');
  //   // const fs = require('fs');
  //   const s3 = new AWS.S3({
  //     accessKeyId: '',
  //     secretAccessKey: ''
  // });
  // const fileContent = fs.readFileSync(fileName);
  // const params = {
  //   Bucket: '',
  //       Key: fileName, // File name you want to save as in S3
  //       Body: fileContent
  //   // CreateBucketConfiguration: {
  //   //     // Set your region here
  //   //     LocationConstraint: "us-east-1"
  //   };
  //   s3.upload(params, (err: Error, data:AWS.S3.ManagedUpload.SendData) => {
  //     if (err) {
  //         throw err; 
  //     }
  //     console.log(`File uploaded successfully. ${data.Location}`);
  // });
  // }

  private async loadFiles(files: any) {
    let points = 0;
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

              let uimg = await this.addPhoto(f.name, dataurl);
              this.photos.push(uimg);


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
        points += pointsEachSuccessPhoto;
      });
    }
    if (points > 0) {
      let u = await this.remult.repo(Users).findId(this.remult.user.id);
      if (u) {
        u.points += points;
        await u.save();
        this.dialog.info(terms.youGotMorePoint.replace('!points!', points.toString()).replace('!sum!', u.points.toString()));
      }
    }
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

  async addPhoto(title: string, data: string): Promise<Photo> {
    let result = this.remult.repo(Photo).create();
    result.bid = this.args.bid;
    result.eid = this.args.entityId;
    result.title = title;
    result.data = data;
    await result.save();
    this.args.changed = true;
    return result;
  }
}
