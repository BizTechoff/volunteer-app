import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { getFields, Remult } from 'remult';
import { DialogService } from '../../../common/dialog';
import { terms } from '../../../terms';
import { Photo } from '../photo';

@Component({
  selector: 'app-photos-album',
  templateUrl: './photos-album.component.html',
  styleUrls: ['./photos-album.component.scss']
})
export class PhotosAlbumComponent implements OnInit {

  @Input()
  entityId: string = '';

  args: {
    entityId: string,
    changed?: boolean
  } = { entityId: '', changed: false };

  photos = [] as Photo[];
  terms = terms;
  // @Field({ caption: terms.branch })
  // bid: string = '';
  get $() { return getFields(this, this.remult) };

  constructor(private remult: Remult, private dialog: DialogService, private win: MatDialogRef<any>) { }

  async ngOnInit() {
    if (!this.args) {
      this.args = { entityId: '', changed: false };
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
      });
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
    result.eid = this.args.entityId;
    result.title = title;
    result.data = data;
    await result.save();
    this.args.changed = true;
    return result;
  }
}
