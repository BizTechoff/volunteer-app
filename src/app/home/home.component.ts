import { Component, OnInit } from '@angular/core';
import { BusyService } from '@remult/angular';
import { Remult } from 'remult';
import { interval } from 'rxjs';
import { DialogService } from '../common/dialog';
import { Photo } from '../core/photo/photo';
import { terms } from '../terms';
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

  currentPhoto = { id: '', link: '' };
  photos = [] as { id: string, link: string }[];
  // timer = interval(10000)
  //   .subscribe(async (val) => { await this.nextPhoto(); });

  async nextPhoto() {
    let next = await this.busy.donotWait(async () => await this.remult.repo(Photo)
      .findFirst({ id: { $ne: this.photos.map(itm => itm.id) } }));
    // let next = await this.remult.repo(Photo)
    //   .findFirst({ id: { $ne: this.photos.map(itm => itm.id) } });
    if (next) {
      this.currentPhoto = { id: next.id, link: next.link };
      this.photos.push(this.currentPhoto);
    }
    else if (this.photos.length > 0) {
      let i = this.getRandoxIndex();
      this.currentPhoto = this.photos[i];
    }
    console.log(JSON.stringify(this.currentPhoto));
  }

  getRandoxIndex() {
    let min = 0;
    let max = this.photos.length - 1;
    let rnd = Math.floor(Math.random() * (max - min) + min);
    return rnd;
  }

  async ngOnInit() {
    // // this.u = 
    // const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // wait(100)
    //   .then(async () => this.dialog.info(terms.reminder4FoodDelivery, 2300))
    //   .catch(err => console.debug(err));
  }
}

