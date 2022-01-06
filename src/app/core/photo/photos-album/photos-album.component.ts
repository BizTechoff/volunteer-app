import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as fetch from 'node-fetch';
import { getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { OnlyVolunteerEditActivity } from '../../../common/globals';
import { terms } from '../../../terms';
import { Roles } from '../../../users/roles';
import { Users } from '../../../users/users';
import { Branch } from '../../branch/branch';
import { Photo } from '../photo';
// import S3 from 'aws-sdk/clients/s3'
// import * as AWS from 'aws-sdk';
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
      for await (const p of this.remult.repo(Photo).query({
        where: { eid: this.args.entityId },
        orderBy: {created: 'desc'}
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
  
//eshel.app.hulon@gmail.com
getBranchFromEmail(email:string){
  let result = '';
  if(email && email.length > 0)
  { 
     result  = email.split('@')[0];
}
  return result;
}

  async onFileInput(e: any) {//eshel.app.hulon@gmail.com
    let branch = this.getBranchFromEmail(this.args.bid.email);
    let changed = await this.loadFiles(e.target.files,branch);
    if(changed){
      await this.refresh();
    }
  }

  private async loadFiles(files: any,branch:string) {
    let points = 0;
    if (files && files.length > 0) {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        // let f: File = file;
        let success = await this.upload(file,branch);
        console.log('success',success)
        if (success!) {
          console.log(file.type);
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
    if (['video/mp4', 'video/x-m4v', 'video/*', 'mp4', 'x-m4v'].includes(type)) {
      result = 500;
    }
    return result;
  }

  async upload(f: any,branch:string) {
    // console.log('__dirname', __dirname);
    let result = false;
    await new Promise(async (resolve, reject) => {

      // get secure url from our server//'http://localhost:3000' + 
      const s3SignUrl = `/api/s3Url?key=${'eshel-app-s3-key'}&f=${encodeURI(f.name)}&branch=${encodeURI(branch)}`;
      // console.log('s3SignUrl', s3SignUrl)
      const signRes = await fetch.default(s3SignUrl);
  
      if (signRes.ok) {
        // coso
        let link = await signRes.json();// JSON.parse(await url.text());// as AwsS3SignUrlResponse;
        // console.log('link', link)
        if(link && link.url && link.url.length > 0)
        // post the image direclty to the s3 bucket
        {
          const linkRes = await fetch.default(link.url, {
          method: "PUT",
          body: f        })

        if (linkRes.ok) {
          // console.log('linkRes.linkRes', linkRes)
          const imageUrl = link.url.split('?')[0]
          // console.log(imageUrl)
          await this.addPhoto(f.name, f.type, imageUrl)
          result = true;
        }
        else {
          // console.log('NOT OK')
          let message = `upload.link(${link}): { status: ${linkRes.status}, statusText: ${linkRes.statusText} }`;
          console.debug(message);
        }
      }else{
          // console.log('NOT OK')
          let message = `upload(${f.name}): upSigning Url Failed`;
          console.debug(message);}
      }
      else {
        let message = `upload(${f.name}): { status: ${signRes.status}, statusText: ${signRes.statusText} }`;
        console.debug(message);
      }
    });
    return result;
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

  async addPhoto(name: string, type: string, link: string): Promise<Photo> {
    let result = this.remult.repo(Photo).create();
    result.bid = this.args.bid;
    result.eid = this.args.entityId;
    result.title = name;
    result.type = type;
    result.link = link;
    await result.save();
    this.args.changed = true;
    return result;
  }
}



// async upload3(f: any) {
//   // console.log('__dirname', __dirname);
//   let result = false;
//   await new Promise(async (resolve, reject) => {
//     let link = 'https://eshel-app.s3.eu-central-1.amazonaws.com/coupon_image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA24G2HKRO67SUB52I%2F20220103%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20220103T232519Z&X-Amz-Expires=60&X-Amz-Signature=fe06357c11ca74cab03d5231fc4422d1cb946cd3a47fe040cae34932bf832d22&X-Amz-SignedHeaders=host';
//     const linkRes = await fetch.default(link, {
//       method: "PUT",
//       body: f
//     })

//     if (linkRes.ok) {
//       console.log(linkRes.url)
//       await this.addPhoto(f.name, f.type, linkRes.url)
//       result = true;
//     }
//     else {
//       let message = `upload.link(${link}): { status: ${linkRes.status}, statusText: ${linkRes.statusText} }`;
//       console.debug(message);
//     }
//   });
//   return result;
// }

// async upload2(f: any) {
//   // console.log('__dirname', __dirname);
//   let result = false;
//   await new Promise(async (resolve, reject) => {

//     // get secure url from our server//'http://localhost:3000' + 
//     const s3SignUrl = 'http://localhost:3000' + `/s3Url?key=${'eshel-app-s3-key'}&f=${encodeURI(f.name)}`;
//     console.log('s3SignUrl', s3SignUrl)
//     const signRes = await fetch.default(s3SignUrl);

//     if (signRes.ok) {
//       let link = await signRes.json();// JSON.parse(await url.text());// as AwsS3SignUrlResponse;
//       console.log('link', link)
//       console.log('result.url', link.url)
//       console.log('result.error', link.error)

//       // post the image direclty to the s3 bucket
//       const linkRes = await fetch.default(link, {
//         method: "PUT",
//         body: f
//       })

//       if (signRes.ok) {
//         let link = await signRes.json();
//         await this.addPhoto(f.name, f.type, link)
//         result = true;
//       }
//       else {
//         let message = `upload.link(${link}): { status: ${linkRes.status}, statusText: ${linkRes.statusText} }`;
//         console.debug(message);
//       }
//     }
//     else {
//       let message = `upload(${f.name}): { status: ${signRes.status}, statusText: ${signRes.statusText} }`;
//       console.debug(message);
//     }
//   });
//   return result;
// }

  // async addPhoto2(title: string, data: string): Promise<Photo> {
  //   let result = this.remult.repo(Photo).create();
  //   result.bid = this.args.bid;
  //   result.eid = this.args.entityId;
  //   result.title = title;
  //   result.data = data;
  //   await result.save();
  //   this.args.changed = true;
  //   return result;
  // }
  // await this.test(
  //   'https://eshel-app.s3.eu-central-1.amazonaws.com/coupon_image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA24G2HKRO67SUB52I%2F20220103%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20220103T204101Z&X-Amz-Expires=60&X-Amz-Signature=a5c92c84acd317b835ccb8b3b0063b725fd9768d29a28af8727e91c92103dd7a&X-Amz-SignedHeaders=host', 
  //   f);

  // async test(link: string, f: any) {
  //   // post the image direclty to the s3 bucket
  //   await fetch.default(link, {
  //     method: "PUT",
  //     // headers: {
  //     //   "Content-Type": "multipart/form-data"
  //     // },
  //     body: f
  //   })

  //   const imageUrl = link.split('?')[0]
  //   console.log(imageUrl)
  // }



  // this.addPhoto(this.args.bid, imageUrl)

  //   let aws = require('aws-sdk');
  //   const bucket = new aws.S3(
  //     {
  //       accessKeyId: s3Params.accessKeyId,
  //       secretAccessKey: s3Params.secretAccessKey,
  //       region: s3Params.region,
  //       ACL: 'bucket-owner-full-control'
  //     }
  //   );
  //   const params = {
  //     Bucket: s3Params.bucket,
  //     Key: f.name,
  //     Body: f
  //   };


  //   console.log('upload', 0);
  //   bucket.getBucketPolicy({ Bucket: s3Params.bucket }, function (err: any, data: any) {
  //     if (err) {
  //       console.log('upload', 10);
  //       console.log("Error", err);
  //     } else if (data) {
  //       console.log('upload', 11);
  //       console.log("Success", data.Policy);
  //     }
  //   });

  //   console.log('upload', 1);
  //   console.log(params);
  //   bucket.upload(params, async (err: any, data: any) => {
  //     if (data) {
  //       console.log('upload', 2);
  //       console.log("Video uploaded")
  //     }
  //     if (err) {
  //       console.log('upload', 3);
  //       console.log("Video uploaded failed")
  //     }
  //   });
  //   console.log('upload', 4);

  // for (let index = 0; index < e.target.files.length; index++) {
  //   const file = e.target.files[index];
  //   let f: File = file;
  //   PhotosAlbumComponent.uploadToAws(f.name);
  // }


  // s3.createBucket(params, function(err, data) {
  //     if (err) console.log(err, err.stack);
  //     else console.log('Bucket Created Successfully', data.Location);
  // }); 
  // if (changed) {
  //   await this.refresh();
  // }
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

  // private async loadFiles(files: any) {
  //   let points = 0;
  //   for (let index = 0; index < files.length; index++) {
  //     const file = files[index];
  //     let f: File = file;
  //     // console.log(f);
  //     // f.lastModified;
  //     // f.name;
  //     // f.size;
  //     // f.type;
  //     // f.webkitRelativePath;
  //     await new Promise((res) => {
  //       var fileReader = new FileReader();

  //       fileReader.onload = async (e: any) => {
  //         var img = new Image();

  //         var canvas = document.createElement("canvas");
  //         if (true) {
  //           img.onload = async () => {
  //             var ctx = canvas.getContext("2d");
  //             ctx!.drawImage(img, 0, 0);

  //             var MAX_WIDTH = 800;
  //             var MAX_HEIGHT = 600;
  //             var width = img.width;
  //             var height = img.height;

  //             if (width > height) {
  //               if (width > MAX_WIDTH) {
  //                 height *= MAX_WIDTH / width;
  //                 width = MAX_WIDTH;
  //               }
  //             } else {
  //               if (height > MAX_HEIGHT) {
  //                 width *= MAX_HEIGHT / height;
  //                 height = MAX_HEIGHT;
  //               }
  //             }
  //             canvas.width = width;
  //             canvas.height = height;

  //             let margin = 50;
  //             // canvas.pad?

  //             var ctx = canvas.getContext("2d");
  //             ctx!.drawImage(img, 0, 0, width, height);

  //             var dataurl = canvas.toDataURL("image/png");
  //             //console.log(dataurl);
  //             //create row in db

  //             let uimg = await this.addPhoto(f.name, dataurl);
  //             this.photos.push(uimg);


  //             // addImageInfo(imgId)


  //           }
  //           img.src = e.target.result.toString();
  //           // console.log(img.src)
  //         }
  //         //   this.image.image.value = e.target.result.toString();
  //         //   this.image.fileName.value = f.name;
  //         res({});
  //       };
  //       fileReader.readAsDataURL(f);
  //       points += pointsEachSuccessPhoto;
  //     });
  //   }
  //   if (points > 0) {
  //     let u = await this.remult.repo(Users).findId(this.remult.user.id);
  //     if (u) {
  //       u.points += points;
  //       await u.save();
  //       this.dialog.info(terms.youGotMorePoint.replace('!points!', points.toString()).replace('!sum!', u.points.toString()));
  //     }
  //   }
  // }
