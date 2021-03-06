import { Component, OnInit } from '@angular/core';
import { BusyService, openDialog } from '@remult/angular';
import { Remult } from 'remult';
import { interval, Subscription } from 'rxjs';
import { DialogService } from '../common/dialog';
import { Photo } from '../core/photo/photo';
import { terms } from '../terms';
import { UserLoginComponent } from '../users/user-login/user-login.component';
import { Users } from '../users/users';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  u: Users = new Users(this.remult, this.dialog)
  logo: string = 'assets/output-onlinepngtools.png';
  photo: string = 'https://eshel-app.s3.eu-central-1.amazonaws.com/eshel.app.ness.tziyona/%D7%94%D7%A8%D7%91%D7%99.jpeg';
  video: string = 'https://eshel-app.s3.eu-central-1.amazonaws.com/eshel.app.ness.tziyona/app.mp4';
  constructor(public remult: Remult, private dialog: DialogService, private busy: BusyService) { }
  terms = terms;

  timer: Subscription = undefined!;
  currentPhoto = { id: '', link: '', name: '', created: new Date() };
  photos = [] as { id: string, link: string, name: string, created: Date }[];
  currentPhotoSocial = { id: '', link: '', name: '', created: new Date() };
  photosSocial = [] as { id: string, link: string, name: string, created: Date }[];

  // timer = undefined!;
  async signIn() {
    await openDialog(UserLoginComponent);
  }

  setTitle() {
    terms.home = 'שלום ' + this.remult.user.name;
  }

  tries = 5;
  async nextPhoto() {
    // let next: Photo = undefined!
    // if (this.photos.length < 30 && this.tries > 0) {
    //   next = await this.busy.donotWait(async () => await this.remult.repo(Photo)
    //     .findFirst({
    //       id: { $ne: this.photos.map(itm => itm.id) },
    //       type: { $contains: 'image' }
    //     }));
    // }
    // if (next) {
    //   let f = this.photos.find(p => p.id === next.id);
    //   if (f) {
    //     --this.tries;
    //     this.currentPhoto = f;
    //   }
    //   else {
    //     this.tries = 5;
    //     this.currentPhoto = { id: next.id, link: next.link, name: next.createdBy.name, created: next.created };
    //     this.photos.push(this.currentPhoto);
    //   }
    // }
    // else if (this.photos.length > 0) {
    //   let i = this.getRandoxIndex();
    //   this.currentPhoto = this.photos[i];
    // }
    if (this.photosSocial.length > 0) {
      let min = 0
      let max = this.photosSocial.length - 1
      let i = Math.floor(Math.random() * (max - min) + min)
      this.currentPhotoSocial = this.photosSocial[i]
    }
    if (this.photosSocial.length > 0) {
      let min = 0
      let max = this.photos.length - 1 // floor([0-1] * 3) = floor([0.1,0.5,0.9]*3)
      let i = Math.floor(Math.random() * (max - min) + min)
      this.currentPhoto = this.photos[i]
    }
  }

  getRandoxIndex() {
    let min = 0;
    let max = this.photos.length - 1;
    let rnd = Math.floor(Math.random() * (max - min) + min);
    return rnd;
  }

  async ngOnInit() {

    this.photosSocial.push({ name: '1', created: new Date(), id: '1', link: 'https://eshel-app.s3.eu-central-1.amazonaws.com/social/vv_001.jpeg' })
    this.photosSocial.push({ name: '2', created: new Date(), id: '2', link: 'https://eshel-app.s3.eu-central-1.amazonaws.com/social/vv_002.jpeg' })
    this.photosSocial.push({ name: '3', created: new Date(), id: '3', link: 'https://eshel-app.s3.eu-central-1.amazonaws.com/social/vv_003.jpeg' })
    this.photosSocial.push({ name: '4', created: new Date(), id: '4', link: 'https://eshel-app.s3.eu-central-1.amazonaws.com/social/vv_004.jpeg' })

    for await (const p of this.remult.repo(Photo).query({
      where: { type: { $contains: 'image' } },
      pageSize: 15,
      orderBy: { created: 'desc' }
    })) {
      this.photos.push({ id: p.id, link: p.link, name: p.createdBy.name, created: p.created })
    }

    await this.nextPhoto();
    this.timer = interval(3000)
      .subscribe(async (val) => { await this.nextPhoto(); });
    // console.log('this.photos.length', this.photos.length)
  }

  ngOnDestroy() {
    if (this.timer) {
      this.timer.unsubscribe();
      this.timer = undefined!;
    }
  }

}

