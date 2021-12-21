import { Component, OnInit } from '@angular/core';
import { BackendMethod, Remult } from 'remult';
import { FILTER_IGNORE } from '../../../common/globals';
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

  isBoard() {
    return this.remult.isAllowed(Roles.board);
  }

  @BackendMethod({ allowed: true })
  static async retrievePhotos(page: number = 1, remult?: Remult) {
    let result = [] as PhotoDetails[];
    let photos = await remult!.repo(Photo).find({
      limit: 15,
      page: page,
      orderBy: r => r.created.descending(),
      where: r => remult!.isAllowed(Roles.board) ? FILTER_IGNORE : r.bid.contains(remult!.user.bid)
    });
    if (photos && photos.length > 0) {
      photos.forEach(p => {
        result.push({
          vname: p.createdBy?.name,
          created: p.created,
          data: p.data,
          link: p.link,
          bname: p.bid?.name
        });
      });
    }
    return result;
  }
}
