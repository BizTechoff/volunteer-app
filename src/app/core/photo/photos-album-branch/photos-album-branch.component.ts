import { Component, OnInit } from '@angular/core';
import { BackendMethod, Remult } from 'remult';
import { PhotoDetails } from '../../../common/types';
import { Roles } from '../../../users/roles';
import { Photo } from '../photo';

@Component({
  selector: 'app-photos-album-branch',
  templateUrl: './photos-album-branch.component.html',
  styleUrls: ['./photos-album-branch.component.scss']
}) 
export class PhotosAlbumBranchComponent implements OnInit {

  photos: PhotoDetails[] = [] as PhotoDetails[];
  page: number = 1;
  showViewer = false;
  selectedImage!: PhotoDetails;

  constructor(private remult: Remult) { }

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    this.page = 1;
    this.photos = await PhotosAlbumBranchComponent.retrievePhotos();
  }

  async nextPage() {
    ++this.page;
    this.photos = await PhotosAlbumBranchComponent.retrievePhotos(this.page);
  }

  setSelectedImage(add: number) {
    if (this.photos.length > 0) {
      if (this.selectedImage) {
        if (this.photos.length > 1) {
          let f = this.photos.find(itm => itm.link === this.selectedImage.link);
          if (f) {
            let i = this.photos.indexOf(f);
            if (i === 0) {// 0,1,2,3 => i=0
              // i += add;
              // Math.max(0, i);
              // Math.min(this.photos.length - 1, i);
              if (add === +1) {
                this.selectedImage = this.photos[i + add];
              }
              else if (add === -1) {
                this.selectedImage = this.photos[this.photos.length - 1];
              }
            }
            else if (i === this.photos.length - 1) {
              if (add === +1) {
                this.selectedImage = this.photos[0];
              }
              else if (add === -1) {
                this.selectedImage = this.photos[i + add];//+-=-
              }
            }
            else{
                this.selectedImage = this.photos[i + add];//+-=-
            }
          }
        }
        else {
          console.debug('setPrevSelectedImage.this.photos.find() return NULL (selectedImage NOT found in photos)');
        }
      }
      else {
        this.selectedImage = this.photos[0];
      }
    } else {
      this.selectedImage = undefined!;
    }
  }

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  @BackendMethod({ allowed: true })
  static async retrievePhotos(page: number = 1, remult?: Remult) {
    let result = [] as PhotoDetails[];
    let photos = await remult!.repo(Photo).find({
      limit: 15,
      page: page,
      orderBy: { created: "desc" },
      where: { bid: remult?.branchAllowedForUser() }
    });
    if (photos && photos.length > 0) {
      photos.forEach(p => {
        result.push({
          vname: p.createdBy?.name,
          created: p.created,
          type: p.type, 
          link: p.link,
          bname: p.bid?.name
        });
      });
    }
    return result; 
  }
}
